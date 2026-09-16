'use client';

import React, { useEffect, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useClientsStore } from '@/stores/clients.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  total: {
    label: 'Empresas Registradas',
    color: '#7c3aed',
  },
} satisfies ChartConfig;

export function ClientsPerformanceChart() {
  const { clients, fetchClients, isLoading } = useClientsStore();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const { chartData, totalClients } = useMemo(() => {
    const counts: Record<string, number> = {};

    clients.forEach((c) => {
      const rubro = c.rubro?.trim() || 'General';
      counts[rubro] = (counts[rubro] || 0) + 1;
    });

    const data = Object.entries(counts).map(([rubro, total]) => ({
      rubro,
      shortRubro: rubro.length > 14 ? `${rubro.slice(0, 12)}...` : rubro,
      total,
      fill: '#7c3aed',
    }));

    return {
      chartData: data.length > 0 ? data : [
        { rubro: 'Construcción', shortRubro: 'Construcción', total: 1, fill: '#7c3aed' },
        { rubro: 'Minería', shortRubro: 'Minería', total: 1, fill: '#7c3aed' },
      ],
      totalClients: clients.length,
    };
  }, [clients]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Clientes Empresa por Rubro Comercial
        </CardTitle>
        <CardDescription>
          Distribución de convenios B2B según giro económico
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="shortRubro"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  nameKey="total"
                  labelKey="rubro"
                />
              }
            />
            <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          {isLoading ? (
            <span>Sincronizando con base de datos...</span>
          ) : (
            <>
              {totalClients} convenios corporativos activos{' '}
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </>
          )}
        </div>
        <div>
          Datos según altas de clientes B2B
        </div>
      </CardFooter>
    </Card>
  );
}
