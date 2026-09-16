import axios from 'axios';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud: inyecta Bearer token si existe
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ventasfix_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Respuesta: captura errores globalmente con Sonner
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error de conexión con el servidor';

      // Notificación toast de error
      toast.error(message);

      // Si es 401 y no estamos en la página de login, limpiar sesión y redirigir
      if (
        error.response?.status === 401 &&
        !window.location.pathname.includes('/login')
      ) {
        localStorage.removeItem('ventasfix_token');
        localStorage.removeItem('ventasfix_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

