'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useCurrencyStore } from '@/store/currency.store';
import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';
import StarRating from './StarRating';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1').replace('/api/v1', '');

function resolveImageUrl(url: string): string {
  if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  listPrice: number;
  images: string[];
  avgRating: number;
  numReviews: number;
  countInStock: number;
  isFeatured?: boolean;
  category?: { name: string; slug: string };
  brand?: { name: string } | null;
  numSales?: number;
}

export default function ProductCard({
  id, name, slug, price, listPrice, images,
  avgRating, numReviews, countInStock, isFeatured,
  category, brand, numSales,
}: ProductCardProps) {
  const locale = useLocale();
  const { addItem, isInCart } = useCartStore();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = getDiscountPercent(Number(price), Number(listPrice));
  const inCart = isInCart(id);
  const outOfStock = countInStock === 0;
  const imgSrc = imgError
    ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'
    : resolveImageUrl(images?.[0] || '');

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      productId: id, name, slug,
      image: resolveImageUrl(images?.[0] || ''),
      price: Number(price), listPrice: Number(listPrice),
      quantity: 1, countInStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted((v) => !v);
  }

  return (
    <article className="group relative bg-white rounded-xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col product-card-hover">
      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={cn('h-4 w-4 transition-colors', wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
      </button>

      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {discount >= 10 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
        {isFeatured && !discount && (
          <span className="bg-[#FFB800] text-[#1A2332] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
            <Zap className="h-2.5 w-2.5" /> HOT
          </span>
        )}
        {outOfStock && (
          <span className="bg-gray-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">SOLD OUT</span>
        )}
        {numSales && numSales > 1000 && (
          <span className="bg-[#18A89A] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{(numSales / 1000).toFixed(1)}K+ sold</span>
        )}
      </div>

      {/* Image */}
      <Link href={`/${locale}/product/${slug}`} className="block bg-gray-50">
        <div className="relative aspect-square overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={name}
            className={cn(
              'w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105',
              outOfStock && 'opacity-60 grayscale'
            )}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        {/* Category + brand */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {category && (
            <Link href={`/${locale}/categories/${category.slug}`} className="text-[10px] text-[#18A89A] hover:underline font-medium">
              {category.name}
            </Link>
          )}
          {brand && (
            <>
              <span className="text-gray-300 text-[10px]">·</span>
              <span className="text-[10px] text-gray-400">{brand.name}</span>
            </>
          )}
        </div>

        {/* Name */}
        <Link href={`/${locale}/product/${slug}`}>
          <h3 className="text-sm font-medium text-gray-800 hover:text-[#18A89A] line-clamp-2 leading-snug transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <StarRating rating={Number(avgRating)} size="sm" />
          <span className="text-[11px] text-gray-400">({numReviews.toLocaleString()})</span>
        </div>

        {/* Price + Add to cart */}
        <div className="mt-auto pt-2 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#1A2332]">{formatPrice(Number(price))}</span>
            {Number(listPrice) > Number(price) && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(Number(listPrice))}</span>
            )}
          </div>

          {Number(price) >= 50 && (
            <p className="text-[10px] text-[#18A89A] font-medium">✓ Free shipping</p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={cn(
              'w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
              outOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-green-500 text-white'
                : inCart
                ? 'bg-[#18A89A]/10 text-[#18A89A] border border-[#18A89A]/30 hover:bg-[#18A89A] hover:text-white'
                : 'bg-[#1A2332] text-white hover:bg-[#18A89A] active:scale-95'
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {outOfStock ? 'Out of Stock' : added ? 'Added!' : inCart ? 'In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
