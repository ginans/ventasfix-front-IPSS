'use client';

import React, { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboard.store';
import { StatCard } from '@/components/shared/stat-card';
import { Users, Package, Building2 } from 'lucide-react';
import { ClientsPerformanceChart } from '@/components/modules/dashboard/clients-performance-chart';
import { InventoryStatusChart } from '@/components/modules/dashboard/inventory-status-chart';

export default function DashboardPage() {
  const { stats, isLoading, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard General</h2>
        <p className="text-muted-foreground mt-1">
          Resumen global y métricas clave del sistema Ventas Fix
        </p>
      </div>

      {/* Tarjetas de Métricas Solicitadas en el Examen */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Usuarios"
          value={isLoading ? '...' : (stats?.totalUsers ?? 0)}
          description="Administradores activos con acceso al Backoffice"
          icon={Users}
          variant="violet"
        />

        <StatCard
          title="Total de Productos"
          value={isLoading ? '...' : (stats?.totalProducts ?? 0)}
          description="Artículos en catálogo con control de inventario e IVA"
          icon={Package}
          variant="violet"
        />

        <StatCard
          title="Total de Clientes"
          value={isLoading ? '...' : (stats?.totalClients ?? 0)}
          description="Empresas registradas en convenio B2B"
          icon={Building2}
          variant="violet"
        />
      </div>

      {/* Gráficos de Inteligencia de Negocio y Operaciones */}
      <div className="grid gap-6 md:grid-cols-2">
        <ClientsPerformanceChart />
        <InventoryStatusChart />
      </div>
    </div>
  );
}

