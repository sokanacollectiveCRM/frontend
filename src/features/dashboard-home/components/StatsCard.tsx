// src/features/dashboard-home/components/StatsCard.tsx
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type StatsVariant = 'danger' | 'warning' | 'info' | 'success' | 'neutral';

interface StatsCardProps {
  label: string;
  value: number | string;
  variant?: StatsVariant;
  icon?: LucideIcon;
}

/**
 * Reusable statistics card component
 * Displays a statistic with customizable styling based on variant
 */
export function StatsCard({ label, value, variant = 'neutral', icon: Icon }: StatsCardProps) {
  // Define variant-specific styles
  const variantStyles = {
    danger: {
      container: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20',
      value: 'text-red-700 dark:text-red-400',
      label: 'text-red-600 dark:text-red-500',
      icon: 'text-red-500 dark:text-red-400',
    },
    warning: {
      container: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20',
      value: 'text-amber-700 dark:text-amber-400',
      label: 'text-amber-600 dark:text-amber-500',
      icon: 'text-amber-500 dark:text-amber-400',
    },
    info: {
      container: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20',
      value: 'text-blue-700 dark:text-blue-400',
      label: 'text-blue-600 dark:text-blue-500',
      icon: 'text-blue-500 dark:text-blue-400',
    },
    success: {
      container: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20',
      value: 'text-green-700 dark:text-green-400',
      label: 'text-green-600 dark:text-green-500',
      icon: 'text-green-500 dark:text-green-400',
    },
    neutral: {
      container: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20',
      value: 'text-gray-900 dark:text-gray-100',
      label: 'text-gray-600 dark:text-gray-400',
      icon: 'text-gray-500 dark:text-gray-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'rounded-lg border p-6 shadow-sm transition-all hover:shadow-md',
        styles.container
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium uppercase tracking-wide', styles.label)}>
            {label}
          </p>
          <p className={cn('mt-2 text-3xl font-bold', styles.value)}>
            {value}
          </p>
        </div>
        {Icon && (
          <div className={cn('rounded-full p-2', styles.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton loading state for StatsCard
 */
export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/20">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  );
}

