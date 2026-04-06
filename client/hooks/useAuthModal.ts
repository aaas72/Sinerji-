import { create } from 'zustand';

type AuthModalView = 'login' | 'register';

interface AuthModalStore {
  isOpen: boolean;
  view: AuthModalView;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
  switchView: (view: AuthModalView) => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: 'login',
  openLogin: () => set({ isOpen: true, view: 'login' }),
  openRegister: () => set({ isOpen: true, view: 'register' }),
  close: () => set({ isOpen: false }),
  switchView: (view) => set({ view }),
}));
