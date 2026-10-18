import React from 'react';
import type { OrderStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'blue';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800',
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border-sky-300 dark:border-sky-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="warning">⏳ PENDING</Badge>;
    case 'CONFIRMED':
      return <Badge variant="blue">✓ CONFIRMED</Badge>;
    case 'SHIPPED':
      return <Badge variant="purple">🚚 SHIPPED</Badge>;
    case 'DELIVERED':
      return <Badge variant="success">🎉 DELIVERED</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">✕ CANCELLED</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
