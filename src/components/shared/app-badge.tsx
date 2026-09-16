import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EStockStatus } from '@/enums/stock-status.enum';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  HelpCircle,
  ShieldCheck,
  User,
  type LucideIcon,
} from 'lucide-react';

export type BadgeCategory = 'inventory' | 'user';

interface BadgeConfig {
  label: string;
  variant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning';
  icon?: LucideIcon;
  className?: string;
}

export const BADGE_REGISTRY: Record<
  BadgeCategory,
  Record<string, BadgeConfig>
> = {
  inventory: {
    [EStockStatus.CRITICAL]: {
      label: 'Crítico',
      variant: 'destructive',
      icon: AlertCircle,
    },
    [EStockStatus.LOW]: {
      label: 'Bajo',
      variant: 'warning',
      icon: AlertTriangle,
    },
    [EStockStatus.NORMAL]: {
      label: 'Normal',
      variant: 'success',
      icon: CheckCircle2,
    },
    [EStockStatus.HIGH]: {
      label: 'Alto',
      variant: 'secondary',
      icon: Boxes,
    },
    _default: {
      label: 'Sin datos',
      variant: 'outline',
      icon: HelpCircle,
    },
  },
  user: {
    ADMIN: {
      label: 'Administrador',
      variant: 'secondary',
      icon: ShieldCheck,
      className: 'bg-primary/10 text-primary border-transparent',
    },
    VENDEDOR: {
      label: 'Vendedor',
      variant: 'outline',
      icon: User,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    OPERADOR: {
      label: 'Operador',
      variant: 'outline',
      icon: User,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    USER: {
      label: 'Usuario',
      variant: 'outline',
      icon: User,
    },
    _default: {
      label: 'Sin rol',
      variant: 'outline',
      icon: HelpCircle,
    },
  },
};

export interface AppBadgeProps {
  category: BadgeCategory;
  status?: string | EStockStatus | null;
  value?: number | string | null;
  showIcon?: boolean;
  color?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning';
  className?: string;
}

export function AppBadge({
  category,
  status,
  value,
  showIcon = true,
  color,
  className = '',
}: AppBadgeProps) {
  const categoryConfig = BADGE_REGISTRY[category] || {};
  const statusKey = status ? String(status).toUpperCase() : '_default';
  const config =
    categoryConfig[statusKey] ||
    categoryConfig['_default'] || {
      label: status ? String(status) : 'Desconocido',
      variant: 'outline' as const,
      icon: HelpCircle,
    };

  const Icon = config.icon;
  const badgeVariant = color || config.variant;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {value !== undefined && value !== null && (
        <span className="font-mono font-medium">{value}</span>
      )}
      <Badge
        variant={badgeVariant}
        className={`font-mono text-xs flex items-center gap-1 ${config.className || ''}`}
      >
        {showIcon && Icon && <Icon className="h-3 w-3 shrink-0" />}
        <span>{config.label}</span>
      </Badge>
    </div>
  );
}

