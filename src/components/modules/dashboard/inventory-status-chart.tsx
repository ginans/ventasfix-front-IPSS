'use client';

import React, { useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { useProductsStore } from '@/stores/products.store';
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
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const chartConfig = {
  cantidad: {
    label: 'Artículos',
  },
  CRITICAL: {
    label: 'Crítico (Reponer)',
    color: '#ef4444',
  },
  LOW: {
    label: 'Bajo (Alerta)',
    color: '#f59e0b',
  },
  NORMAL: {
    label: 'Normal (Óptimo)',
    color: '#10b981',
  },
  HIGH: {
    label: 'Alto (Excedente)',
    color: '#7c3aed',
  },
} satisfies ChartConfig;

export function InventoryStatusChart() {
  const { products, fetchProducts, isLoading } = useProductsStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const { chartData, totalItems, counts, hasAlerts } = useMemo(() => {
    const counts = {
      CRITICAL: 0,
      LOW: 0,
      NORMAL: 0,
      HIGH: 0,
    };

    products.forEach((p) => {
      if (p.stockStatus && counts[p.stockStatus] !== undefined) {
        counts[p.stockStatus] += 1;
      }
    });

    const total = products.length;

    const data = [
      { status: 'CRITICAL', label: 'Crítico', cantidad: counts.CRITICAL, fill: '#ef4444' },
      { status: 'LOW', label: 'Bajo', cantidad: counts.LOW, fill: '#f59e0b' },
      { status: 'NORMAL', label: 'Normal', cantidad: counts.NORMAL, fill: '#10b981' },
      { status: 'HIGH', label: 'Alto', cantidad: counts.HIGH, fill: '#7c3aed' },
    ];

    const activeSegments = data.filter((d) => d.cantidad > 0);

    return {
      chartData: activeSegments.length > 0 ? activeSegments : [
        { status: 'NORMAL', label: 'Normal', cantidad: 1, fill: '#10b981' }
      ],
      totalItems: total,
      counts,
      hasAlerts: counts.CRITICAL > 0 || counts.LOW > 0,
    };
  }, [products]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold">
          Salud del Inventario
        </CardTitle>
        <CardDescription>
          Distribución de productos según umbrales de stock
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="dot" />}
            />
            <Pie
              data={chartData}
              dataKey="cantidad"
              nameKey="label"
              innerRadius={55}
              strokeWidth={4}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold font-mono"
                        >
                          {isLoading ? '...' : totalItems}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          Artículos
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          {hasAlerts ? (
            <>
              <span className="text-amber-600 font-semibold">
                {counts.CRITICAL > 0 && `${counts.CRITICAL} crítico(s)`}
                {counts.CRITICAL > 0 && counts.LOW > 0 && ' y '}
                {counts.LOW > 0 && `${counts.LOW} bajo(s)`}
              </span>{' '}
              requieren reposición
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </>
          ) : (
            <>
              <span className="text-emerald-600 font-semibold">
                {totalItems} artículos en nivel óptimo
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </>
          )}
        </div>
        <div>
          Clasificación según stock actual vs mínimo y bajo
        </div>
      </CardFooter>
    </Card>
  );
}

