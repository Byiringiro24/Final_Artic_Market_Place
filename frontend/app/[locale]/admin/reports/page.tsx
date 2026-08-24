'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, Users, Package, ShoppingBag, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#FF9900', '#232F3E', '#37475A', '#007185', '#C7511F', '#5A6E82', '#17A589', '#884EA0'];

interface DashboardData {
  kpis: { totalRevenue: number; totalOrders: number; totalUsers: number; totalProducts: number };
  recentOrders: Array<{ id: string; orderNumber: string; totalPrice: number; status: string; createdAt: string; user: { name: string; email: string } }>;
  topProducts: Array<{ id: string; name: string; numSales: number; price: number }>;
  lowStockProducts: Array<{ id: string; name: string; countInStock: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  salesByCategory: Array<{ category: string; total: number }>;
  ordersByStatus: Record<string, number>;
}

// ─── PDF Export ────────────────────────────────────────────────────────────────
async function exportPDF(d: DashboardData, days: number) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── Header banner
  doc.setFillColor(19, 25, 33); // artic-navy
  doc.rect(0, 0, W, 64, 'F');
  doc.setFillColor(255, 153, 0); // artic-teal/orange
  doc.rect(0, 64, W, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTIC Marketplace', 40, 36);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Sales & Performance Report', 40, 52);
  doc.text(`Generated: ${now}  ·  Period: Last ${days} days`, W - 40, 36, { align: 'right' });

  let y = 90;

  // ── KPI Summary
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Performance Indicators', 40, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Total Revenue', formatPrice(d.kpis.totalRevenue)],
      ['Total Orders', d.kpis.totalOrders.toLocaleString()],
      ['New Users', d.kpis.totalUsers.toLocaleString()],
      ['Active Products', d.kpis.totalProducts.toLocaleString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [19, 25, 33], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    styles: { fontSize: 10 },
    margin: { left: 40, right: 40 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 24;

  // ── Revenue by Day
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Daily Revenue', 40, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Revenue']],
    body: d.revenueByDay.slice(-14).map((r) => [r.date, formatPrice(r.revenue)]),
    theme: 'grid',
    headStyles: { fillColor: [255, 153, 0], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 40, right: 40 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 24;

  // ── Top Products
  if (d.topProducts.length > 0) {
    if (y > 650) { doc.addPage(); y = 40; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Selling Products', 40, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Product', 'Sales', 'Unit Price']],
      body: d.topProducts.map((p) => [p.name, p.numSales.toLocaleString(), formatPrice(p.price)]),
      theme: 'striped',
      headStyles: { fillColor: [19, 25, 33], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 24;
  }

  // ── Recent Orders
  if (d.recentOrders.length > 0) {
    if (y > 600) { doc.addPage(); y = 40; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Orders', 40, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Order #', 'Customer', 'Date', 'Total', 'Status']],
      body: d.recentOrders.map((o) => [
        o.orderNumber,
        o.user.name,
        formatDate(o.createdAt),
        formatPrice(o.totalPrice),
        o.status.replace(/_/g, ' '),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [255, 153, 0], textColor: [0, 0, 0] },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 24;
  }

  // ── Sales by Category
  if (d.salesByCategory.length > 0) {
    if (y > 620) { doc.addPage(); y = 40; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Sales by Category', 40, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Revenue']],
      body: d.salesByCategory.map((c) => [c.category, formatPrice(c.total)]),
      theme: 'striped',
      headStyles: { fillColor: [19, 25, 33], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
    });
  }

  // ── Footer on every page
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `© ${new Date().getFullYear()} ARTIC Marketplace — Confidential  ·  Page ${i} of ${pageCount}`,
      W / 2,
      doc.internal.pageSize.getHeight() - 18,
      { align: 'center' }
    );
  }

  doc.save(`artic-report-${days}days-${Date.now()}.pdf`);
}

