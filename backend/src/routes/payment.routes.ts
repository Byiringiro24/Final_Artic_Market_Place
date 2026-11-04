import { Router } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getStripeClient } from '../lib/stripe';

const router = Router();

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
      stripePaymentIntentId: true,
      updatedAt: true,
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
  const stripe = getStripeClient();

  const amountInCents = Math.round(Number(order.totalPrice) * 100);
  if (amountInCents < 50) throw new AppError('Stripe requires a payment of at least $0.50', 400);

  if (order.stripePaymentIntentId) {
    const existingIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (existingIntent.status !== 'canceled') {
      return ApiResponse.success(res, {
        clientSecret: existingIntent.client_secret,
        paymentIntentId: existingIntent.id,
        amount: amountInCents,
      });
    }
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
    },
    automatic_payment_methods: { enabled: true },
  }, {
    idempotencyKey: order.stripePaymentIntentId
      ? `order-${order.id}-retry-${order.updatedAt.getTime()}`
      : `order-${order.id}`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripePaymentIntentId: paymentIntent.id } });

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
