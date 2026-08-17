'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Clock, Store, Eye } from 'lucide-react';
import { get, put } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface SellerApp {
  id: string; status: string; businessName: string; businessType: string;
  description?: string; phone?: string; website?: string; address?: string;
  adminNotes?: string; createdAt: string;
  user: { id: string; name: string; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  SUSPENDED: 'bg-gray-100 text-gray-600',
};

export default function AdminSellersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sellers', statusFilter],
    queryFn: () => get<SellerApp[]>(`/sellers${statusFilter ? `?status=${statusFilter}` : ''}`),
    select: (r) => r.data,
  });

  const apps = (data as unknown as SellerApp[]) || [];

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      put(`/sellers/${id}/status`, { status, adminNotes }),
    onSuccess: (_, vars) => {
      toast({ title: `Application ${vars.status.toLowerCase()}` });
      qc.invalidateQueries({ queryKey: ['admin-sellers'] });
      setReviewingId(null); setAdminNotes('');
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Store className="h-6 w-6 text-artic-teal" /> Seller Applications
        </h1>
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', ''].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-artic-teal text-white' : 'border hover:bg-gray-50'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-lg" />) :
         apps.length === 0 ? (
          <div className="text-center py-12 bg-white border rounded-lg text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No {statusFilter.toLowerCase() || ''} applications</p>
          </div>
        ) : apps.map((app) => (
          <div key={app.id} className="bg-white border rounded-lg p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-artic-teal/10 flex items-center justify-center text-artic-teal font-bold text-lg">
                  {app.businessName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{app.businessName}</h3>
                  <p className="text-sm text-gray-500">{app.businessType}</p>
                  <p className="text-xs text-gray-400">{app.user.name} · {app.user.email}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[app.status]}`}>
                {app.status}
              </span>
            </div>

            {app.description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 line-clamp-2">{app.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {app.phone && <span>📞 {app.phone}</span>}
              {app.address && <span>📍 {app.address}</span>}
              {app.website && <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-artic-teal hover:underline">🌐 {app.website}</a>}
              <span>📅 {formatDate(app.createdAt)}</span>
            </div>

            {/* Review panel */}
            {reviewingId === app.id && (
              <div className="border-t pt-3 space-y-2">
                <label className="text-sm font-medium">Admin Notes (sent to applicant)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional note to the applicant..."
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-artic-teal"
                />
                <div className="flex gap-2">
                  <Button onClick={() => updateStatus({ id: app.id, status: 'APPROVED' })} disabled={isPending}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg gap-2">
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={() => updateStatus({ id: app.id, status: 'REJECTED' })} disabled={isPending}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg gap-2">
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button variant="outline" onClick={() => { setReviewingId(null); setAdminNotes(''); }} className="rounded-lg">Cancel</Button>
                </div>
              </div>
            )}

            {reviewingId !== app.id && app.status === 'PENDING' && (
              <div className="flex gap-2 border-t pt-3">
                <button onClick={() => setReviewingId(app.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-artic-teal text-white rounded-lg text-sm font-medium hover:bg-artic-teal-dark">
                  <Eye className="h-4 w-4" /> Review Application
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
