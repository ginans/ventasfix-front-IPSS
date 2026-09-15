import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { IAuthUser, ILoginRequest } from '../interfaces/auth.interface';
import { toast } from 'sonner';

interface IAuthStore {
  token: string | null;
  user: IAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: ILoginRequest) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<IAuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  checkAuth: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('ventasfix_token');
    const userJson = localStorage.getItem('ventasfix_user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('ventasfix_token');
        localStorage.removeItem('ventasfix_user');
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },

  login: async (credentials: ILoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ventasfix_token', response.token);
        localStorage.setItem('ventasfix_user', JSON.stringify(response.user));
      }
      set({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('¡Bienvenido al sistema Ventas Fix!');
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ventasfix_token');
      localStorage.removeItem('ventasfix_user');
    }
    set({ token: null, user: null, isAuthenticated: false });
    toast.info('Sesión cerrada');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
}));

