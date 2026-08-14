/**
 * ARTIC Marketplace — Background job scheduler
 * Handles post-delivery review requests, low-stock alerts, etc.
 * Uses simple setInterval (replace with node-cron or bull in production)
 */
import { prisma } from '../db/prisma';
import { sendEmail } from './email';
import { logger } from './logger';
import { subDays } from 'date-fns';

/**
 * Send review request emails for orders delivered 3 days ago
 * Runs every hour
 */
async function sendReviewRequests() {
  try {
    const threeDaysAgo = subDays(new Date(), 3);
    const twoDaysAgo = subDays(new Date(), 2);

    // Find orders delivered ~3 days ago that haven't had review requests sent
    const orders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          gte: threeDaysAgo,
          lt: twoDaysAgo,
        },
        isDelivered: true,
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          select: {
            name: true,
            image: true,
            product: { select: { slug: true } },
          },
        },
      },
      take: 50, // Process in batches
    });

    for (const order of orders) {
      if (!order.user.email || order.items.length === 0) continue;

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      await sendEmail({
        to: order.user.email,
        toName: order.user.name,
        subject: `How was your ARTIC order? Share your thoughts 🌟`,
        template: 'review-request',
        html: `
          <h2>Hi ${order.user.name}, how was your order?</h2>
          <p>Your order has been delivered. We'd love to hear what you think!</p>
          ${order.items
            .slice(0, 3)
            .map(
              (item) => `
            <div style="margin: 16px 0; padding: 12px; background: #f9f9f9; border-radius: 8px;">
              <strong>${item.name}</strong><br/>
              <a href="${frontendUrl}/en-US/product/${item.product.slug}#reviews"
                 style="background:#FF9900;color:#000;padding:8px 20px;border-radius:16px;text-decoration:none;display:inline-block;margin-top:8px;font-weight:bold;">
                ★ Write a Review
              </a>
            </div>
          `
            )
            .join('')}
        `,
      });
    }

    if (orders.length > 0) {
      logger.info(`Sent review request emails for ${orders.length} orders`);
    }
  } catch (error) {
    logger.error('Review request scheduler error:', error);
  }
}

/**
 * Check for low-stock products and notify admins
 * Runs every 6 hours
 */
async function checkLowStock() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        countInStock: { lte: 5, gt: 0 },
        isPublished: true,
      },
      select: { id: true, name: true, countInStock: true, slug: true },
    });

    if (lowStockProducts.length === 0) return;

    // Get admin emails
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { email: true, name: true },
    });

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        toName: admin.name,
        subject: `⚠️ Low Stock Alert — ${lowStockProducts.length} products need attention`,
        template: 'low-stock',
        html: `
          <h2>Low Stock Alert</h2>
          <p>The following products are running low on stock:</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#f0f0f0;">
              <th style="padding:8px;text-align:left;">Product</th>
              <th style="padding:8px;text-align:right;">Stock Remaining</th>
            </tr>
            ${lowStockProducts
              .map(
                (p) => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">${p.name}</td>
                <td style="padding:8px;text-align:right;color:${p.countInStock === 1 ? '#cc0000' : '#e47911'};font-weight:bold;">
                  ${p.countInStock} left
                </td>
              </tr>
            `
              )
              .join('')}
          </table>
          <a href="${process.env.FRONTEND_URL}/en-US/admin/products"
             style="background:#FF9900;color:#000;padding:12px 28px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px;font-weight:bold;">
            Manage Inventory
          </a>
        `,
      });
    }

    logger.info(`Low stock alert sent for ${lowStockProducts.length} products`);
  } catch (error) {
    logger.error('Low stock scheduler error:', error);
  }
}

/**
 * Start all scheduled jobs
 */
export function startScheduler() {
  if (process.env.NODE_ENV === 'test') return;

  // Review requests: check every hour
  setInterval(sendReviewRequests, 60 * 60 * 1000);

  // Low stock: check every 6 hours
  setInterval(checkLowStock, 6 * 60 * 60 * 1000);

  // Run immediately on startup (after 30s delay)
  setTimeout(sendReviewRequests, 30 * 1000);
  setTimeout(checkLowStock, 60 * 1000);

  logger.info('✅ Background scheduler started');
}
