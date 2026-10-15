import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export function KpiCard({
  title,
  value,
  suffix = '',
  prefix = '',
  deltaText,
  isDeltaPositive,
  icon: Icon,
  accentColor,
  isPulsing = false,
  className,
  sparklineData,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetNum = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetNum / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetNum) {
        setDisplayValue(targetNum);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetNum]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative overflow-hidden p-5 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)] flex flex-col justify-between transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] tracking-wide uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className="font-display text-3xl font-semibold tracking-tight text-[var(--text-primary)]"
              style={accentColor ? { color: accentColor } : undefined}
            >
              {prefix}
              {typeof value === 'number' && value % 1 !== 0
                ? value.toFixed(1)
                : displayValue.toLocaleString()}
              {suffix}
            </span>
          </div>
        </div>

        {Icon && (
          <div
            className={clsx(
              'p-2 rounded-[10px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
              isPulsing && 'pulse-critical text-[var(--priority-critical)]'
            )}
            style={
              accentColor
                ? {
                    color: accentColor,
                    borderColor: `color-mix(in srgb, ${accentColor} 25%, transparent)`,
                  }
                : undefined
            }
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {deltaText && (
          <span
            className={clsx(
              'font-medium inline-flex items-center gap-1',
              isDeltaPositive === true
                ? 'text-[var(--status-resolved)]'
                : isDeltaPositive === false
                ? 'text-[var(--priority-critical)]'
                : 'text-[var(--text-muted)]'
            )}
          >
            {deltaText}
          </span>
        )}

        {sparklineData && sparklineData.length > 0 && (
          <div className="flex items-end gap-0.5 h-4 ml-auto">
            {sparklineData.map((val, idx) => (
              <div
                key={idx}
                className="w-1 bg-[var(--brand-teal)]/40 rounded-t-sm"
                style={{ height: `${Math.max(15, (val / Math.max(...sparklineData)) * 100)}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
