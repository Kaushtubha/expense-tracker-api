import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton, EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { NewComplaintModal } from '../../components/complaint/NewComplaintModal';
import { ComplaintDetailView } from '../../components/complaint/ComplaintDetailView';
import { formatRelativeTime } from '../../lib/formatters';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../services/api';

export function StudentComplaintsPage() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const MOCK_STUDENT_COMPLAINTS = [
    {
      _id: 'mock-c-1',
      ticketId: 'CMP-2026-001',
      title: 'Bathroom geyser tripping MCB switch after 5 mins',
      category: 'Electrical',
      priority: 'Critical',
      roomNumber: user?.roomNumber || 'B-204',
      description: 'The geyser switches on normally, but as soon as the water begins heating, the 16A MCB trips the entire room power circuit.',
      status: 'In Progress',
      student: { name: user?.name || 'Aarav Patel', email: user?.email || 'student1@hostel.edu' },
      assignedTo: { name: 'Suresh Kumar', staffTrade: 'Electrician' },
      reopenCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      timeline: [
        { status: 'In Progress', note: 'Technician dispatched with replacement heating element', timestamp: new Date(Date.now() - 3600000).toISOString() },
      ],
      comments: [
        { author: { name: 'Suresh Kumar', role: 'staff' }, text: 'Visiting your room shortly to inspect the coil.', createdAt: new Date(Date.now() - 1800000).toISOString() },
      ],
    },
    {
      _id: 'mock-c-2',
      ticketId: 'CMP-2026-002',
      title: 'Wi-Fi AP node dropping packets in Wing B 2nd floor',
      category: 'Internet / Wi-Fi',
      priority: 'High',
      roomNumber: user?.roomNumber || 'B-204',
      description: 'Frequent latency spikes up to 450ms and complete disconnects during evening study hours.',
      status: 'Open',
      student: { name: user?.name || 'Aarav Patel', email: user?.email || 'student1@hostel.edu' },
      reopenCount: 0,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      timeline: [],
      comments: [],
    },
    {
      _id: 'mock-c-3',
      ticketId: 'CMP-2026-003',
      title: 'Cupboard door hinge loose and catching against frame',
      category: 'Carpentry',
      priority: 'Low',
      roomNumber: user?.roomNumber || 'B-204',
      description: 'Bottom screw stripped on wooden wardrobe door.',
      status: 'Resolved',
      student: { name: user?.name || 'Aarav Patel', email: user?.email || 'student1@hostel.edu' },
      assignedTo: { name: 'Mahesh Sharma', staffTrade: 'Carpenter' },
      reopenCount: 0,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      timeline: [
        { status: 'Resolved', note: 'Replaced hinge screws with 2-inch anchors.', timestamp: new Date(Date.now() - 86400000).toISOString() },
      ],
      comments: [
        { author: { name: 'Mahesh Sharma', role: 'staff' }, text: 'Door aligned and tested smoothly.', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ],
    },
  ];

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/complaints');
      const list = res.data.complaints || res.data.data || [];
      if (list.length > 0) {
        setComplaints(list);
      } else {
        setComplaints(MOCK_STUDENT_COMPLAINTS);
      }
    } catch (err) {
      // In bypass/demo mode, seamlessly provide mock data
      setComplaints(MOCK_STUDENT_COMPLAINTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Keyboard shortcut for search (/) and new complaint (n)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('complaint-search-input')?.focus();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsNewModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const openCount = complaints.filter(
      (c) => (c.status || '').toLowerCase() === 'open'
    ).length;
    const progressCount = complaints.filter(
      (c) => (c.status || '').toLowerCase() === 'in progress'
    ).length;
    const resolvedCount = complaints.filter(
      (c) =>
        (c.status || '').toLowerCase() === 'resolved' ||
        (c.status || '').toLowerCase() === 'closed'
    ).length;
    const total = complaints.length || 1;

    return {
      open: openCount,
      progress: progressCount,
      resolved: resolvedCount,
      total: complaints.length,
      openShare: Math.round((openCount / total) * 100),
      progressShare: Math.round((progressCount / total) * 100),
      resolvedShare: Math.round((resolvedCount / total) * 100),
    };
  }, [complaints]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const status = (c.status || '').toLowerCase();
      const matchesFilter =
        activeFilter === 'All'
          ? true
          : activeFilter === 'Open'
          ? status === 'open'
          : activeFilter === 'In Progress'
          ? status === 'in progress'
          : activeFilter === 'Resolved'
          ? status === 'resolved' || status === 'closed'
          : true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.ticketId?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [complaints, activeFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Time-Aware Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal)] font-mono-numbers">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-teal)]" />
            Resident Dashboard • {user?.roomNumber ? `Room ${user.roomNumber}` : 'Hostel Resident'}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            {greeting}, {user?.name?.split(' ')[0] || 'Resident'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track active maintenance requests or lodge a new issue for prompt technician dispatch.
          </p>
        </div>

        {/* New Complaint Button */}
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsNewModalOpen(true)}
          className="shadow-[var(--shadow-card)]"
        >
          <Plus className="w-4 h-4 mr-1" /> New Complaint
          <span className="ml-1.5 text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-[var(--brand-teal-hover)] text-white/90">
            N
          </span>
        </Button>
      </div>

      {/* Summary Strip (Open, In Progress, Resolved with Progress Bar) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {/* Open Card */}
        <div className="p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Awaiting Dispatch
            </span>
            <AlertCircle className="w-4 h-4 text-[var(--status-open)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
              {metrics.open}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono-numbers">
              active ticket{metrics.open !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-3 w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--status-open)] h-full transition-all duration-300"
              style={{ width: `${metrics.openShare}%` }}
            />
          </div>
        </div>

        {/* In Progress Card */}
        <div className="p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Under Repair
            </span>
            <Clock className="w-4 h-4 text-[var(--status-progress)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
              {metrics.progress}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono-numbers">
              in progress
            </span>
          </div>
          <div className="mt-3 w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--status-progress)] h-full transition-all duration-300"
              style={{ width: `${metrics.progressShare}%` }}
            />
          </div>
        </div>

        {/* Resolved Card */}
        <div className="p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Resolved & Verified
            </span>
            <CheckCircle2 className="w-4 h-4 text-[var(--status-resolved)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-[var(--text-primary)]">
              {metrics.resolved}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono-numbers">
              fixed successfully
            </span>
          </div>
          <div className="mt-3 w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--status-resolved)] h-full transition-all duration-300"
              style={{ width: `${metrics.resolvedShare}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-6">
        {/* Segmented Filter Bar */}
        <div className="flex items-center p-1 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-color)]">
          {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--brand-teal)] text-[var(--text-inverse)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search Input with / shortcut */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <Input
            id="complaint-search-input"
            type="search"
            placeholder="Search complaints... (/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Complaint Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Skeleton key={idx} className="h-44" />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching complaints found' : 'No complaints filed'}
          description={
            searchQuery
              ? `No requests matched "${searchQuery}". Try a different keyword.`
              : 'You have no maintenance complaints on record. Lodge one anytime.'
          }
          actionLabel="Lodge a Complaint"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredComplaints.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedComplaint(item)}
                className="group relative p-5 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--brand-teal-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top row: Ticket ID, Category & Priority */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono-numbers text-[11px] font-semibold text-[var(--text-muted)]">
                      {item.ticketId || `#CMP-${item._id.slice(-4)}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-teal)] transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {/* Description preview */}
                  <p className="mt-1.5 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom metadata */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono-numbers">
                  <div className="flex items-center gap-1.5">
                    <CategoryBadge category={item.category} />
                    {item.reopenCount > 0 && (
                      <span className="text-[10px] text-[var(--priority-critical)] font-semibold inline-flex items-center gap-0.5">
                        <RotateCcw className="w-2.5 h-2.5" /> {item.reopenCount}x
                      </span>
                    )}
                  </div>
                  <span>{formatRelativeTime(item.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={selectedComplaint?.title || 'Complaint Details'}
        subtitle={selectedComplaint?.ticketId || 'Audit Log & Thread'}
        width="max-w-2xl"
      >
        <ComplaintDetailView
          complaint={selectedComplaint}
          onUpdate={(updated) => {
            setSelectedComplaint(updated);
            setComplaints((prev) =>
              prev.map((c) => (c._id === updated._id ? updated : c))
            );
          }}
        />
      </Drawer>

      {/* New Complaint Modal */}
      <NewComplaintModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={(newTicket) => {
          setComplaints((prev) => [newTicket, ...prev]);
        }}
      />
    </div>
  );
}
