# 🛍️ ARTIC MARKETPLACE

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Amazon-grade e-commerce platform — fully separated backend & frontend**

[Live Demo](#) · [API Docs](http://localhost:5000/api/docs) · [Setup Guide](./SETUP.md)

</div>

---

## ✨ What's Inside

### User Portal
- 🏠 **Homepage** — Hero carousel, category grid, featured products, deals section, browsing history
- 🔍 **Smart Search** — Full-text search with live autocomplete, filters (price, rating, category, brand), sort options
- 📦 **Product Detail** — Multi-image gallery with zoom, variant selector (color/size), buy box, related products
- 🛒 **Cart** — Real-time sidebar cart with quantity controls, persistent across sessions
- 💳 **Checkout** — 3-step flow (Address → Payment → Review), Stripe + PayPal + Cash on Delivery
- 📋 **Order Tracking** — Visual status timeline, tracking number, invoice, cancel request
- ❤️ **Wishlist** — Save and manage favourite products
- ⭐ **Reviews** — Star ratings, verified purchase badge, helpful votes, admin reply
- 👤 **Account** — Profile, addresses, order history, notifications, password change
- 🌍 **i18n** — English, French, Arabic (RTL) with instant switching

### Admin Portal (`/admin`)
| Section | Features |
|---------|---------|
| **Dashboard** | KPI cards, revenue chart, category pie chart, recent orders, low-stock alerts |
| **Products** | Full CRUD, bulk publish/unpublish, image upload, markdown description, SEO fields |
| **Categories** | Nested category tree, create/edit/deactivate |
| **Orders** | Status updates, tracking numbers, auto-email on status change, refund flow |
| **Users** | Role management (User/Admin/Seller), activate/deactivate, order history |
| **Reviews** | Moderation queue, approve/reject, admin reply |
| **Promotions** | Coupons (%, fixed, free shipping), usage limits, expiry dates |
| **Banners** | Homepage carousel management, drag-to-reorder, schedule |
| **Web Pages (CMS)** | Create/edit any page with Markdown, slug-based routing |
| **Shipping** | Zones, rates, free threshold, estimated delivery days |
| **Reports** | Revenue, products, users, category breakdowns |
| **Settings** | Site info, SMTP/email config, payment methods, SEO, social links |

---

## 🏗️ Architecture

```
Final_Artic_Market_Place/
├── backend/          ← Node.js · Express · PostgreSQL · Prisma · Redis
└── frontend/         ← Next.js 15 · React 19 · Tailwind · shadcn/ui
```

**Completely separated** — frontend calls backend REST API. Can be deployed independently.

### Backend Stack
- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4 with TypeScript
- **Database:** PostgreSQL 16 via Prisma ORM (20 tables)
- **Cache:** Redis 7 (sessions, rate limiting, query cache)
- **Auth:** JWT (access + refresh tokens), bcrypt passwords
- **Email:** Nodemailer SMTP + React Email templates
- **Payments:** Stripe PaymentIntents, PayPal SDK
- **Files:** Local upload with Sharp image processing
- **Docs:** Swagger/OpenAPI at `/api/docs`
- **Logging:** Winston + daily rotating files
- **Security:** Helmet, CORS, rate limiting, Zod validation

### Frontend Stack
- **Framework:** Next.js 15 App Router + React 19
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI)
- **State:** Zustand (cart + auth, persisted)
- **Server State:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **i18n:** next-intl (EN/FR/AR)
- **Charts:** Recharts
- **Theme:** next-themes (dark/light/system)

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Byiringiro24/Final_Artic_Market_Place.git
cd Final_Artic_Market_Place

# Start database + Redis
docker-compose up -d postgres redis

