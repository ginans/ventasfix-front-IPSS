import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthGuard } from '@/components/layout/auth-guard';

export const metadata: Metadata = {
  title: 'Ventas Fix - Backoffice & Microservicio',
  description: 'Sistema administrativo y API REST para Ventas Fix - IPSS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <AuthGuard>{children}</AuthGuard>
        <Toaster />
      </body>
    </html>
  );
}
