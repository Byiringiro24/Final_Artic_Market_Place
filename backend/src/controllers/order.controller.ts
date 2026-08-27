import { Request, Response } from 'express';
import { PaymentMethod, OrderStatus, NotificationType } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ApiResponse, buildPagination } from '../lib/apiResponse';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../lib/email';
import { createOrderNotification, createNotification } from '../lib/notifications';
import { format } from 'date-fns';

// ─── SSE: Admin broadcast ─────────────────────────────────────────────────────
// Map of connected admin SSE clients: userId → Response
const adminSseClients = new Map<string, Response>();

export function registerAdminSseClient(userId: string, res: Response) {
  adminSseClients.set(userId, res);
}

export function removeAdminSseClient(userId: string) {
  adminSseClients.delete(userId);
}

export interface AdminSseEvent {
  type: 'NEW_ORDER' | 'PAYMENT_PROOF' | 'PING';
  orderId?: string;
  orderNumber?: string;
  userName?: string;
  message?: string;
  totalPrice?: number;
}

export function broadcastAdminEvent(event: AdminSseEvent) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  adminSseClients.forEach((res) => {
    try { res.write(payload); } catch { /* client disconnected */ }
  });
}

// ─── Generate order number ────────────────────────────────────────────────────
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  return `ART-${year}-${String(count + 1).padStart(6, '0')}`;
}

// ─── Create Order ─────────────────────────────────────────────────────────────
export async function createOrder(req: AuthRequest, res: Response) {
  const {
    shippingAddressId, paymentMethod,
    couponCode, items,
  } = req.body;

  const userId = req.user!.userId;

  // Validate address belongs to user
  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId },
  });
  if (!address) throw new AppError('Shipping address not found', 404);

  // Validate and price items
  let itemsPrice = 0;
  const orderItems: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variantInfo: Record<string, string> | null;
  }> = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true, name: true, images: true,
        price: true, countInStock: true,
      },
    });

    if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
    if (product.countInStock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    const price = Number(product.price);
    itemsPrice += price * item.quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      image: product.images[0] || '',
      price,
      quantity: item.quantity,
      variantInfo: item.variantInfo || null,
    });
  }

  // Apply coupon
  let couponDiscount = 0;
  if (couponCode) {
    const coupon = await prisma.promotion.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    });

    if (!coupon) throw new AppError('Invalid or expired coupon code', 400);
    if (coupon.minOrderAmount && itemsPrice < Number(coupon.minOrderAmount)) {
      throw new AppError(
        `Minimum order of $${coupon.minOrderAmount} required for this coupon`,
        400
      );
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    if (coupon.type === 'PERCENTAGE') {
      couponDiscount = (itemsPrice * Number(coupon.value)) / 100;
      if (coupon.maxDiscountAmount) {
        couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscountAmount));
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      couponDiscount = Math.min(Number(coupon.value), itemsPrice);
    }

    await prisma.promotion.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Calculate totals
  const shippingPrice = itemsPrice >= 50 ? 0 : 9.99;
  const taxRate = 0.18;
  const subtotal = itemsPrice - couponDiscount;
  const taxPrice = parseFloat((subtotal * taxRate).toFixed(2));
  const totalPrice = parseFloat((subtotal + shippingPrice + taxPrice).toFixed(2));

  const expectedDelivery = new Date();
  expectedDelivery.setDate(expectedDelivery.getDate() + 5);

  const orderNumber = await generateOrderNumber();

  // Create the order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        shippingAddressId,
        paymentMethod,
        couponCode: couponCode?.toUpperCase(),
        couponDiscount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        expectedDelivery,
        status: 'PENDING',
        items: { create: orderItems },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    // Record status history
    await tx.orderStatusHistory.create({
      data: { orderId: newOrder.id, status: 'PENDING', note: 'Order placed' },
    });

    // Decrement stock
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { countInStock: { decrement: item.quantity } },
      });
    }

    // Clear cart items for ordered products
    const productIds = orderItems.map((i) => i.productId);
    await tx.cartItem.deleteMany({
      where: { userId, productId: { in: productIds } },
    });

    return newOrder;
  });

  // Send confirmation email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (user) {
    await sendEmail({
      to: user.email,
      toName: user.name,
      subject: `Order Confirmed — ${orderNumber}`,
      template: 'purchase-receipt',
      html: `
        <h1>Thank you for your order, ${user.name}!</h1>
        <p>Order number: <strong>${orderNumber}</strong></p>
        <p>Total: <strong>$${totalPrice}</strong></p>
        <p>Expected delivery: <strong>${format(expectedDelivery, 'MMM dd, yyyy')}</strong></p>
        <a href="${process.env.FRONTEND_URL}/account/orders/${order.id}">Track your order</a>
      `,
    });
  }

  // Notify all admins about the new order (SSE + DB notification)
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  await Promise.all(admins.map((admin) =>
    createNotification({
      userId: admin.id,
      type: 'ORDER_PLACED',
      title: '🛒 New Order Received',
      message: `${user?.name || 'A customer'} placed order ${orderNumber} — ${paymentMethod === 'MTN_MOMO' ? '📱 MoMo' : paymentMethod.replace(/_/g, ' ')} · $${totalPrice}`,
      link: `/admin/orders/${order.id}`,
    })
  ));

  broadcastAdminEvent({
    type: 'NEW_ORDER',
    orderId: order.id,
    orderNumber,
    userName: user?.name || 'Customer',
    message: `New order ${orderNumber} — $${totalPrice}`,
    totalPrice,
  });

  return ApiResponse.created(res, order, 'Order placed successfully');
}

