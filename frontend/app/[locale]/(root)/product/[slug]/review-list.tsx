'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ThumbsUp } from 'lucide-react';
import { get, post } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import StarRating from '@/components/product/StarRating';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Review {
  id: string; rating: number; title?: string; comment: string;
  createdAt: string; isVerifiedPurchase: boolean; helpfulCount: number;
  user: { name: string; image?: string };
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});
type ReviewForm = z.infer<typeof reviewSchema>;

interface Props { productId: string; productName: string; avgRating: number; numReviews: number }

export default function ReviewList({ productId, productName, avgRating, numReviews }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.reviews.product(productId),
    queryFn: () => get<{ reviews: Review[]; distribution: Array<{ rating: number; _count: { rating: number } }> }>(`/reviews/product/${productId}`),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });
  const selectedRating = watch('rating');

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: (d: ReviewForm) => post('/reviews', { ...d, productId }),
    onSuccess: () => {
      toast({ title: 'Review submitted', description: 'Your review is pending approval.' });
      reset();
      setShowForm(false);
      qc.invalidateQueries({ queryKey: queryKeys.reviews.product(productId) });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit review';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const reviews = data?.data?.reviews || [];
  const distribution = data?.data?.distribution || [];

  const distMap = distribution.reduce<Record<number, number>>((a, d) => {
    a[d.rating] = d._count.rating;
    return a;
  }, {});

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 border-b pb-2">Customer Reviews</h2>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Rating summary */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl font-light">{Number(avgRating).toFixed(1)}</span>
            <div>
              <StarRating rating={avgRating} size="lg" />
              <p className="text-sm text-gray-500">{numReviews.toLocaleString()} global ratings</p>
            </div>
          </div>

          {/* Rating bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distMap[star] || 0;
              const pct = numReviews > 0 ? Math.round((count / numReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="text-artic-link hover:underline cursor-pointer w-10 text-right">{star} star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-artic-teal h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-artic-link w-8">{pct}%</span>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          {isAuthenticated ? (
            <div>
              <h3 className="font-medium mb-2">Review this product</h3>
              <p className="text-sm text-gray-600 mb-3">Share your thoughts about {productName}</p>
              <Button
                variant="outline"
                className="w-full rounded"
                onClick={() => setShowForm((v) => !v)}
              >
                Write a customer review
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              <a href="../sign-in" className="text-artic-link hover:underline">Sign in</a> to write a review
            </p>
          )}
        </div>

        {/* Reviews list + form */}
        <div className="space-y-6">
          {/* Write review form */}
          {showForm && (
            <form
              onSubmit={handleSubmit((d) => submitReview(d))}
              className="border rounded-lg p-5 space-y-4 bg-gray-50"
            >
              <h3 className="font-semibold">Create Review</h3>

              {/* Star picker */}
              <div>
                <p className="text-sm mb-2">Overall rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setValue('rating', s)}
                      className={`text-2xl transition-colors ${
                        s <= (hoveredStar || selectedRating) ? 'text-artic-teal' : 'text-gray-300'
                      }`}
                      aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1">Review title (optional)</label>
                <input
                  {...register('title')}
                  placeholder="What's most important to know?"
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal"
                />
              </div>

              <div>
                <label className="text-sm block mb-1">Written review</label>
                <textarea
                  {...register('comment')}
                  rows={4}
                  placeholder="What did you like or dislike? What did you use this product for?"
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-teal resize-none"
                />
                {errors.comment && <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isPending || selectedRating === 0} className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-full">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-full">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Reviews */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="border-b pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-artic-teal flex items-center justify-center text-black text-sm font-bold">
                    {review.user.name[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{review.user.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={review.rating} size="sm" />
                  {review.title && <span className="font-semibold text-sm">{review.title}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span>Reviewed {formatRelativeTime(review.createdAt)}</span>
                  {review.isVerifiedPurchase && (
                    <span className="text-orange-700 font-medium">✓ Verified Purchase</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                {review.helpfulCount > 0 && (
                  <button className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                    <ThumbsUp className="h-3 w-3" />
                    {review.helpfulCount} people found this helpful
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
