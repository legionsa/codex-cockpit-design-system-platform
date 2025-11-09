import { create } from 'zustand';
import { api } from '@/lib/api-client';
type User = {
  id: string;
  name: string;
};
interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: User | null;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAuthLoading: true, // Start as true to check session on load
  user: null,
  checkSession: async () => {
    set({ isAuthLoading: true });
    try {
      const user = await api<User>('/api/auth/me');
      set({ isAuthenticated: true, user, isAuthLoading: false });
    } catch (error) {
      set({ isAuthenticated: false, user: null, isAuthLoading: false });
    }
  },
  login: async (password: string) => {
    try {
      const user = await api<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      set({ isAuthenticated: true, user });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      set({ isAuthenticated: false, user: null });
      return false;
    }
  },
  logout: async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      set({ isAuthenticated: false, user: null });
    }
  },
}));
// Initialize session check
useAuthStore.getState().checkSession();