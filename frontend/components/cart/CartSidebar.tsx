'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CartSidebar() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Cart');
  const { items, isOpen, closeSidebar, updateQuantity, removeItem, getSubtotal } = useCartStore();

  function handleCheckout() {
    closeSidebar();
    router.push(`/${locale}/checkout`);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSidebar()}>
      <SheetContent side="right" className="w-full max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('title')}
            {items.length > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">{t('empty')}</p>
            <Button
              variant="outline"
              onClick={() => { closeSidebar(); router.push(`/${locale}`); }}
              className="rounded-full"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <ul className="divide-y py-2" role="list" aria-label="Cart items">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variantId}`} className="py-4 flex gap-3">
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                      <Image
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{item.name}</p>
                      {item.variantInfo && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Object.entries(item.variantInfo)
                            .filter(([, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-bold mt-1 text-artic-teal">
                        {formatPrice(item.price)}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="px-2 py-1 hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            disabled={item.quantity >= item.countInStock}
                            className="px-2 py-1 hover:bg-muted transition-colors disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t px-4 py-4 space-y-3 bg-background">
              <div className="flex items-center justify-between font-semibold">
                <span>
                  {t('subtotal', {
                    count: items.reduce((s, i) => s + i.quantity, 0),
                  })}
                </span>
                <span className="text-lg">{formatPrice(getSubtotal())}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <Button
                onClick={handleCheckout}
                className="w-full bg-artic-teal hover:bg-artic-teal-dark text-black font-bold rounded-full h-12 text-base"
              >
                {t('checkout')}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

