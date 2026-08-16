#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ARTIC Marketplace — Server Deployment Script
# Server: 102.37.128.81
# Ports: Frontend :3010 | Backend :5010 | Redis :6380
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "🚀 Starting ARTIC Marketplace deployment..."

PROJECT_DIR="/home/Articgroup/artic-marketplace"

# ─── 1. Clone or pull latest code ────────────────────────────────────────────
if [ -d "$PROJECT_DIR" ]; then
  echo "📥 Pulling latest code..."
  cd "$PROJECT_DIR"
  git pull origin main
else
  echo "📥 Cloning repository..."
  mkdir -p /home/Articgroup
  git clone https://github.com/Byiringiro24/Final_Artic_Market_Place.git "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

# ─── 2. Set up backend production env ────────────────────────────────────────
echo "⚙️  Setting up backend environment..."
cp backend/.env.production backend/.env

# ─── 3. Create the Market_Place database if it doesn't exist ─────────────────
echo "🗄️  Ensuring Market_Place database exists..."
PGPASSWORD='Artic$2026' psql -U artic_user -h localhost -p 5432 -d postgres \
  -c "SELECT 1 FROM pg_database WHERE datname='Market_Place';" | grep -q 1 || \
  PGPASSWORD='Artic$2026' psql -U artic_user -h localhost -p 5432 -d postgres \
  -c 'CREATE DATABASE "Market_Place" OWNER artic_user ENCODING UTF8;'

# ─── 4. Stop existing containers ─────────────────────────────────────────────
echo "🛑 Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

# ─── 5. Build and start ───────────────────────────────────────────────────────
echo "🔨 Building Docker images..."
docker compose build --no-cache

echo "▶️  Starting services..."
docker compose up -d

# ─── 6. Wait for backend to be ready ────────────────────────────────────────
echo "⏳ Waiting for backend to start..."
sleep 15

# ─── 7. Run Prisma migrations ────────────────────────────────────────────────
echo "🗃️  Running database migrations..."
docker exec artic_marketplace_backend npx prisma migrate deploy

# ─── 8. Seed database (only if empty) ───────────────────────────────────────
echo "🌱 Checking if database needs seeding..."
PRODUCT_COUNT=$(PGPASSWORD='Artic$2026' psql -U artic_user -h localhost -p 5432 -d "Market_Place" \
  -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | xargs)

if [ "$PRODUCT_COUNT" = "0" ] || [ -z "$PRODUCT_COUNT" ]; then
  echo "🌱 Seeding database with demo data..."
  docker exec artic_marketplace_backend node dist/db/seed.js
else
  echo "✅ Database already has data — skipping seed"
fi

# ─── 9. Health check ────────────────────────────────────────────────────────
echo "🏥 Running health check..."
sleep 5
curl -sf http://localhost:5010/health && echo "✅ Backend healthy" || echo "⚠️  Backend health check failed"

echo ""
echo "════════════════════════════════════════════════════"
echo "✅ ARTIC Marketplace deployed successfully!"
echo ""
echo "  Frontend:  http://102.37.128.81:3010"
echo "  Backend:   http://102.37.128.81:5010/api/v1"
echo "  API Docs:  http://102.37.128.81:5010/api/docs"
echo ""
echo "  Admin:     admin@articmarketplace.com / Admin@123"
echo "  User:      john@example.com / User@123"
echo "════════════════════════════════════════════════════"
