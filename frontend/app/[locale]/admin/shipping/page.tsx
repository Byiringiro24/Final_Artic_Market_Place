'use client';

import { useQuery } from '@tanstack/react-query';
import { Truck } from 'lucide-react';
import { get } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface ShippingZone { id: string; name: string; countries: string[]; rates: Array<{ id: string; name: string; type: string; price: number; estimatedDays: string }> }

export default function AdminShippingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['shipping-zones'],
    queryFn: () => get<ShippingZone[]>('/shipping/zones'),
    select: (res) => res.data,
  });

  const zones = (data as unknown as ShippingZone[]) || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Shipping Zones & Rates</h1>

      {isLoading ? (
        <div className="skeleton h-48 rounded-lg" />
      ) : zones.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-lg text-gray-500">
          <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No shipping zones configured</p>
        </div>
      ) : (
        zones.map((zone) => (
          <div key={zone.id} className="bg-white border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-lg">{zone.name}</h2>
                <p className="text-sm text-gray-500">Countries: {zone.countries.join(', ')}</p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-3 py-2">Rate Name</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-center px-3 py-2">Est. Delivery</th>
              </tr></thead>
              <tbody className="divide-y">
                {zone.rates.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 font-medium">{r.name}</td>
                    <td className="px-3 py-2 text-gray-500">{r.type}</td>
                    <td className="px-3 py-2 text-right">{r.price === 0 ? <span className="text-green-600">FREE</span> : formatPrice(r.price)}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{r.estimatedDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
