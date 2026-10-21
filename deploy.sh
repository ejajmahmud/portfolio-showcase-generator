#!/usr/bin/env bash
# ========================================================
# 1-Click Production Deployment Script for Linux VPS
# ========================================================

set -e

echo "🚀 Starting Portfolio Showcase Studio Deployment..."

# 1. Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing Docker & Docker Compose..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# 2. Build and start containers
echo "🔨 Building Docker image (with Playwright Chromium & Fonts)..."
docker compose down || true
docker compose build --pull
docker compose up -d

# 3. Verify health
echo "⏳ Waiting for service to become healthy..."
sleep 5

if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo ""
    echo "========================================================"
    echo "✅ PORTFOLIO SHOWCASE STUDIO IS LIVE!"
    echo "========================================================"
    echo "Local Access: http://localhost:8000"
    echo "Public Access: http://$(curl -s ifconfig.me):8000"
    echo "========================================================"
else
    echo "⚠️ Service started. Check logs with: docker compose logs -f"
fi
