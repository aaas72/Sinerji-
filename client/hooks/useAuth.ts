import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '../types/auth';

interface AuthStore extends AuthState {
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
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
        fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        }).catch(() => undefined);
        set({ user: null, isAuthenticated: false });
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