# Backend
cd backend && cp .env.example .env
# → edit .env (add JWT secrets, SMTP creds)
npm install && npx prisma migrate dev && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && cp .env.example .env.local
npm install && npm run dev
```

**→ Open:** http://localhost:3000/en-US

📖 Full setup guide: **[SETUP.md](./SETUP.md)**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@articmarketplace.com | Admin@123 |
| **User** | john@example.com | User@123 |

---

## 📡 API Reference

All endpoints under `/api/v1/`:

| Resource | Endpoints |
|---------|----------|
| Auth | `POST /auth/register` `POST /auth/login` `POST /auth/logout` `POST /auth/refresh-token` `POST /auth/forgot-password` `POST /auth/reset-password` |
| Products | `GET /products` `GET /products/:slug` `POST /products` `PUT /products/:id` `DELETE /products/:id` |
| Categories | `GET /categories` `POST /categories` `PUT /categories/:id` |
| Orders | `POST /orders` `GET /orders/my-orders` `GET /orders/:id` `PUT /orders/:id/status` |
| Cart | `GET /cart` `POST /cart` `PUT /cart/:id` `DELETE /cart/:id` |
| Wishlist | `GET /wishlist` `POST /wishlist` `DELETE /wishlist/:productId` |
| Reviews | `GET /reviews/product/:id` `POST /reviews` `PUT /reviews/:id/moderate` |
| Promotions | `POST /promotions/validate` `GET /promotions` |
| Users | `GET /users/addresses` `POST /users/addresses` `PUT /users/profile` |
| Admin | `GET /admin/dashboard` `GET /admin/users` `PUT /admin/users/:id` |
| Payments | `POST /payments/create-intent` |
| Settings | `GET /settings` `PUT /settings` |

Interactive docs: **http://localhost:5000/api/docs**

---

## 🔒 Security Features

- JWT access tokens (15min) + refresh tokens (7 days, HTTP-only cookie)
- bcrypt password hashing (12 rounds)
- Rate limiting: 200 req/15min general, 10 req/15min on auth routes
- Helmet security headers (CSP, X-Frame-Options, etc.)
- Zod input validation on every endpoint
- Role-based access control (USER / ADMIN / SELLER)
- SMTP credentials stored in DB (admin-configurable, never in code)
- Image upload validation (MIME type + size limits)

---

## 📧 Email System (SMTP)

All emails are sent via Nodemailer with configurable SMTP. Admin can change SMTP settings from the dashboard without redeploying.

| Template | Trigger |
|---------|---------|
| Welcome | New registration |
| Email Verification | After signup |
| Order Confirmation | Order placed |
| Password Reset | Forgot password |
| Order Status Updates | Admin changes status |
| Review Request | 3 days after delivery |
| Low Stock Alert | Stock ≤ 5 (admin only) |

**Supported providers:** Gmail, SendGrid, Mailgun, AWS SES, any SMTP server.

---

## 🐳 Docker

Full stack with one command:

```bash
docker-compose up --build
docker exec artic_backend npm run seed
```

Services: `artic_frontend` (:3000) · `artic_backend` (:5000) · `artic_postgres` (:5432) · `artic_redis` (:6379)

---

## 📁 Key Files

```
backend/
  prisma/schema.prisma     ← Complete database schema (20 tables)
  src/server.ts            ← Express app entry point
  src/db/seed.ts           ← Demo data seeder
  src/lib/email.ts         ← SMTP email system
  src/lib/scheduler.ts     ← Background jobs (review requests, low stock)

frontend/
  app/[locale]/            ← All pages with locale prefix
  components/layout/       ← Header, Footer, SearchBar, NavCategories
  components/product/      ← ProductCard, StarRating
  store/cart.store.ts      ← Zustand cart (persisted to localStorage)
  store/auth.store.ts      ← Zustand auth state
  lib/api.ts               ← Axios client with auto token refresh
  types/index.ts           ← All TypeScript types
```

---

## 👤 Author

**Byiringiro24** · [GitHub](https://github.com/Byiringiro24)

Based on original work by [EmmanuelSHYIRAMBERE](https://github.com/EmmanuelSHYIRAMBERE)

---

<div align="center">
  <sub>Built with ❤️ — ARTIC Marketplace 2026</sub>
</div>
