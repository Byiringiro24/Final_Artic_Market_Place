import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { prisma } from './db/prisma';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { setupSwagger } from './lib/swagger';
import { startScheduler } from './lib/scheduler';

// ─── Route Imports ─────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import brandRoutes from './routes/brand.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import reviewRoutes from './routes/review.routes';
import promotionRoutes from './routes/promotion.routes';
import bannerRoutes from './routes/banner.routes';
import webPageRoutes from './routes/webPage.routes';
import shippingRoutes from './routes/shipping.routes';
import taxRoutes from './routes/tax.routes';
import settingRoutes from './routes/setting.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import webhookRoutes from './routes/webhook.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Static file serving for uploads ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads/images', express.static(path.join(process.cwd(), 'uploads', 'images')));
app.use('/uploads/videos', express.static(path.join(process.cwd(), 'uploads', 'videos')));

// ─── Stripe Webhooks (raw body required before json parser) ────────────────────
app.use('/api/v1/webhooks', webhookRoutes);

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ─── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/brands`, brandRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/cart`, cartRoutes);
app.use(`${API}/wishlist`, wishlistRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/promotions`, promotionRoutes);
app.use(`${API}/banners`, bannerRoutes);
app.use(`${API}/pages`, webPageRoutes);
app.use(`${API}/shipping`, shippingRoutes);
app.use(`${API}/taxes`, taxRoutes);
app.use(`${API}/settings`, settingRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/upload`, uploadRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/payments`, paymentRoutes);

// ─── Swagger Docs ──────────────────────────────────────────────────────────────
setupSwagger(app);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected via Prisma');

    // Redis is optional — don't block startup
    logger.info('ℹ️  Redis: optional cache (connecting in background)');

    app.listen(PORT, () => {
      logger.info(`🚀 ARTIC API running on http://localhost:${PORT}/api/v1`);
      logger.info(`📚 API Docs at http://localhost:${PORT}/api/docs`);
      startScheduler();
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — graceful shutdown');
  await prisma.$disconnect();
  process.exit(0);
});
