'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

const COLORS = ['#FF9900', '#232F3E', '#37475A', '#007185', '#C7511F', '#5A6E82'];

interface DashboardData {
  kpis: { totalRevenue: number; totalOrders: number; totalUsers: number; totalProducts: number };
  recentOrders: Array<{ id: string; orderNumber: string; totalPrice: number; status: string; createdAt: string; user: { name: string } }>;
  topProducts: Array<{ id: string; name: string; numSales: number; price: number; images: string[] }>;
  lowStockProducts: Array<{ id: string; name: string; countInStock: number; images: string[] }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  salesByCategory: Array<{ category: string; total: number }>;
  ordersByStatus: Record<string, number>;
}

export default function AdminOverviewPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard(days),
    queryFn: () => get<DashboardData>(`/admin/dashboard?days=${days}`),
  });

  const d = data?.data;

  const kpiCards = d ? [
    { label: 'Total Revenue', value: formatPrice(d.kpis.totalRevenue), icon: DollarSign, change: '+12%', color: 'text-green-600' },
    { label: 'Total Orders', value: d.kpis.totalOrders.toLocaleString(), icon: ShoppingBag, change: '+8%', color: 'text-blue-600' },
    { label: 'New Users', value: d.kpis.totalUsers.toLocaleString(), icon: Users, change: '+15%', color: 'text-purple-600' },
    { label: 'Active Products', value: d.kpis.totalProducts.toLocaleString(), icon: Package, change: '', color: 'text-orange-600' },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-lg" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="skeleton h-64 rounded-lg" />
          <div className="skeleton h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-artic-orange focus:outline-none"
          aria-label="Select time range"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 12 months</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, change, color }) => (
          <div key={label} className="bg-white border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`p-2 rounded-lg bg-gray-50`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {change} from last period
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={d?.revenueByDay || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by category */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={d?.salesByCategory || []}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={90}
                dataKey="total"
                nameKey="category"
              >
                {(d?.salesByCategory || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatPrice(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {(d?.salesByCategory || []).map((item, i) => (
              <div key={item.category} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {item.category}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {(d?.recentOrders || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-gray-500 text-xs">{order.user.name} · {formatRelativeTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock warning */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" /> Low Stock Alert
          </h2>
          {(d?.lowStockProducts || []).length === 0 ? (
            <p className="text-sm text-gray-500">All products are sufficiently stocked.</p>
          ) : (
            <div className="space-y-3">
              {(d?.lowStockProducts || []).map((p) => (
                <div key={p.id} className="flex items-center gap-3 text-sm border-b last:border-0 pb-3 last:pb-0">
                  <div className="w-10 h-10 bg-gray-50 border rounded flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0] || '/images/placeholder.jpg'} alt={p.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className={`text-xs ${p.countInStock === 0 ? 'text-red-600' : 'text-orange-600'} font-medium`}>
                      {p.countInStock === 0 ? 'Out of stock' : `Only ${p.countInStock} left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
