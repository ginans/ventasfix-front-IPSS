'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Building2,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/usuarios',
    label: 'Usuarios',
    icon: Users,
  },
  {
    href: '/productos',
    label: 'Productos',
    icon: Package,
  },
  {
    href: '/clientes',
    label: 'Clientes Empresa',
    icon: Building2,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">
            Ventas Fix
          </h1>
          <p className="text-xs text-muted-foreground">Sistema Backoffice</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t text-xs text-muted-foreground text-center">
        Examen Web I &bull; Ventas Fix v1.0
      </div>
    </aside>
  );
}

