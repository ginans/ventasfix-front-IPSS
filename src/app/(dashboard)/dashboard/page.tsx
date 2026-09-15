'use client';

import React, { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboard.store';
import { StatCard } from '@/components/shared/stat-card';
import { Users, Package, Building2, TrendingUp, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          variant="blue"
        />

        <StatCard
          title="Total de Productos"
          value={isLoading ? '...' : (stats?.totalProducts ?? 0)}
          description="Artículos en catálogo con control de inventario e IVA"
          icon={Package}
          variant="emerald"
        />

        <StatCard
          title="Total de Clientes"
          value={isLoading ? '...' : (stats?.totalClients ?? 0)}
          description="Empresas registradas en convenio B2B"
          icon={Building2}
          variant="violet"
        />
      </div>

      {/* Bloque de Información del Sistema y Estado */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              Reglas de Negocio Activas
            </CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between border-b pb-2">
              <span>Impuesto al Valor Agregado (IVA)</span>
              <span className="font-semibold text-foreground">19% Automático</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Validación de Identidad (RUT)</span>
              <span className="font-semibold text-foreground">Módulo 11 Chileno</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Dominio Corporativo Obligatorio</span>
              <span className="font-semibold text-foreground">@ventasfix.cl</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              Microservicio Softland & API
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between border-b pb-2">
              <span>Estado del Servicio REST</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Operativo
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Documentación OpenAPI / Swagger</span>
              <span className="font-mono text-xs text-primary">spec/oas.yaml</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Seguridad de Endpoints</span>
              <span className="font-semibold text-foreground">JWT Bearer Guards</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

