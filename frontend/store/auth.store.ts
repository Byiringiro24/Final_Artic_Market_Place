import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SELLER';
  image?: string;
  emailVerified: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setUser: (user: AuthUser, token: string) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setUser: (user, accessToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }
        set({ user, accessToken, isAuthenticated: true });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'artic-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          state.isAuthenticated = true;
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', state.accessToken);
          }
        }
      },
    }
  )
);
