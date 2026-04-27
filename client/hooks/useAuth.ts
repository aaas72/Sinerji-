"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '../types/auth';
import { useEffect } from 'react';
import { authService } from '../services/auth.service';

interface AuthStore extends AuthState {
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
          set({ _hasHydrated: state });
      },

      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        // Server clears the HttpOnly cookie; client clears local auth state.
        authService.logout().catch(() => undefined);
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
      },
    }
  )
);

// Hook to auto-check auth on app load
export function useAutoAuth() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  useEffect(() => {
    if (_hasHydrated) {
      checkAuth();
    }
  }, [_hasHydrated, checkAuth]);
}
