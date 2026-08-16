# 🪟 Windows Setup Guide — ARTIC Marketplace

This guide uses **PowerShell** (not CMD). Note: PowerShell uses `;` not `&&` between commands.

---

## Step 1 — Create the Database

Open **pgAdmin 4** (installed with PostgreSQL), or open **SQL Shell (psql)** from the Start menu.

In pgAdmin or SQL Shell, run:

```sql
-- Create the database
CREATE DATABASE artic_marketplace;

-- Create a dedicated user (optional but recommended)
CREATE USER artic_user WITH PASSWORD 'artic_secure_pass';
GRANT ALL PRIVILEGES ON DATABASE artic_marketplace TO artic_user;
```

Or if you prefer to use the `postgres` superuser directly, just note your PostgreSQL password from when you installed it.

---

## Step 2 — Update the Backend `.env`

Open `backend\.env` and update the `DATABASE_URL`:

```env
# If using the postgres superuser:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/artic_marketplace?schema=public"

# If you created artic_user above:
DATABASE_URL="postgresql://artic_user:artic_secure_pass@localhost:5432/artic_marketplace?schema=public"
```

---

## Step 3 — Install Backend Dependencies

```powershell
cd "d:\Projectts 2026\Final Market_Place\Final_Artic_Market_Place\backend"
npm install
```

---

## Step 4 — Run Prisma Migration (creates all tables)

```powershell
npx prisma migrate dev --name init
```

---

## Step 5 — Seed the Database (demo data)

```powershell
npm run seed
```

---

## Step 6 — Start the Backend

```powershell
npm run dev
```

Backend running at: **http://localhost:5000/api/v1**  
API Docs: **http://localhost:5000/api/docs**

---

## Step 7 — Setup Frontend (new PowerShell window)

```powershell
cd "d:\Projectts 2026\Final Market_Place\Final_Artic_Market_Place\frontend"
npm install
npm run dev
```

Frontend running at: **http://localhost:3000/en-US**

---

## Step 8 — Update Frontend `.env.local`

Open `frontend\.env.local` — it's already configured correctly:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ARTIC Marketplace
```

---

## Redis (Optional)

Redis is **not required** to run the app. Without it:
- API responses won't be cached (slightly slower)
- Rate limiting uses in-memory fallback
- Everything else works normally

To install Redis on Windows:
```powershell
# Option 1: Using Chocolatey
choco install redis-64

# Option 2: WSL2
wsl --install
# Then inside WSL: sudo apt install redis-server && redis-server

# Option 3: Use Upstash (free cloud Redis)
# https://upstash.com — copy the Redis URL to backend\.env
```

---

## Common Errors

### `&&` is not a valid statement separator
PowerShell uses `;` — example:
```powershell
# ❌ Wrong (CMD/bash syntax)
cd backend && npm install

# ✅ Correct (PowerShell)
cd backend; npm install

# ✅ Or better — specify full path with cwd
```

### `project name must not be empty` (Docker Compose)
You must run `docker-compose` from **inside** the project folder:
```powershell
cd "d:\Projectts 2026\Final Market_Place\Final_Artic_Market_Place"
docker-compose up -d postgres redis
```

### Prisma: `P1001` — Can't reach database
- Check PostgreSQL service is running: `Get-Service postgresql*`
- Verify `DATABASE_URL` password in `backend\.env`
- Make sure the database exists (Step 1 above)

### Port already in use
```powershell
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@articmarketplace.com | Admin@123 |
| **User** | john@example.com | User@123 |