// ─── Excel Export ──────────────────────────────────────────────────────────────
async function exportExcel(d: DashboardData, days: number) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Summary sheet
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['ARTIC Marketplace — Sales Report'],
      [`Period: Last ${days} days`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['Metric', 'Value'],
      ['Total Revenue', formatPrice(d.kpis.totalRevenue)],
      ['Total Orders', d.kpis.totalOrders],
      ['New Users', d.kpis.totalUsers],
      ['Active Products', d.kpis.totalProducts],
    ]),
    'Summary'
  );

  // Revenue by day
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Date', 'Revenue (USD)'],
      ...d.revenueByDay.map((r) => [r.date, Number(r.revenue)]),
    ]),
    'Daily Revenue'
  );

  // Orders
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Order #', 'Customer', 'Email', 'Total', 'Status', 'Date'],
      ...d.recentOrders.map((o) => [o.orderNumber, o.user.name, o.user.email, Number(o.totalPrice), o.status, formatDate(o.createdAt)]),
    ]),
    'Recent Orders'
  );

  // Top products
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Product', 'Unit Sales', 'Price (USD)'],
      ...d.topProducts.map((p) => [p.name, p.numSales, Number(p.price)]),
    ]),
    'Top Products'
  );

  // Categories
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Category', 'Revenue (USD)'],
      ...d.salesByCategory.map((c) => [c.category, Number(c.total)]),
    ]),
    'Sales by Category'
  );

  // Orders by status
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Status', 'Count'],
      ...Object.entries(d.ordersByStatus).map(([k, v]) => [k.replace(/_/g, ' '), v]),
    ]),
    'Orders by Status'
  );

  XLSX.writeFile(wb, `artic-report-${days}days-${Date.now()}.xlsx`);
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [days, setDays] = useState(30);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard(days),
    queryFn: () => get<DashboardData>(`/admin/dashboard?days=${days}`),
  });

  const d = data?.data;

  async function handleExport(type: 'pdf' | 'excel') {
    if (!d) return;
    setExporting(type);
    try {
      if (type === 'pdf') await exportPDF(d, days);
      else await exportExcel(d, days);
    } finally {
      setExporting(null);
    }
  }

  const orderStatusData = d
    ? Object.entries(d.ordersByStatus).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time data from your store</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-artic-teal focus:outline-none"
            aria-label="Time range"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 12 months</option>
          </select>

          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={!d || !!exporting}
            className="gap-2 rounded-lg border-green-600 text-green-700 hover:bg-green-50"
          >
            {exporting === 'excel' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Excel
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={!d || !!exporting}
            className="gap-2 rounded-lg border-red-500 text-red-600 hover:bg-red-50"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-lg" />)}
        </div>
      ) : !d ? (
        <div className="text-center py-12 text-gray-500 bg-white border rounded-lg">
          <Download className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No data available for this period</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatPrice(d.kpis.totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Orders', value: d.kpis.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'New Users', value: d.kpis.totalUsers.toLocaleString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Active Products', value: d.kpis.totalProducts.toLocaleString(), icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white border rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{label}</span>
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={d.revenueByDay}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9900" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [formatPrice(Number(v)), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#FF9900" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Sales by Category */}
            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Sales by Category</h2>
              {d.salesByCategory.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No category data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={d.salesByCategory}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={95}
                        dataKey="total" nameKey="category"
                        paddingAngle={3}
                      >
                        {d.salesByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [formatPrice(Number(v)), 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {d.salesByCategory.map((item, i) => (
                      <div key={item.category} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{item.category}</span>
                        <span className="text-gray-400">({formatPrice(item.total)})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Orders by Status */}
            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Orders by Status</h2>
              {orderStatusData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No order data</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={orderStatusData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {orderStatusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Top Selling Products</h2>
            {d.topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">#</th>
                      <th className="text-left px-4 py-2 font-medium">Product</th>
                      <th className="text-right px-4 py-2 font-medium">Sales</th>
                      <th className="text-right px-4 py-2 font-medium">Unit Price</th>
                      <th className="text-right px-4 py-2 font-medium">Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {d.topProducts.map((p, i) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium">{p.name}</td>
                        <td className="px-4 py-2.5 text-right">{p.numSales.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right">{formatPrice(p.price)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-green-700">
                          {formatPrice(p.numSales * p.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Order #</th>
                    <th className="text-left px-4 py-2 font-medium">Customer</th>
                    <th className="text-left px-4 py-2 font-medium">Date</th>
                    <th className="text-right px-4 py-2 font-medium">Total</th>
                    <th className="text-center px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {d.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono font-medium text-artic-teal">{o.orderNumber}</td>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{o.user.name}</p>
                        <p className="text-xs text-gray-400">{o.user.email}</p>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{formatPrice(o.totalPrice)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                          o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                          o.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
