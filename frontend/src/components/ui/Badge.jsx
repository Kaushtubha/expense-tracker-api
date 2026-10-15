import React from 'react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { getStatusMeta, getPriorityMeta, getCategoryMeta } from '../../lib/formatters';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full transition-all duration-150',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]',
        status: 'border',
        priority: 'border',
        category: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-color)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function StatusBadge({ status, className }) {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span
      className={clsx(badgeVariants({ variant: 'status' }), className)}
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 30%, transparent)`,
      }}
    >
      <Icon className="w-3 h-3" strokeWidth={2} />
      <span>{meta.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority, className, showPulse = true }) {
  const meta = getPriorityMeta(priority);
  const isCritical = (priority || '').toLowerCase() === 'critical';

  return (
    <span
      className={clsx(badgeVariants({ variant: 'priority' }), className)}
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 30%, transparent)`,
      }}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          isCritical && showPulse && 'pulse-critical'
        )}
        style={{ backgroundColor: meta.color }}
      />
      <span>{meta.label}</span>
    </span>
  );
}

export function CategoryBadge({ category, className }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <span className={clsx(badgeVariants({ variant: 'category' }), className)}>
      <Icon className="w-3 h-3 text-[var(--text-muted)]" strokeWidth={1.5} />
      <span>{meta.label}</span>
    </span>
  );
}
