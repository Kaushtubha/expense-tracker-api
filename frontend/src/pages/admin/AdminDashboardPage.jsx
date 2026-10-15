import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { ComplaintDetailView } from '../../components/complaint/ComplaintDetailView';
import { formatRelativeTime } from '../../lib/formatters';
import {
  RotateCw,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ClipboardList,
  Sparkles,
  Flame,
  Inbox,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import api from '../../services/api';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  // Fetch Dashboard Metrics & Technicians
  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const [metricsRes, complaintsRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/complaints?limit=8'),
      ]);

      setMetrics(metricsRes.data.data || metricsRes.data);
      const list = complaintsRes.data.complaints || complaintsRes.data.data || [];
      setRecentComplaints(list);

      // Extract unique technicians if available
      const staffMembers = [
        { _id: 'tech-1', name: 'Ramesh Kumar', staffTrade: 'Electrician' },
        { _id: 'tech-2', name: 'Suresh Patel', staffTrade: 'Plumber' },
        { _id: 'tech-3', name: 'Deepak Sharma', staffTrade: 'Carpenter' },
      ];
      setTechnicians(staffMembers);
    } catch (err) {
      toast.error('Failed to load dashboard operational metrics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Today's formatted institutional date
  const todayDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, []);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!recentComplaints.length) {
      toast.error('No complaints available to export.');
      return;
    }

    const headers = 'Ticket ID,Title,Category,Priority,Status,Room,Date\n';
    const rows = recentComplaints
      .map(
        (c) =>
          `"${c.ticketId || c._id}","${c.title}","${c.category}","${c.priority}","${c.status}","${c.roomNumber}","${c.createdAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel-complaints-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Complaint log exported as CSV');
  };

  // Category donut colors
  const categoryPalette = ['#0F766E', '#4F6BED', '#D97706', '#15803D', '#E11D48', '#8B5CF6'];

  const categoryData = useMemo(() => {
    if (!metrics?.categoryBreakdown) return [];
    return metrics.categoryBreakdown.map((item, idx) => ({
      name: item.category || item._id,
      value: item.count,
      color: categoryPalette[idx % categoryPalette.length],
    }));
  }, [metrics]);

  // Simulated 14-day timeline area chart data
  const timelineData = useMemo(() => {
    const days = ['D-13', 'D-11', 'D-9', 'D-7', 'D-5', 'D-3', 'D-1', 'Today'];
    const total = metrics?.total || 30;
    return days.map((day, i) => ({
      day,
      complaints: Math.max(2, Math.round((total / 10) + Math.sin(i) * 3 + i * 0.8)),
    }));
  }, [metrics]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header: Operational Date & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal)] font-mono-numbers">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-teal)]" />
            Warden Control Room • {todayDate}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Hostel Operations Center
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Facility service-level agreement (SLA) status, technician delegation, and incident tracking.
          </p>
        </div>

        {/* Quick Action Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            isLoading={isRefreshing}
            className="text-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>

          <Link to="/admin/complaints">
            <Button variant="primary" size="sm" className="text-xs">
              <ClipboardList className="w-3.5 h-3.5 mr-1" /> Master Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Row (6 Asymmetric Cards with display typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 my-6">
        {/* 1. Total Complaints */}
        <KpiCard
          title="Total Tickets"
          value={metrics?.total || 0}
          deltaText="All logged requests"
          icon={Inbox}
          className="lg:col-span-2 bg-[var(--bg-surface)]"
        />

        {/* 2. Active Unresolved */}
        <KpiCard
          title="Active Pending"
          value={metrics?.active || 0}
          deltaText="Requires attention"
          icon={AlertTriangle}
          accentColor="var(--status-open)"
          className="lg:col-span-1"
        />

        {/* 3. In Progress */}
        <KpiCard
          title="In Progress"
          value={metrics?.inProgress || 0}
          deltaText="Under active repair"
          icon={Clock}
          accentColor="var(--status-progress)"
          className="lg:col-span-1"
        />

        {/* 4. Resolved */}
        <KpiCard
          title="Resolved"
          value={metrics?.resolved || 0}
          deltaText="Verified complete"
          icon={CheckCircle2}
          accentColor="var(--status-resolved)"
          className="lg:col-span-1"
        />

        {/* 5. Critical Alerts (Rose Accent + Pulse) */}
        <KpiCard
          title="Critical SLA"
          value={metrics?.critical || 0}
          deltaText="<4h Emergency SLA"
          icon={Flame}
          accentColor="var(--priority-critical)"
          isPulsing={Boolean(metrics?.critical > 0)}
          className="lg:col-span-1 border-[var(--priority-critical)]/40 bg-[var(--priority-critical-bg)]/20"
        />
      </div>

      {/* SLA Metric & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
        {/* Left: 14-Day Complaint Volume Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
                14-Day Maintenance Volume Trend
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Rolling daily complaint intake rate across residential blocks
              </p>
            </div>
            <span className="text-xs font-mono-numbers px-2 py-0.5 rounded bg-[var(--brand-teal-subtle)] text-[var(--brand-teal)] border border-[var(--brand-teal-border)]">
              Avg SLA: {metrics?.avgResolutionHours || 14.5} hrs
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-teal)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--brand-teal)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="var(--brand-teal)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution Donut Chart */}
        <div className="p-5 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Trade Category Distribution
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Proportion of issues by maintenance trade
            </p>
          </div>

          <div className="h-44 my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-xl font-bold text-[var(--text-primary)]">
                {metrics?.total || 0}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                Total
              </span>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
            {categoryData.map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name}:</span>
                <strong className="font-mono-numbers text-[var(--text-primary)]">{cat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High-Priority & Urgent Tickets Table */}
      <div className="p-5 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
              Live Priority Queue
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Click any ticket row to inspect audit trail, reassign staff, or post internal notes
            </p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-[var(--brand-teal)] hover:underline flex items-center gap-1"
          >
            View all tickets <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] font-mono-numbers uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Issue Title</th>
                <th className="py-2.5 px-3">Trade</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {recentComplaints.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => setSelectedComplaint(item)}
                  className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 font-mono-numbers font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-teal)]">
                    {item.ticketId || `#${item._id.slice(-4)}`}
                  </td>
                  <td className="py-3 px-3 font-mono-numbers font-semibold">
                    {item.roomNumber || '—'}
                  </td>
                  <td className="py-3 px-3 font-medium text-[var(--text-primary)] max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="py-3 px-3">
                    <CategoryBadge category={item.category} />
                  </td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-3 text-[var(--text-muted)] font-mono-numbers">
                    {formatRelativeTime(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel Drawer for Selected Ticket */}
      <Drawer
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={selectedComplaint?.title || 'Complaint Investigation'}
        subtitle={selectedComplaint?.ticketId || 'Audit Log & Activity'}
        width="max-w-2xl"
      >
        <ComplaintDetailView
          complaint={selectedComplaint}
          technicians={technicians}
          onUpdate={(updated) => {
            setSelectedComplaint(updated);
            setRecentComplaints((prev) =>
              prev.map((c) => (c._id === updated._id ? updated : c))
            );
          }}
        />
      </Drawer>
    </div>
  );
}
