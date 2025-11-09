import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface AuthState {
  isAuthenticated: boolean;
  user: { name: string } | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}
// In a real app, this would be a secure check against a backend.
// For this phase, we'll use a mock password.
const MOCK_PASSWORD = 'password';
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (password: string) => {
        if (password === MOCK_PASSWORD) {
          set({ isAuthenticated: true, user: { name: 'Admin User' } });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);