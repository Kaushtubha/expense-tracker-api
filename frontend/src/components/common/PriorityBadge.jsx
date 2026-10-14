import React from 'react';

const priorityConfig = {
  urgent: {
    color: 'var(--priority-urgent)',
    bg: 'var(--priority-urgent-bg)',
    border: 'rgba(239, 68, 68, 0.4)',
    label: 'Urgent',
  },
  high: {
    color: 'var(--priority-high)',
    bg: 'var(--priority-high-bg)',
    border: 'rgba(249, 115, 22, 0.4)',
    label: 'High',
  },
  medium: {
    color: 'var(--priority-medium)',
    bg: 'var(--priority-medium-bg)',
    border: 'rgba(234, 179, 8, 0.4)',
    label: 'Medium',
  },
  low: {
    color: 'var(--priority-low)',
    bg: 'var(--priority-low-bg)',
    border: 'rgba(6, 182, 212, 0.4)',
    label: 'Low',
  },
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'medium').toLowerCase();
  const cfg = priorityConfig[p] || priorityConfig.medium;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.72rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
};
