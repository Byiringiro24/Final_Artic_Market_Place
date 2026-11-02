import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  variantKey?: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  listPrice: number;
  quantity: number;
  countInStock: number;
  variantInfo?: { color?: string; size?: string };
}

export function getCartItemVariantKey(item: Pick<CartItem, 'variantId' | 'variantInfo'>) {
  if (item.variantId) return item.variantId;
  if (!item.variantInfo) return 'default';
  return JSON.stringify(Object.fromEntries(Object.entries(item.variantInfo).filter(([, value]) => value).sort(([a], [b]) => a.localeCompare(b))));
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string, variantKey?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;

  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  isInCart: (productId: string, variantKey?: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const variantKey = getCartItemVariantKey(item);
          const existing = state.items.find(
            (i) => i.productId === item.productId && getCartItemVariantKey(i) === variantKey
          );

          if (existing) {
            const newQty = Math.min(existing.quantity + item.quantity, item.countInStock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && getCartItemVariantKey(i) === variantKey
                  ? { ...i, quantity: newQty }
                  : i
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              { ...item, variantKey, id: `${item.productId}-${encodeURIComponent(variantKey)}` },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, variantKey) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && (variantKey === undefined || getCartItemVariantKey(i) === variantKey))
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantKey) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && (variantKey === undefined || getCartItemVariantKey(i) === variantKey)
              ? { ...i, quantity: Math.min(quantity, i.countInStock) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleSidebar: () => set((s) => ({ isOpen: !s.isOpen })),
      openSidebar: () => set({ isOpen: true }),
      closeSidebar: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      isInCart: (productId, variantKey) =>
        get().items.some(
          (i) => i.productId === productId && (variantKey === undefined || getCartItemVariantKey(i) === variantKey)
        ),
    }),
    {
      name: 'artic-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
