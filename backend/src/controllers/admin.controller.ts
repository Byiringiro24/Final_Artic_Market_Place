import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { subDays, startOfDay, format } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns "+12.5%" / "-3.2%" / null when both periods are zero */
function pctChange(current: number, previous: number): string | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return '+100%';
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}%`;
}

// ─── Dashboard Overview ───────────────────────────────────────────────────────
export async function getDashboardStats(req: Request, res: Response) {
  const { days = '30' } = req.query as Record<string, string>;
  const daysNum   = Math.max(1, parseInt(days) || 30);
  const now       = new Date();

  const startDate = startOfDay(subDays(now, daysNum));       // current period start
  const prevStart = startOfDay(subDays(now, daysNum * 2));   // previous period start
  const prevEnd   = startDate;                               // previous period end

  // ── Current period queries ───────────────────────────────────────────────────
  const [
    revenueAgg,
    totalOrders,
    totalUsers,
    totalProducts,
    recentOrders,
    topProducts,
    lowStockProducts,
    ordersByStatusRaw,
    revenueByDayRaw,
    salesByCategoryRaw,
    // ── Previous period (for % change) ──
    prevRevenueAgg,
    prevOrders,
    prevUsers,
  ] = await Promise.all([

    // ── Current ─────────────────────────────────────────────────────────────
    prisma.order.aggregate({
      where: { isPaid: true, createdAt: { gte: startDate } },
      _sum: { totalPrice: true },
    }),

    prisma.order.count({
      where: { createdAt: { gte: startDate } },
    }),

    prisma.user.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Active products is a total count (not period-specific)
    prisma.product.count({ where: { isPublished: true } }),

    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { name: true, quantity: true } },
      },
    }),

    prisma.product.findMany({
      take: 10,
      where: { isPublished: true },
      orderBy: { numSales: 'desc' },
      select: { id: true, name: true, images: true, numSales: true, price: true },
    }),

    prisma.product.findMany({
      where: { countInStock: { lte: 5 }, isPublished: true },
      orderBy: { countInStock: 'asc' },
      select: { id: true, name: true, countInStock: true, images: true },
      take: 10,
    }),

    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),

    prisma.$queryRaw<Array<{ date: Date; revenue: string }>>`
      SELECT
        DATE_TRUNC('day', "createdAt") AS date,
        SUM("totalPrice")              AS revenue
      FROM orders
      WHERE "isPaid" = true
        AND "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `,

    prisma.$queryRaw<Array<{ category: string; total: string }>>`
      SELECT
        c.name                         AS category,
        SUM(oi.price * oi.quantity)    AS total
      FROM order_items oi
      JOIN products  p ON p.id = oi."productId"
      JOIN categories c ON c.id = p."categoryId"
      JOIN orders     o ON o.id = oi."orderId"
      WHERE o."isPaid" = true
        AND o."createdAt" >= ${startDate}
      GROUP BY c.name
      ORDER BY total DESC
    `,

    // ── Previous period ──────────────────────────────────────────────────────
    prisma.order.aggregate({
      where: { isPaid: true, createdAt: { gte: prevStart, lt: prevEnd } },
      _sum: { totalPrice: true },
    }),

    prisma.order.count({
      where: { createdAt: { gte: prevStart, lt: prevEnd } },
    }),

    prisma.user.count({
      where: { createdAt: { gte: prevStart, lt: prevEnd } },
    }),
  ]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalRevenue = Number(revenueAgg._sum.totalPrice  || 0);
  const prevRevenue  = Number(prevRevenueAgg._sum.totalPrice || 0);

  const kpiChanges = {
    revenueChange: pctChange(totalRevenue, prevRevenue),
    ordersChange:  pctChange(totalOrders,  prevOrders),
    usersChange:   pctChange(totalUsers,   prevUsers),
    // products: total count, no period change meaningful
  };

  return ApiResponse.success(res, {
    kpis: {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
    },
    kpiChanges,
    recentOrders,
    topProducts,
    lowStockProducts,
    ordersByStatus: ordersByStatusRaw.reduce<Record<string, number>>(
      (acc, item) => ({ ...acc, [item.status]: item._count.status }),
      {}
    ),
    revenueByDay: revenueByDayRaw.map((row) => ({
      date:    format(new Date(row.date), 'MMM dd'),
      revenue: Number(row.revenue),
    })),
    salesByCategory: salesByCategoryRaw.map((row) => ({
      category: row.category,
      total:    Number(row.total),
    })),
  });
}

// ─── User Management ──────────────────────────────────────────────────────────
export async function listUsers(req: Request, res: Response) {
  const {
    page = '1', limit = '20', search, role, isActive,
  } = req.query as Record<string, string>;

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit);
  const skip     = (pageNum - 1) * limitNum;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (role)                    where.role     = role.toUpperCase();
  if (isActive !== undefined)  where.isActive = isActive === 'true';
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        image: true, isActive: true, emailVerified: true,
        createdAt: true, lastLoginAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return ApiResponse.paginated(res, users, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
    hasNext: pageNum < Math.ceil(total / limitNum),
    hasPrev: pageNum > 1,
  });
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { role, isActive, name } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(role     !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(name     !== undefined && { name }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return ApiResponse.success(res, user, 'User updated');
}
