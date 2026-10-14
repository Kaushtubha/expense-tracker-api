import React from 'react';

const statusConfig = {
  Open: {
    color: 'var(--status-open)',
    bg: 'var(--status-open-bg)',
    border: 'var(--status-open-border)',
    label: 'Open',
  },
  'In Progress': {
    color: 'var(--status-progress)',
    bg: 'var(--status-progress-bg)',
    border: 'var(--status-progress-border)',
    label: 'In Progress',
  },
  Resolved: {
    color: 'var(--status-resolved)',
    bg: 'var(--status-resolved-bg)',
    border: 'var(--status-resolved-border)',
    label: 'Resolved',
  },
  Closed: {
    color: 'var(--status-closed)',
    bg: 'var(--status-closed-bg)',
    border: 'var(--status-closed-border)',
    label: 'Closed',
  },
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Open;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: cfg.color,
          boxShadow: `0 0 8px ${cfg.color}`,
        }}
      />
      {cfg.label}
    </span>
  );
};
