import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma';
import { sendEmail } from '../lib/email';
import { logger } from '../lib/logger';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

router.post(
  '/stripe',
  // Raw body required for Stripe signature verification
  (req: Request, res: Response, next) => {
    // express.raw middleware must be applied before this route in server.ts
    // body-parser skip for this route
    next();
  },
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
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              isPaid: true,
              paidAt: new Date(),
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              paymentResult: {
                id: intent.id,
                status: intent.status,
                amount: intent.amount,
              },
            },
            include: { user: { select: { name: true, email: true } } },
          });

          await prisma.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: 'CONFIRMED',
              note: 'Payment confirmed via Stripe',
            },
          });

          if (order.user) {
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
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'FAILED' },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const orderId = charge.metadata?.orderId;
        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
          });
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