// ─── Get My Orders ────────────────────────────────────────────────────────────
export async function getMyOrders(req: AuthRequest, res: Response) {
  const { page = '1', limit = '10', status } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: req.user!.userId };
  if (status) where.status = status.toUpperCase();

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { select: { name: true, image: true, quantity: true, price: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ApiResponse.paginated(res, orders, buildPagination(pageNum, limitNum, total));
}

// ─── Get Single Order ─────────────────────────────────────────────────────────
export async function getOrder(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { slug: true } } },
      },
      shippingAddress: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) throw new AppError('Order not found', 404);

  // Users can only see their own orders; admins see all
  if (
    req.user!.role !== 'ADMIN' &&
    order.userId !== req.user!.userId
  ) {
    throw new AppError('Access denied', 403);
  }

  return ApiResponse.success(res, order);
}

// ─── Admin: List All Orders ───────────────────────────────────────────────────
export async function adminListOrders(req: Request, res: Response) {
  const {
    page = '1', limit = '20', status,
    search, startDate, endDate,
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status.toUpperCase();
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { select: { name: true, quantity: true, price: true } },
        shippingAddress: { select: { city: true, country: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ApiResponse.paginated(res, orders, buildPagination(pageNum, limitNum, total));
}

// ─── Admin: Update Order Status ───────────────────────────────────────────────
export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status, trackingNumber, carrier, note } = req.body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!order) throw new AppError('Order not found', 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { status };
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (carrier) updateData.carrier = carrier;

  if (status === 'DELIVERED') {
    updateData.isDelivered = true;
    updateData.deliveredAt = new Date();
  }
  if (status === 'CANCELLED' || status === 'REFUNDED') {
    // Restore stock
    const items = await prisma.orderItem.findMany({ where: { orderId: id } });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { countInStock: { increment: item.quantity } },
      });
    }
  }

  const [updated] = await prisma.$transaction([
    prisma.order.update({ where: { id }, data: updateData }),
    prisma.orderStatusHistory.create({
      data: { orderId: id, status, note },
    }),
  ]);

  // Notify customer (email + in-app)
  const emailMap: Record<string, string> = {
    CONFIRMED: `Your order ${order.orderNumber} has been confirmed!`,
    SHIPPED: `Your order ${order.orderNumber} is on its way! Tracking: ${trackingNumber}`,
    DELIVERED: `Your order ${order.orderNumber} has been delivered. Enjoy!`,
    CANCELLED: `Your order ${order.orderNumber} has been cancelled.`,
  };

  if (emailMap[status] && order.user) {
    await Promise.all([
      sendEmail({
        to: order.user.email,
        toName: order.user.name,
        subject: `Order Update — ${order.orderNumber}`,
        template: `order-${status.toLowerCase()}`,
        html: `<h2>${emailMap[status]}</h2>`,
      }),
      createOrderNotification(order.userId, order.orderNumber, order.id, status),
    ]);
  }

  return ApiResponse.success(res, updated, 'Order status updated');
}

