'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { get } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';
import StarRating from '@/components/product/StarRating';

interface MyReview {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  status: string;
  createdAt: string;
  product: { name: string; slug: string; images: string[] };
}

export default function MyReviewsPage() {
  const locale = useLocale();
  const { user } = useAuthStore();

  // Fetch reviews for the current user via admin endpoint filtered by userId
  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => get<MyReview[]>('/reviews?limit=50'),
    enabled: !!user,
  });

  const reviews = (data?.data as unknown as MyReview[]) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Your Reviews</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-lg" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg">
          <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">You haven&apos;t written any reviews yet.</p>
          <Link
            href={`/${locale}/account/orders`}
            className="text-artic-link hover:underline text-sm"
          >
            View your orders to write a review
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-lg p-5 flex gap-4">
              {/* Product image */}
              <div className="w-20 h-20 bg-gray-50 border rounded flex-shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={review.product.images?.[0] || '/images/placeholder.jpg'}
                  alt={review.product.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              {/* Review content */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${locale}/product/${review.product.slug}`}
                  className="text-sm font-medium text-artic-link hover:underline line-clamp-1"
                >
                  {review.product.name}
                </Link>

                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={review.rating} size="sm" />
                  {review.title && (
                    <span className="text-sm font-medium">{review.title}</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.comment}</p>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{formatDate(review.createdAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    review.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : review.status === 'REJECTED'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
