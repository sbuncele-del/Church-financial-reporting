#!/bin/bash
# ============================================================
# Vultr VPS Initial Setup Script
# Church Financial Reporting System
# Run this ONCE on a fresh Ubuntu 24.04 server
# Usage: ssh root@139.84.231.20 'bash -s' < deploy/setup-server.sh
# ============================================================

set -euo pipefail

echo "=========================================="
echo "  Church Financial Reporting - Server Setup"
echo "=========================================="

# --- System Updates ---
echo "[1/8] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# --- Install Docker ---
echo "[2/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "  Docker already installed."
fi

# --- Install Docker Compose Plugin ---
echo "[3/8] Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
else
    echo "  Docker Compose already installed."
fi

# --- Install useful tools ---
echo "[4/8] Installing utilities..."
apt-get install -y git curl wget htop ufw fail2ban

# --- Configure Firewall ---
echo "[5/8] Configuring firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# --- Setup Swap (important for 1GB RAM) ---
echo "[6/8] Setting up 2GB swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # Optimize swap usage for low-memory server
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    sysctl vm.vfs_cache_pressure=50
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
else
    echo "  Swap already configured."
fi

# --- Create app directory ---
echo "[7/8] Creating application directory..."
mkdir -p /opt/church-app
chown root:root /opt/church-app

# --- Configure Fail2Ban ---
echo "[8/8] Configuring Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban

echo ""
echo "=========================================="
echo "  Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Clone your repo or upload files to /opt/church-app"
echo "  2. Copy .env.production to /opt/church-app/.env"
echo "  3. Run: cd /opt/church-app && docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "Server info:"
echo "  IP: $(hostname -I | awk '{print $1}')"
echo "  RAM: $(free -h | awk '/Mem:/{print $2}')"
echo "  Swap: $(free -h | awk '/Swap:/{print $2}')"
echo "  Disk: $(df -h / | awk 'NR==2{print $4}') available"
echo ""
