'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { get, post } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/product/StarRating';

interface WishlistItem {
  id: string;
  product: {
    id: string; name: string; slug: string; price: number; listPrice: number;
    images: string[]; avgRating: number; numReviews: number; countInStock: number;
  };
}

export default function WishlistPage() {
  const locale = useLocale();
  const { toast } = useToast();
  const { addItem } = useCartStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.wishlist.all,
    queryFn: () => get<WishlistItem[]>('/wishlist'),
  });

  const { mutate: toggleWishlist } = useMutation({
    mutationFn: (productId: string) => post('/wishlist', { productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.wishlist.all }),
  });

  const items = (data?.data as unknown as WishlistItem[]) || [];

  function handleAddToCart(item: WishlistItem) {
    const { product } = item;
    addItem({
      productId: product.id, name: product.name, slug: product.slug,
      image: product.images[0] || '', price: Number(product.price),
      listPrice: Number(product.listPrice), quantity: 1,
      countInStock: product.countInStock,
    });
    toast({ title: 'Added to cart', description: product.name });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Your Wish List</h1>
        {items.length > 0 && (
          <span className="text-sm text-gray-500">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-64 rounded-lg" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg">
          <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Your wish list is empty</p>
          <p className="text-gray-400 text-sm mb-6">Save items you love to come back to later.</p>
          <Button asChild className="bg-artic-orange hover:bg-artic-orange-dark text-black rounded-full">
            <Link href={`/${locale}`}>Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(({ id, product }) => {
            const discount = getDiscountPercent(Number(product.price), Number(product.listPrice));
            return (
              <div key={id} className="bg-white border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative aspect-square bg-gray-50">
                  <Link href={`/${locale}/product/${product.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0] || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                      -{discount}%
                    </Badge>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-3 space-y-2">
                  <Link href={`/${locale}/product/${product.slug}`}>
                    <h3 className="text-sm font-medium line-clamp-2 hover:text-artic-link">{product.name}</h3>
                  </Link>
                  <StarRating rating={product.avgRating} size="sm" />
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold">{formatPrice(Number(product.price))}</span>
                    {Number(product.listPrice) > Number(product.price) && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(Number(product.listPrice))}</span>
                    )}
                  </div>

                  {product.countInStock > 0 ? (
                    <Button
                      onClick={() => handleAddToCart({ id, product })}
                      size="sm"
                      className="w-full bg-artic-orange hover:bg-artic-orange-dark text-black rounded-full text-xs gap-1"
                    >
                      <ShoppingCart className="h-3 w-3" /> Add to Cart
                    </Button>
                  ) : (
                    <p className="text-xs text-red-500 text-center">Out of stock</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
