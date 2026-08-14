# 🛍️ ARTIC MARKETPLACE

> Amazon-grade e-commerce platform — Next.js 15 + Node.js + PostgreSQL + Redis

**Monorepo with separated frontend and backend for clean architecture and independent scalability.**

| Portal | URL |
|--------|-----|
| User Store | `http://localhost:3000` |
| Admin Dashboard | `http://localhost:3000/admin` |
| Backend API | `http://localhost:5000/api/v1` |
| API Docs | `http://localhost:5000/api/docs` |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Byiringiro24/Final_Artic_Market_Place.git
cd Final_Artic_Market_Place

# 2. Start infrastructure
docker-compose up -d

# 3. Backend setup
cd backend
cp .env.example .env      # fill in your values
npm install
npx prisma migrate dev
npm run seed
npm run dev               # runs on :5000

# 4. Frontend setup (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev               # runs on :3000
```

## Structure

```
Final_Artic_Market_Place/
├── backend/          # Node.js + Express + Prisma + PostgreSQL
├── frontend/         # Next.js 15 + React 19 + Tailwind + shadcn/ui
├── docker-compose.yml
└── README.md
```

See `ARTIC_MARKETPLACE_PROJECT_DOCUMENT.md` for full architecture spec.
