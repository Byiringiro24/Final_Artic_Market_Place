import express, { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma';
import { sendEmail } from '../lib/email';
import { logger } from '../lib/logger';
import { stripe } from '../lib/stripe';

const router = Router();

router.post(
  '/stripe',
  // Stripe verifies the exact request bytes; parse JSON only after this route.
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      return res.status(400).json({ message: 'Missing stripe-signature header' });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      logger.error('Stripe webhook signature verification failed:', err);
      return res.status(400).json({ message: 'Webhook signature verification failed' });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: { select: { name: true, email: true } } },
          });
          if (!order || order.paymentMethod !== 'STRIPE' || order.stripePaymentIntentId !== intent.id) {
            logger.error(`Stripe payment intent ${intent.id} did not match a Stripe order`);
            return res.status(400).json({ message: 'Order/payment mismatch' });
          }
          if (intent.currency !== 'usd' || intent.amount !== Math.round(Number(order.totalPrice) * 100)) {
            logger.error(`Stripe amount validation failed for order ${order.orderNumber}`);
            return res.status(400).json({ message: 'Payment amount mismatch' });
          }
          if (order.isPaid) break;
          if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
            logger.warn(`Received a successful payment for closed order ${order.orderNumber}`);
            break;
          }

          const confirmed = await prisma.$transaction(async (tx) => {
            const result = await tx.order.updateMany({
              where: { id: order.id, paymentMethod: 'STRIPE', stripePaymentIntentId: intent.id, isPaid: false, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
              data: {
                isPaid: true,
                paidAt: new Date(),
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
                paymentResult: { id: intent.id, status: intent.status, amount: intent.amount },
              },
            });
            if (result.count !== 1) return false;
            await tx.orderStatusHistory.create({
              data: { orderId: order.id, status: 'CONFIRMED', note: 'Payment confirmed via Stripe' },
            });
            return true;
          });

          if (confirmed && order.user) {
            await sendEmail({
              to: order.user.email,
              toName: order.user.name,
              subject: `Payment Confirmed — ${order.orderNumber}`,
              template: 'payment-confirmed',
              html: `<h2>Payment of $${order.totalPrice} confirmed for order ${order.orderNumber}</h2>`,
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await prisma.order.updateMany({
            where: { id: orderId, paymentMethod: 'STRIPE', stripePaymentIntentId: intent.id, isPaid: false },
            data: { paymentStatus: 'FAILED' },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
        const intent = paymentIntentId ? await stripe.paymentIntents.retrieve(paymentIntentId) : null;
        const orderId = intent?.metadata?.orderId;
        if (orderId) {
          const fullyRefunded = charge.refunded;
          const updated = await prisma.order.updateMany({
            where: { id: orderId, paymentMethod: 'STRIPE', paymentStatus: { not: 'REFUNDED' } },
            data: {
              paymentStatus: fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
              ...(fullyRefunded ? { status: 'REFUNDED' } : {}),
            },
          });
          if (updated.count && fullyRefunded) {
            await prisma.orderStatusHistory.create({
              data: { orderId, status: 'REFUNDED', note: 'Stripe refund completed' },
            });
          }
        }
        break;
      }

      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
