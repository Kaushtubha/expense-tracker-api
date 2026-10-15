import React from 'react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--brand-teal)] text-[var(--text-inverse)] hover:bg-[var(--brand-teal-hover)] hover:-translate-y-px shadow-[var(--shadow-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--brand-teal)]',
        secondary:
          'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)]',
        outline:
          'bg-transparent border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
        ghost:
          'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
        danger:
          'bg-[var(--priority-critical)] text-white hover:opacity-95 shadow-[var(--shadow-subtle)]',
        subtleTeal:
          'bg-[var(--brand-teal-subtle)] text-[var(--brand-teal)] border border-[var(--brand-teal-border)] hover:bg-[var(--brand-teal-subtle)]/80',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-[8px] gap-1.5',
        md: 'h-10 px-4 text-sm rounded-[10px] gap-2',
        lg: 'h-12 px-6 text-base rounded-[10px] gap-2.5',
        icon: 'h-9 w-9 p-0 rounded-[10px] flex items-center justify-center',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
