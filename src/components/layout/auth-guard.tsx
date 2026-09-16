'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
    const token = localStorage.getItem('ventasfix_token');

    if (!token && pathname !== '/login') {
      router.replace('/login');
    } else if (token && pathname === '/login') {
      router.replace('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [pathname, checkAuth, router]);

  if (isChecking && pathname !== '/login') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
}

