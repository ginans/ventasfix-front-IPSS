import { useAuthStore } from '@/stores/auth.store';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const role = user?.role ?? 'VIEWER';
  const isAdmin = role === 'ADMIN';
  const isViewer = role === 'VIEWER';
  const canWrite = isAdmin;

  return {
    user,
    role,
    isAdmin,
    isViewer,
    canWrite,
  };
}
