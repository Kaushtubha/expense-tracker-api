import {
  Wrench,
  Zap,
  Wifi,
  Hammer,
  Sparkles,
  Fan,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
} from 'lucide-react';

/**
 * Format relative time using native Intl.RelativeTimeFormat
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);

  if (Math.abs(diffSec) < 45) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, Infinity];
  const units = ['second', 'minute', 'hour', 'day', 'week', 'month'];
  const unitIndex = cutoffs.findIndex((cutoff) => cutoff > Math.abs(diffSec));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  return rtf.format(Math.round(diffSec / divisor), units[unitIndex]);
}

/**
 * Format full date & time (e.g. "15 Oct 2026, 10:30 AM")
 */
export function formatFullDateTime(dateString) {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString));
}

/**
 * Format display numbers (e.g. 1,420)
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num ?? 0);
}

/**
 * Category Definitions with Lucide Icons and descriptions
 */
export const CATEGORIES = [
  { id: 'Electrical', label: 'Electrical', icon: Zap, hint: 'Lights, switches, geyser, sockets' },
  { id: 'Plumbing', label: 'Plumbing', icon: Wrench, hint: 'Taps, leakage, flush, drainage' },
  { id: 'Internet / Wi-Fi', label: 'Internet / Wi-Fi', icon: Wifi, hint: 'Router down, slow speed, login' },
  { id: 'Carpentry', label: 'Carpentry', icon: Hammer, hint: 'Door lock, bed, desk, cupboard' },
  { id: 'Cleanliness', label: 'Cleanliness', icon: Sparkles, hint: 'Room dustbin, corridor, washroom' },
  { id: 'HVAC', label: 'HVAC / Cooling', icon: Fan, hint: 'Ceiling fan, AC, ventilation' },
];

export function getCategoryMeta(categoryId) {
  const found = CATEGORIES.find((c) => c.id.toLowerCase() === (categoryId || '').toLowerCase());
  return found || { id: categoryId, label: categoryId || 'Other', icon: HelpCircle, hint: 'General maintenance' };
}

/**
 * Priority Definitions
 */
export const PRIORITIES = [
  { id: 'Low', label: 'Low', color: 'var(--priority-low)', bg: 'var(--priority-low-bg)', hint: 'Minor issue, >48h SLA' },
  { id: 'Medium', label: 'Medium', color: 'var(--priority-medium)', bg: 'var(--priority-medium-bg)', hint: 'Standard, 24-48h SLA' },
  { id: 'High', label: 'High', color: 'var(--priority-high)', bg: 'var(--priority-high-bg)', hint: 'Urgent, 12-24h SLA' },
  { id: 'Critical', label: 'Critical', color: 'var(--priority-critical)', bg: 'var(--priority-critical-bg)', hint: 'Emergency, <4h SLA' },
];

export function getPriorityMeta(priorityId) {
  const found = PRIORITIES.find((p) => p.id.toLowerCase() === (priorityId || '').toLowerCase());
  return found || PRIORITIES[1];
}

/**
 * Status Definitions
 */
export const STATUSES = [
  { id: 'Open', label: 'Open', color: 'var(--status-open)', bg: 'var(--status-open-bg)', icon: AlertCircle },
  { id: 'In Progress', label: 'In Progress', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)', icon: Clock },
  { id: 'Resolved', label: 'Resolved', color: 'var(--status-resolved)', bg: 'var(--status-resolved-bg)', icon: CheckCircle2 },
  { id: 'Closed', label: 'Closed', color: 'var(--status-closed)', bg: 'var(--status-closed-bg)', icon: Archive },
];

export function getStatusMeta(statusId) {
  const found = STATUSES.find((s) => s.id.toLowerCase() === (statusId || '').toLowerCase());
  return found || STATUSES[0];
}
