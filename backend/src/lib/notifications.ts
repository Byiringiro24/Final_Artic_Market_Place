import { prisma } from '../db/prisma';
import { NotificationType } from '@prisma/client';
import { logger } from './logger';

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(opts: CreateNotificationOptions): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        link: opts.link,
      },
    });
  } catch (error) {
    logger.error('Failed to create notification:', error);
    // Non-critical — swallow errors so main flow is not affected
  }
}

export async function createOrderNotification(
  userId: string,
  orderNumber: string,
  orderId: string,
  status: string
): Promise<void> {
  const messageMap: Record<string, { title: string; message: string; type: NotificationType }> = {
    CONFIRMED: {
      type: 'ORDER_CONFIRMED',
      title: 'Order Confirmed',
      message: `Your order ${orderNumber} has been confirmed and is being processed.`,
    },
    SHIPPED: {
      type: 'ORDER_SHIPPED',
      title: 'Order Shipped!',
      message: `Great news! Your order ${orderNumber} is on its way.`,
    },
    OUT_FOR_DELIVERY: {
      type: 'ORDER_SHIPPED',
      title: 'Out for Delivery',
      message: `Your order ${orderNumber} is out for delivery today.`,
    },
    DELIVERED: {
      type: 'ORDER_DELIVERED',
      title: 'Order Delivered 🎉',
      message: `Your order ${orderNumber} has been delivered. Enjoy!`,
    },
    CANCELLED: {
      type: 'ORDER_CANCELLED',
      title: 'Order Cancelled',
      message: `Your order ${orderNumber} has been cancelled.`,
    },
  };

  const notif = messageMap[status];
  if (!notif) return;

  await createNotification({
    userId,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    link: `/account/orders/${orderId}`,
  });
}
