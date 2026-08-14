'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { useCartStore } from '@/store/cart.store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import StarRating from './StarRating';

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
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  listPrice,
  images,
  avgRating,
  numReviews,
  countInStock,
  isFeatured,
  category,
  brand,
}: ProductCardProps) {
  const locale = useLocale();
  const { addItem, isInCart } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discount = getDiscountPercent(price, listPrice);
  const inCart = isInCart(id);
  const outOfStock = countInStock === 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      productId: id,
      name,
      slug,
      image: images[0] || '/images/placeholder.jpg',
      price,
      listPrice,
      quantity: 1,
      countInStock,
    });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setIsWishlisted((prev) => !prev);
    // TODO: call API
  }

  return (
    <article className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-colors',
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
          )}
        />
      </button>

      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {discount > 0 && (
          <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
            -{discount}%
          </Badge>
        )}
        {isFeatured && (
          <Badge className="bg-artic-orange text-black text-xs px-1.5 py-0.5 rounded">
            Featured
          </Badge>
        )}
        {outOfStock && (
          <Badge variant="secondary" className="text-xs">
            Out of stock
          </Badge>
        )}
      </div>

      {/* Product image */}
      <Link href={`/${locale}/product/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={imageError ? '/images/placeholder.jpg' : (images[0] || '/images/placeholder.jpg')}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        </div>
      </Link>

      {/* Product info */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        {/* Category */}
        {category && (
          <Link
            href={`/${locale}/categories/${category.slug}`}
            className="text-xs text-artic-link hover:underline"
          >
            {category.name}
          </Link>
        )}

        {/* Name */}
        <Link href={`/${locale}/product/${slug}`}>
          <h3 className="text-sm font-medium text-gray-800 hover:text-artic-link line-clamp-2 leading-snug">
            {name}
          </h3>
        </Link>

        {/* Brand */}
        {brand && <p className="text-xs text-gray-500">{brand.name}</p>}

        {/* Rating */}
        <div className="flex items-center gap-1">
          <StarRating rating={avgRating} size="sm" />
          <span className="text-xs text-artic-link hover:underline cursor-pointer">
            ({numReviews.toLocaleString()})
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {listPrice > price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(listPrice)}
              </span>
            )}
          </div>

          {/* Free shipping badge */}
          {price >= 50 && (
            <p className="text-xs text-green-700 font-medium">Free shipping</p>
          )}
        </div>

        {/* Add to cart */}
        <Button
          onClick={handleAddToCart}
          disabled={outOfStock}
          size="sm"
          className={cn(
            'w-full mt-2 text-xs font-medium rounded-full transition-all',
            inCart
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-artic-orange hover:bg-artic-orange-dark text-black'
          )}
          aria-label={outOfStock ? 'Out of stock' : `Add ${name} to cart`}
        >
          {outOfStock ? (
            'Out of stock'
          ) : inCart ? (
            <>
              <ShoppingCart className="h-3 w-3 mr-1" />
              In cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to cart
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
