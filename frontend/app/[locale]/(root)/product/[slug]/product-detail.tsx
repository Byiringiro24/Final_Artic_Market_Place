'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ShoppingCart, Heart, Shield, Truck, RotateCcw, ChevronRight } from 'lucide-react';
import { get } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { getDiscountPercent } from '@/lib/utils';
import { usePrice } from '@/hooks/usePrice';
import { useCartStore } from '@/store/cart.store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StarRating from '@/components/product/StarRating';
import ReviewList from './review-list';
import RelatedProducts from './related-products';

interface Variant { id: string; name: string; value: string; stock: number; priceAdjust: number }
interface Product {
  id: string; name: string; slug: string; description: string; shortDesc: string;
  price: number; listPrice: number; countInStock: number; images: string[];
  videos: string[];
  avgRating: number; numReviews: number; numSales: number; tags: string[];
  category: { name: string; slug: string };
  brand: { name: string; logo?: string } | null;
  variants: Variant[];
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api/v1').replace(/\/api\/v1$/, '');

function resolveMediaUrl(url?: string) {
  if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${normalized}`;
}

export default function ProductDetail({ slug }: { slug: string }) {
  const locale = useLocale();
  const { addItem, isInCart } = useCartStore();
  const { toast } = useToast();
  const fmt = usePrice();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => get<Product>(`/products/${slug}`),
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !data?.data) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Product not found</h1>
      <Link href={`/${locale}`} className="text-artic-link hover:underline">Back to home</Link>
    </div>
  );

  const product = data.data;

  useEffect(() => {
    if (!product?.images || product.images.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % product.images.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [product?.images]);

  const discount = getDiscountPercent(Number(product.price), Number(product.listPrice));

  // Group variants by name
  const variantGroups = product.variants.reduce<Record<string, Variant[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  function handleAddToCart() {
    addItem({
      productId: product.id, name: product.name, slug: product.slug,
      image: product.images[0] || '', price: Number(product.price),
      listPrice: Number(product.listPrice), quantity: qty,
      countInStock: product.countInStock,
      variantInfo: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
    });
    toast({ title: `Added to cart`, description: product.name });
  }

  function handleBuyNow() {
    handleAddToCart();
    window.location.href = `/${locale}/checkout`;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap" aria-label="Breadcrumb">
          <Link href={`/${locale}`} className="hover:text-artic-link">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/${locale}/categories/${product.category.slug}`} className="hover:text-artic-link">
            {product.category.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-800 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[auto_1fr_320px] gap-8">
          {/* Image gallery */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex flex-col gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-14 h-14 border-2 rounded overflow-hidden transition-colors ${
                      activeImage === i ? 'border-artic-teal' : 'border-gray-200'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={resolveMediaUrl(img)} alt={`${product.name} view ${i + 1}`} className="object-contain w-full h-full p-1" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="relative w-full max-w-md aspect-square border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={resolveMediaUrl(product.images[activeImage])}
                alt={product.name}
                className="h-full w-full object-contain p-6"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage((current) => (current - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50"
                    aria-label="Previous product image"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((current) => (current + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50"
                    aria-label="Next product image"
                  >
                    →
                  </button>
                </>
              )}
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">-{discount}%</Badge>
              )}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-4">
            {product.brand && (
              <p className="text-artic-link text-sm hover:underline cursor-pointer">
                Visit the {product.brand.name} Store
              </p>
            )}
            <h1 className="text-2xl font-medium leading-snug">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={Number(product.avgRating)} size="md" showValue />
              <a href="#reviews" className="text-artic-link hover:underline text-sm">
                {product.numReviews.toLocaleString()} ratings
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-green-700 text-sm font-medium">{product.numSales.toLocaleString()}+ bought</span>
            </div>

            <Separator />

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-light">
                  {fmt(Number(product.price))}
                </span>
                {Number(product.listPrice) > Number(product.price) && (
                  <div className="text-sm text-gray-500">
                    List Price: <span className="line-through">{fmt(Number(product.listPrice))}</span>
                    {' '}<span className="text-red-600">({discount}% off)</span>
                  </div>
                )}
              </div>
              {Number(product.price) >= 50 && (
                <p className="text-sm text-green-700 mt-1 font-medium">
                  <Truck className="inline h-4 w-4 mr-1" />
                  FREE delivery
                </p>
              )}
            </div>

            {/* Variants */}
            {Object.entries(variantGroups).map(([groupName, options]) => (
              <div key={groupName}>
                <p className="text-sm font-medium mb-2">
                  {groupName}:{' '}
                  <span className="font-normal text-gray-600">{selectedVariants[groupName] || 'Select'}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {options.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [groupName]: v.value }))}
                      disabled={v.stock === 0}
                      className={`px-3 py-1.5 border rounded text-sm transition-colors ${
                        selectedVariants[groupName] === v.value
                          ? 'border-artic-teal bg-orange-50 text-artic-teal-dark font-medium'
                          : v.stock === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      aria-label={`Select ${groupName}: ${v.value}`}
                      aria-pressed={selectedVariants[groupName] === v.value}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/${locale}/search?tags=${tag}`}
                    className="text-xs text-artic-link border border-artic-link/30 rounded-full px-2 py-0.5 hover:bg-orange-50"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Short description */}
            {product.shortDesc && (
              <p className="text-sm text-gray-700">{product.shortDesc}</p>
            )}
          </div>

          {/* Buy box */}
          <div className="border rounded-lg p-4 space-y-4 h-fit sticky top-20">
            <div className="text-2xl font-light">{fmt(Number(product.price))}</div>

            {Number(product.price) >= 50 ? (
              <p className="text-sm text-green-700">
                <Truck className="inline h-4 w-4 mr-1" />FREE delivery
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                <Truck className="inline h-4 w-4 mr-1" />
                Delivery: {fmt(9.99)}
              </p>
            )}

            {product.countInStock > 0 ? (
              <p className="text-green-700 font-medium">
                {product.countInStock <= 5 ? `Only ${product.countInStock} left in stock` : 'In Stock'}
              </p>
            ) : (
              <p className="text-red-600 font-medium">Currently unavailable</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <label htmlFor="qty" className="text-sm">Qty:</label>
              <select
                id="qty"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm bg-gray-50"
              >
                {Array.from({ length: Math.min(product.countInStock, 10) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black font-medium rounded-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isInCart(product.id) ? 'Add More to Cart' : 'Add to Cart'}
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={product.countInStock === 0}
              variant="outline"
              className="w-full border-artic-teal text-artic-teal-dark hover:bg-orange-50 rounded-full"
            >
              Buy Now
            </Button>

            <button className="flex items-center gap-2 text-sm text-artic-link hover:underline w-full justify-center">
              <Heart className="h-4 w-4" /> Add to Wish List
            </button>

            <Separator />

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" /> Secure transaction</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Ships from ARTIC Marketplace</div>
              <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> 30-day return policy</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 max-w-3xl">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">About this item</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {product.description}
          </div>
        </div>

        {/* Videos */}
        {product.videos?.length > 0 && (
          <div className="mt-8 max-w-3xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Product Videos</h2>
            <div className="space-y-4">
              {product.videos.map((v, i) => (
                <video
                  key={i}
                  src={resolveMediaUrl(v)}
                  controls
                  controlsList="nodownload"
                  className="w-full rounded-lg border max-h-96 bg-black"
                  aria-label={`Product video ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviews section */}
        <div id="reviews" className="mt-10">
          <ReviewList productId={product.id} productName={product.name} avgRating={Number(product.avgRating)} numReviews={product.numReviews} />
        </div>

        {/* Related products */}
        <div className="mt-10">
          <RelatedProducts slug={slug} />
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="aspect-square skeleton rounded-lg" />
      <div className="space-y-4">
        {[200, 160, 120, 100, 80].map((w) => (
          <div key={w} className={`skeleton h-4 rounded`} style={{ width: w }} />
        ))}
      </div>
      <div className="skeleton h-64 rounded-lg" />
    </div>
  );
}
