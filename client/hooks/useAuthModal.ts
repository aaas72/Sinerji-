import { create } from 'zustand';

type AuthModalView = 'login' | 'register' | 'forgot_password' | 'reset_password';

interface AuthModalStore {
  isOpen: boolean;
  view: AuthModalView;
  openLogin: () => void;
  openRegister: () => void;
  openForgotPassword: () => void;
  openResetPassword: () => void;
  close: () => void;
  switchView: (view: AuthModalView) => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: 'login',
  openLogin: () => set({ isOpen: true, view: 'login' }),
  openRegister: () => set({ isOpen: true, view: 'register' }),
  openForgotPassword: () => set({ isOpen: true, view: 'forgot_password' }),
  openResetPassword: () => set({ isOpen: true, view: 'reset_password' }),
  close: () => set({ isOpen: false }),
  switchView: (view) => set({ view }),
}));
