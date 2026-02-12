#!/bin/bash
# ============================================================
# SSL Setup Script - Church Financial Reporting System
# Obtains Let's Encrypt SSL certificate via Certbot
# Run AFTER DNS has propagated to 139.84.231.20
# ============================================================

set -euo pipefail

DOMAIN="churchexc.co.za"
EMAIL="admin@churchexc.co.za"
APP_DIR="/opt/church-app"

echo "=========================================="
echo "  SSL Certificate Setup"
echo "  Domain: ${DOMAIN}"
echo "=========================================="

# --- Step 1: Check DNS resolution ---
echo ""
echo "[1/6] Checking DNS resolution..."
RESOLVED_IP=$(dig +short ${DOMAIN} 2>/dev/null || echo "FAILED")
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "  Domain resolves to: ${RESOLVED_IP}"
echo "  Server IP:          ${SERVER_IP}"

if [ "${RESOLVED_IP}" != "${SERVER_IP}" ]; then
    echo ""
    echo "  WARNING: DNS not yet pointing to this server!"
    echo "  Expected: ${SERVER_IP}"
    echo "  Got:      ${RESOLVED_IP}"
    echo ""
    read -p "  Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "  Aborting. Update your DNS A record first."
        exit 1
    fi
fi

# --- Step 2: Install initial HTTP-only Nginx config ---
echo ""
echo "[2/6] Setting up HTTP-only Nginx for ACME challenge..."
cat > ${APP_DIR}/deploy/nginx/nginx.initial.conf << 'NGINX_CONF'
# Temporary HTTP-only config for SSL certificate acquisition
server {
    listen 80;
    server_name churchexc.co.za www.churchexc.co.za 139.84.231.20;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Proxy API requests (keep app working during setup)
    location /api {
        proxy_pass http://church-backend-prod:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONF

# --- Step 3: Switch to HTTP-only config and reload ---
echo ""
echo "[3/6] Switching Nginx to HTTP-only mode..."
docker cp ${APP_DIR}/deploy/nginx/nginx.initial.conf church-frontend-prod:/etc/nginx/conf.d/default.conf
docker exec church-frontend-prod nginx -s reload 2>/dev/null || docker restart church-frontend-prod
sleep 3

# Verify HTTP is working
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://${DOMAIN}/" 2>/dev/null || echo "000")
echo "  HTTP status for ${DOMAIN}: ${HTTP_STATUS}"

# --- Step 4: Create certbot webroot directory ---
echo ""
echo "[4/6] Preparing certbot volumes..."
docker volume create --name church-app_certbot_webroot 2>/dev/null || true
docker volume create --name church-app_ssl_certs 2>/dev/null || true

# Create a temporary certbot container to get the certificate
echo ""
echo "[5/6] Requesting SSL certificate from Let's Encrypt..."
docker run --rm \
    -v church-app_ssl_certs:/etc/letsencrypt \
    -v church-app_certbot_webroot:/var/www/certbot \
    --network church-prod-network \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN} \
    -d www.${DOMAIN} \
    --force-renewal

# --- Step 5: Create symlinks for Nginx ---
echo ""
echo "[6/6] Setting up SSL certificate paths..."

# Create a script to link certs inside the ssl_certs volume
docker run --rm \
    -v church-app_ssl_certs:/etc/letsencrypt \
    alpine sh -c "
        mkdir -p /etc/letsencrypt/nginx-ssl
        ln -sf /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /etc/letsencrypt/nginx-ssl/fullchain.pem
        ln -sf /etc/letsencrypt/live/${DOMAIN}/privkey.pem /etc/letsencrypt/nginx-ssl/privkey.pem
        ls -la /etc/letsencrypt/nginx-ssl/
    "

# --- Step 6: Restart with full SSL config ---
echo ""
echo "Restarting services with SSL configuration..."
cd ${APP_DIR}
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
sleep 10

# Verify HTTPS
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/health" 2>/dev/null || echo "000")
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" "http://${DOMAIN}/" 2>/dev/null || echo "000")

echo ""
echo "=========================================="
echo "  SSL Setup Complete!"
echo "=========================================="
echo ""
echo "  HTTPS status:    ${HTTPS_STATUS}"
echo "  HTTP redirect:   ${HTTP_REDIRECT} (should be 301)"
echo ""
echo "  Site:   https://${DOMAIN}"
echo "  API:    https://${DOMAIN}/api/docs"
echo ""
echo "  Certificates auto-renew via the certbot container."
echo ""
