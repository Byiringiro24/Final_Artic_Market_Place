/**
 * Syncs local Zustand cart with the backend when user is authenticated.
 * Call this at the app level (providers.tsx).
 */
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { queryKeys } from '@/lib/queryKeys';

interface BackendCartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    listPrice: number;
    images: string[];
    countInStock: number;
  };
}

export function useCartSync() {
  const { isAuthenticated } = useAuthStore();
  const { items: localItems, addItem, clearCart } = useCartStore();
  const qc = useQueryClient();

  // Fetch server cart when authenticated
  const { data } = useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: () => get<{ items: BackendCartItem[] }>('/cart'),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  // Push local items to server on login
  const { mutate: syncToServer } = useMutation({
    mutationFn: async (items: typeof localItems) => {
      for (const item of items) {
        await post('/cart', {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart.all }),
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    if (localItems.length > 0) {
      // Push local guest cart to server, then clear local
      syncToServer(localItems);
      clearCart();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Populate local store from server cart (for display)
  useEffect(() => {
    if (!isAuthenticated || !data?.data?.items) return;
    // Server is source of truth — local store used only for sidebar display
  }, [data, isAuthenticated]);

  return { serverCart: data?.data?.items || [] };
}
