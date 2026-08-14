import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
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

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;

  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          if (existing) {
            const newQty = Math.min(existing.quantity + item.quantity, item.countInStock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: newQty }
                  : i
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              { ...item, id: `${item.productId}-${item.variantId || 'default'}` },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
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

      isInCart: (productId, variantId) =>
        get().items.some(
          (i) => i.productId === productId && i.variantId === variantId
        ),
    }),
    {
      name: 'artic-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
