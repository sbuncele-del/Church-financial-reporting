import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),
      
      setTokens: (accessToken, refreshToken) => set({ 
        token: accessToken, 
        refreshToken 
      }),

      login: (user, accessToken, refreshToken) => set({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'church-auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
