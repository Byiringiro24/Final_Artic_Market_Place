'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, MessageSquare } from 'lucide-react';
import { get, put } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/product/StarRating';

interface Review {
  id: string; rating: number; title?: string; comment: string;
  status: string; createdAt: string; isVerifiedPurchase: boolean;
  user: { name: string; email: string };
  product: { name: string; slug: string };
}

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', status, page],
    queryFn: () => get<Review[]>(`/reviews?status=${status}&limit=20&page=${page}`),
  });

  const { mutate: moderate } = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVED' | 'REJECTED' }) =>
      put(`/reviews/${id}/moderate`, { status: action }),
    onSuccess: (_, vars) => {
      toast({ title: `Review ${vars.action.toLowerCase()}` });
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const reviews = (data?.data as unknown as Review[]) || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Review Moderation</h1>

      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === s ? 'bg-artic-teal text-black' : 'border hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-lg" />)
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white border rounded-lg text-gray-500">No {status.toLowerCase()} reviews</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} size="sm" />
                    {review.title && <span className="font-medium text-sm">{review.title}</span>}
                    {review.isVerifiedPurchase && (
                      <span className="text-xs text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">Verified</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{review.comment}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>By <strong>{review.user.name}</strong> ({review.user.email})</span>
                    <span>Product: <strong>{review.product.name}</strong></span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>

                {status === 'PENDING' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => moderate({ id: review.id, action: 'APPROVED' })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                      aria-label="Approve review"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => moderate({ id: review.id, action: 'REJECTED' })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                      aria-label="Reject review"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
