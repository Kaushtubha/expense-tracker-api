import React from 'react';
import clsx from 'clsx';

export const Input = React.forwardRef(
  ({ className, type = 'text', isMono = false, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={clsx(
            'w-full h-10 px-3.5 text-sm rounded-[10px] bg-[var(--bg-surface)] text-[var(--text-primary)] border transition-all duration-150',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:border-[var(--brand-teal)] focus:ring-1 focus:ring-[var(--brand-teal)]',
            isMono && 'font-mono-numbers tracking-wider font-medium',
            error
              ? 'border-[var(--priority-critical)] focus:border-[var(--priority-critical)] focus:ring-[var(--priority-critical)]'
              : 'border-[var(--border-color)] hover:border-[var(--text-muted)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--priority-critical)] font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = React.forwardRef(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={clsx(
            'w-full min-h-[96px] p-3 text-sm rounded-[10px] bg-[var(--bg-surface)] text-[var(--text-primary)] border transition-all duration-150 resize-y',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:border-[var(--brand-teal)] focus:ring-1 focus:ring-[var(--brand-teal)]',
            error
              ? 'border-[var(--priority-critical)] focus:border-[var(--priority-critical)] focus:ring-[var(--priority-critical)]'
              : 'border-[var(--border-color)] hover:border-[var(--text-muted)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--priority-critical)] font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
