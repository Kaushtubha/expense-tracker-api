import React from 'react';
import clsx from 'clsx';
import { Button } from './Button';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)]',
        className
      )}
      {...props}
    />
  );
}

export function EmptyState({
  title = 'No complaints found',
  description = 'Try clearing your filters or check back later.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={clsx(
        'p-12 text-center rounded-[14px] bg-[var(--bg-surface)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center',
        className
      )}
    >
      {/* Calm Architectural SVG line illustration */}
      <svg
        className="w-20 h-20 text-[var(--text-muted)] stroke-current mb-4 opacity-70"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        strokeWidth="1.25"
      >
        <rect x="15" y="20" width="50" height="45" rx="4" stroke="currentColor" />
        <line x1="25" y1="32" x2="55" y2="32" stroke="currentColor" strokeDasharray="3 3" />
        <line x1="25" y1="42" x2="48" y2="42" stroke="currentColor" strokeDasharray="3 3" />
        <line x1="25" y1="52" x2="38" y2="52" stroke="currentColor" strokeDasharray="3 3" />
        <circle cx="56" cy="52" r="5" stroke="currentColor" />
        <path d="M54 52L55.5 53.5L58 50.5" stroke="currentColor" />
      </svg>

      <h3 className="font-display text-lg font-medium text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-[var(--text-secondary)] max-w-sm">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
