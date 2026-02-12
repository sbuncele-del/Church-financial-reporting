#!/bin/bash
# ============================================================
# Deploy Script - Church Financial Reporting System
# Deploys from local machine to Vultr VPS
# 
# Usage: ./deploy/deploy.sh
# ============================================================

set -euo pipefail

# --- Configuration ---
SERVER_IP="139.84.231.20"
SERVER_USER="root"
APP_DIR="/opt/church-app"
SSH_CMD="ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP}"

echo "=========================================="
echo "  Deploying Church Financial Reporting"
echo "  Target: ${SERVER_IP}"
echo "=========================================="

# --- Step 1: Sync files to server ---
echo ""
echo "[1/4] Syncing project files to server..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.env' \
    --exclude 'test-results' \
    --exclude 'pptx_images' \
    --exclude '.devcontainer' \
    --exclude 'frontend/dist' \
    --exclude 'venv' \
    --exclude '.venv' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

# --- Step 2: Copy production env if not exists ---
echo ""
echo "[2/4] Setting up environment..."
${SSH_CMD} "
    if [ ! -f ${APP_DIR}/.env ]; then
        cp ${APP_DIR}/deploy/.env.production ${APP_DIR}/.env
        echo '  Created .env from template - EDIT IT with real secrets!'
        echo '  Run: nano ${APP_DIR}/.env'
    else
        echo '  .env already exists, keeping current values.'
    fi
"

# --- Step 3: Build and start with Docker Compose ---
echo ""
echo "[3/4] Building and starting containers..."
${SSH_CMD} "
    cd ${APP_DIR}
    docker compose -f docker-compose.prod.yml build --no-cache
    docker compose -f docker-compose.prod.yml up -d
"

# --- Step 4: Health check ---
echo ""
echo "[4/4] Running health check..."
sleep 10  # Wait for services to start

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_IP}/health" || echo "000")

if [ "$HEALTH_STATUS" == "200" ] || [ "$HEALTH_STATUS" == "301" ]; then
    echo ""
    echo "=========================================="
    echo "  Deployment SUCCESSFUL!"
    echo "=========================================="
    echo ""
    echo "  App:     https://churchexc.co.za"
    echo "  API:     https://churchexc.co.za/api/docs"
    echo "  Health:  https://churchexc.co.za/health"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  WARNING: Health check returned ${HEALTH_STATUS}"
    echo "=========================================="
    echo ""
    echo "  Check logs with:"
    echo "    ssh ${SERVER_USER}@${SERVER_IP} 'cd ${APP_DIR} && docker compose -f docker-compose.prod.yml logs'"
    echo ""
fi
