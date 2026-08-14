import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../lib/apiResponse';
import { subDays, startOfDay, format } from 'date-fns';

// ─── Dashboard Overview ───────────────────────────────────────────────────────
export async function getDashboardStats(req: Request, res: Response) {
  const { days = '30' } = req.query as Record<string, string>;
  const daysNum = parseInt(days);
  const startDate = startOfDay(subDays(new Date(), daysNum));

  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    recentOrders,
    topProducts,
    lowStockProducts,
    ordersByStatus,
    revenueByDay,
    salesByCategory,
  ] = await Promise.all([
    // Total revenue (paid orders)
    prisma.order.aggregate({
      where: { isPaid: true, createdAt: { gte: startDate } },
      _sum: { totalPrice: true },
    }),

    // Total orders in period
    prisma.order.count({ where: { createdAt: { gte: startDate } } }),

    // New users in period
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),

    // Total active products
    prisma.product.count({ where: { isPublished: true } }),

    // Recent 5 orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { name: true, quantity: true } },
      },
    }),

    // Top 5 best-selling products
    prisma.product.findMany({
      take: 5,
      where: { isPublished: true },
      orderBy: { numSales: 'desc' },
      select: {
        id: true, name: true, images: true,
        numSales: true, price: true,
      },
    }),

    // Low stock (≤ 5 units)
    prisma.product.findMany({
      where: { countInStock: { lte: 5 }, isPublished: true },
      select: { id: true, name: true, countInStock: true, images: true },
      take: 10,
    }),

    // Orders grouped by status
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),

    // Revenue per day for chart
    prisma.$queryRaw<Array<{ date: string; revenue: number }>>`
      SELECT
        DATE_TRUNC('day', "createdAt") as date,
        SUM("totalPrice") as revenue
      FROM orders
      WHERE "isPaid" = true AND "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `,

    // Sales by category
    prisma.$queryRaw<Array<{ category: string; total: number }>>`
      SELECT
        c.name as category,
        SUM(oi.price * oi.quantity) as total
      FROM order_items oi
      JOIN products p ON p.id = oi."productId"
      JOIN categories c ON c.id = p."categoryId"
      JOIN orders o ON o.id = oi."orderId"
      WHERE o."isPaid" = true AND o."createdAt" >= ${startDate}
      GROUP BY c.name
      ORDER BY total DESC
    `,
  ]);

  return ApiResponse.success(res, {
    kpis: {
      totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
      totalOrders,
      totalUsers,
      totalProducts,
    },
    recentOrders,
    topProducts,
    lowStockProducts,
    ordersByStatus: ordersByStatus.reduce(
      (acc, item) => ({ ...acc, [item.status]: item._count.status }),
      {}
    ),
    revenueByDay: (revenueByDay as Array<{ date: string; revenue: number }>).map((row) => ({
      date: format(new Date(row.date), 'MMM dd'),
      revenue: Number(row.revenue),
    })),
    salesByCategory,
  });
}

// ─── User Management ──────────────────────────────────────────────────────────
export async function listUsers(req: Request, res: Response) {
  const {
    page = '1', limit = '20', search, role, isActive,
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (role) where.role = role.toUpperCase();
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
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

  return ApiResponse.paginated(
    res,
    users,
    { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum), hasNext: pageNum < Math.ceil(total / limitNum), hasPrev: pageNum > 1 }
  );
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { role, isActive, name } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(name && { name }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return ApiResponse.success(res, user, 'User updated');
}
