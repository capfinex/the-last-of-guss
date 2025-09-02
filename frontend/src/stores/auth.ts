import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, ApiError } from '../types';
import { apiService } from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.login(credentials);
          
          // Extract user info from credentials for now
          // In a real app, the server would return user info
          const role = credentials.username.toLowerCase() === 'admin' 
            ? 'ADMIN' as const
            : credentials.username.toLowerCase() === 'никита'
            ? 'NIKITA' as const
            : 'SURVIVOR' as const;

          const user: User = {
            id: 'temp-id', // Would come from server
            username: credentials.username,
            role,
          };

          set({ user, isLoading: false });
          return true;
        } catch (error) {
          const apiError = error as ApiError;
          set({ 
            error: apiError.message || 'Login failed', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isLoading: false, error: null });
        }
      },

      clearError: (): void => {
        set({ error: null });
      },

      setUser: (user: User | null): void => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);