// ─── User: Cancel Order ───────────────────────────────────────────────────────
export async function cancelOrder(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError('Order not found', 404);
  if (order.userId !== req.user!.userId) throw new AppError('Access denied', 403);

  if (!['PENDING', 'CONFIRMED', 'PENDING_PAYMENT_PROOF', 'PAYMENT_PROOF_SUBMITTED'].includes(order.status)) {
    throw new AppError('Only pending or confirmed orders can be cancelled', 400);
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancelReason: reason || 'Cancelled by customer' },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId: id, status: 'CANCELLED', note: reason || 'Cancelled by customer' },
    }),
  ]);

  // Restore stock
  const items = await prisma.orderItem.findMany({ where: { orderId: id } });
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { countInStock: { increment: item.quantity } },
    });
  }

  return ApiResponse.success(res, null, 'Order cancelled successfully');
}

// ─── User: Submit MoMo Payment Proof ─────────────────────────────────────────
export async function submitPaymentProof(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const proofUrl = (req as unknown as { proofUrl: string }).proofUrl;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError('Order not found', 404);
  if (order.userId !== req.user!.userId) throw new AppError('Access denied', 403);
  if (order.paymentMethod !== PaymentMethod.MTN_MOMO) {
    throw new AppError('Payment proof is only for MTN MoMo orders', 400);
  }
  if (!['PENDING', 'PENDING_PAYMENT_PROOF'].includes(order.status)) {
    throw new AppError('Proof can only be submitted for pending MoMo orders', 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id },
      data: {
        paymentProof: proofUrl,
        status: OrderStatus.PAYMENT_PROOF_SUBMITTED,
      },
    });
    await tx.orderStatusHistory.create({
      data: { orderId: id, status: OrderStatus.PAYMENT_PROOF_SUBMITTED, note: 'Customer submitted MoMo payment proof' },
    });
    return o;
  });

  // Notify all admins about the proof submission
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { name: true } });

  await Promise.all(admins.map((admin) =>
    createNotification({
      userId: admin.id,
      type: NotificationType.PAYMENT_PROOF_SUBMITTED,
      title: '📸 MoMo Payment Proof Received',
      message: `${user?.name} submitted payment proof for order ${order.orderNumber}. Please verify and confirm.`,
      link: `/admin/orders/${id}`,
    })
  ));

  // Broadcast SSE event to all connected admin clients
  broadcastAdminEvent({
    type: 'PAYMENT_PROOF',
    orderId: id,
    orderNumber: order.orderNumber,
    userName: user?.name || 'Customer',
    message: `Payment proof submitted for ${order.orderNumber}`,
  });

  return ApiResponse.success(res, updated, 'Payment proof submitted. Admin will verify shortly.');
}

// ─── Admin: Mark Order as Paid ────────────────────────────────────────────────
export async function adminMarkPaid(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!order) throw new AppError('Order not found', 404);

  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    }),
    prisma.orderStatusHistory.create({
      data: { orderId: id, status: 'CONFIRMED', note: 'Payment verified by admin' },
    }),
  ]);

  // Notify customer
  await createOrderNotification(order.userId, order.orderNumber, order.id, 'CONFIRMED');

  if (order.user) {
    sendEmail({
      to: order.user.email,
      toName: order.user.name,
      subject: `Payment Confirmed — ${order.orderNumber}`,
      template: 'payment-confirmed',
      html: `<h2>Payment Confirmed!</h2><p>Your MoMo payment for order <strong>${order.orderNumber}</strong> has been verified. Your order is now being processed.</p>`,
    }).catch(() => {});
  }

  return ApiResponse.success(res, updated, 'Order marked as paid and confirmed');
}
