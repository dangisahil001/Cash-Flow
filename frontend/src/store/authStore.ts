import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'vendor' | 'customer' | 'admin';
  businessName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const savedUser = localStorage.getItem('lendtrack_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem('lendtrack_token'),
  login: (userData, token) => {
    localStorage.setItem('lendtrack_token', token);
    localStorage.setItem('lendtrack_user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('lendtrack_token');
    localStorage.removeItem('lendtrack_user');
    set({ user: null, isAuthenticated: false });
  },
}));
