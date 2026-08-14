# 🚀 ARTIC Marketplace — Complete Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | 10+ | bundled with Node |
| Docker Desktop | Latest | [docker.com](https://docker.com) |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

---

## Option A — Docker (Recommended, Simplest)

Everything runs in containers with one command:

```bash
# 1. Clone
git clone https://github.com/Byiringiro24/Final_Artic_Market_Place.git
cd Final_Artic_Market_Place

# 2. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Edit backend/.env — minimum required:
#    DATABASE_URL (already set for Docker Postgres)
#    JWT_ACCESS_SECRET=any-long-random-string
#    JWT_REFRESH_SECRET=any-other-long-random-string

# 4. Start everything
docker-compose up --build

# 5. Seed the database (first time only)
docker exec artic_backend npm run seed
```

**Ports:**
- Frontend → http://localhost:3000
- Backend API → http://localhost:5000/api/v1
- API Docs → http://localhost:5000/api/docs
- PostgreSQL → localhost:5432
- Redis → localhost:6379

---

## Option B — Local Development (Manual)

### Step 1 — Start PostgreSQL & Redis via Docker

```bash
docker-compose up -d postgres redis
```

Or use local installs / cloud services.

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` — fill in all required values (see below).

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed          # loads demo data
npm run dev           # starts on :5000
```

### Step 3 — Frontend Setup

Open a new terminal:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` — set `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`

```bash
npm install
npm run dev           # starts on :3000
```

---

## Environment Variables

### Backend `.env` (Required fields)

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database — Docker default
DATABASE_URL="postgresql://artic_user:artic_secure_pass@localhost:5432/artic_marketplace"

# Redis — Docker default
REDIS_URL=redis://localhost:6379

# JWT — generate strong random strings
JWT_ACCESS_SECRET=generate_64_char_random
JWT_REFRESH_SECRET=generate_64_char_random_2
JWT_EMAIL_VERIFY_SECRET=generate_64_char_random_3
JWT_RESET_SECRET=generate_64_char_random_4

# SMTP — example using Gmail App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_FROM_NAME=ARTIC Marketplace
SMTP_FROM_EMAIL=noreply@articmarketplace.com

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (sandbox)
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_APP_SECRET=your_paypal_secret
```

### Frontend `.env.local` (Required fields)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@articmarketplace.com | Admin@123 |
| **User** | john@example.com | User@123 |

---

## Key URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000/en-US |
| Sign In | http://localhost:3000/en-US/sign-in |
| Admin Dashboard | http://localhost:3000/en-US/admin/overview |
| API Docs (Swagger) | http://localhost:5000/api/docs |
| Health Check | http://localhost:5000/health |

---

## Gmail SMTP Setup (2-minute setup)

1. Go to your Google Account → Security → 2-Step Verification (enable it)
2. Go to **App Passwords** → Generate new → select "Mail" / "Other"
3. Copy the 16-character password → use as `SMTP_PASSWORD`
4. Use your Gmail address as `SMTP_USER`

---

## Stripe Test Setup

1. Create account at [stripe.com](https://stripe.com)
2. Dashboard → Developers → API keys
3. Copy **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Copy **Secret key** → `STRIPE_SECRET_KEY`
5. For webhooks locally: `stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe`
6. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

**Test card:** `4242 4242 4242 4242` · Any future date · Any CVC

---

## Available npm Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot-reload |
| `npm run build` | TypeScript compile to `dist/` |
| `npm start` | Production server |
| `npm run seed` | Seed database with demo data |
| `npm run prisma:studio` | Open Prisma database GUI |
| `npm run prisma:migrate` | Run pending migrations |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
Final_Artic_Market_Place/
├── backend/                    # Node.js + Express + PostgreSQL
│   ├── prisma/
│   │   └── schema.prisma       # Full database schema (20 tables)
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API route definitions (20 routes)
│   │   ├── middleware/         # Auth, error, rate limit, validation
│   │   ├── lib/                # JWT, email, Redis, logger, validators
│   │   ├── emails/             # React Email templates
│   │   ├── db/                 # Prisma client + seeder
│   │   └── server.ts           # Express app entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Next.js 15 + React 19
│   ├── app/[locale]/
│   │   ├── (auth)/             # Sign in, Sign up, Reset password
│   │   ├── (home)/             # Homepage
│   │   ├── (root)/             # User portal pages
│   │   ├── admin/              # Admin portal (12 sections)
│   │   └── checkout/           # Checkout + Stripe payment
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Footer, Nav
│   │   ├── product/            # ProductCard, StarRating
│   │   ├── cart/               # CartSidebar
│   │   ├── home/               # HeroCarousel, CategoryGrid
│   │   └── skeletons/          # Loading skeletons
│   ├── store/                  # Zustand (cart + auth)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # API client, utils, query keys
│   ├── messages/               # i18n: EN, FR, AR
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Full stack orchestration
├── .gitignore
├── README.md
└── SETUP.md                    # This file
```

---

## Troubleshooting

**`prisma migrate dev` fails?**
→ Make sure PostgreSQL is running: `docker-compose up -d postgres`

**Frontend can't reach backend?**
→ Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` matches backend port

**Email not sending?**
→ For Gmail, make sure 2FA is on and you're using an App Password, not your login password

**Redis connection refused?**
→ Start Redis: `docker-compose up -d redis`

**Port 3000 already in use?**
→ `npx kill-port 3000` then `npm run dev`
