'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

export default function AdminReportsPage() {
  const locale = useLocale();

  const reports = [
    { icon: TrendingUp, title: 'Sales Report', description: 'Revenue, orders, and conversion rates over time', href: `/${locale}/admin/overview` },
    { icon: Package, title: 'Product Performance', description: 'Best sellers, low stock, and inventory levels', href: `/${locale}/admin/products` },
    { icon: Users, title: 'Customer Analytics', description: 'New users, retention, and order frequency', href: `/${locale}/admin/users` },
    { icon: BarChart3, title: 'Category Performance', description: 'Sales breakdown by product category', href: `/${locale}/admin/overview` },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {reports.map(({ icon: Icon, title, description, href }) => (
          <Link key={title} href={href} className="bg-white border rounded-lg p-5 flex gap-4 items-start hover:shadow-md transition-shadow group">
            <div className="p-3 bg-artic-light-bg rounded-lg group-hover:bg-orange-50">
              <Icon className="h-6 w-6 text-artic-teal" />
            </div>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
