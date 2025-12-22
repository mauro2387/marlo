import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  puntos: number;
  rol?: string;
  avatar?: string;
  telefono?: string;
  direccion?: string;
  zona?: string;
  departamento?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  updatePuntos: (puntos: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        // Primero limpiar el estado local
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        // Luego cerrar sesión con el nuevo cliente fetch
        try {
          const { authDB } = await import('@/lib/supabase-fetch');
          await authDB.logout();
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      updatePuntos: (puntos) => {
        set((state) => ({
          user: state.user ? { ...state.user, puntos } : null,
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'marlocookies-auth',
    }
  )
);
