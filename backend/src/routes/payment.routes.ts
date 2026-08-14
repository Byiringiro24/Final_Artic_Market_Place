import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * POST /api/v1/payments/create-intent
 * Create a Stripe PaymentIntent for an order
 */
router.post('/create-intent', authenticate, async (req: AuthRequest, res) => {
  const { orderId } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      totalPrice: true,
      isPaid: true,
      userId: true,
      orderNumber: true,
      paymentMethod: true,
    },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    throw new AppError('Access denied', 403);
  }
  if (order.isPaid) throw new AppError('Order is already paid', 400);
  if (order.paymentMethod !== 'STRIPE') {
    throw new AppError('This order does not use Stripe payment', 400);
  }

  const amountInCents = Math.round(Number(order.totalPrice) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: req.user!.userId,
    },
    automatic_payment_methods: { enabled: true },
  });

  return ApiResponse.success(res, {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: amountInCents,
  });
});

/**
 * GET /api/v1/payments/status/:orderId
 * Check payment status for an order
 */
router.get('/status/:orderId', authenticate, async (req: AuthRequest, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      isPaid: true,
      paidAt: true,
      paymentStatus: true,
      paymentMethod: true,
      userId: true,
    },
  });

  if (!order) throw new AppError('Order not found', 404);
  if (order.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    throw new AppError('Access denied', 403);
  }

  return ApiResponse.success(res, {
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
  });
});

export default router;
