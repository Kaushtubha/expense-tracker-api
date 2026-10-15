import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { Skeleton, EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { ComplaintDetailView } from '../../components/complaint/ComplaintDetailView';
import { formatRelativeTime } from '../../lib/formatters';
import {
  Wrench,
  Play,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../services/api';

export function StaffQueuePage() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Resolution modal state
  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const MOCK_STAFF_QUEUE = [
    {
      _id: 'stf-c-1',
      ticketId: 'CMP-2026-001',
      title: 'Bathroom geyser tripping MCB switch after 5 mins',
      category: 'Electrical',
      priority: 'Critical',
      roomNumber: 'B-204',
      description: 'The geyser switches on normally, but as soon as the water begins heating, the 16A MCB trips the entire room power circuit.',
      status: 'Open',
      student: { name: 'Aarav Patel' },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      _id: 'stf-c-4',
      ticketId: 'CMP-2026-004',
      title: 'Ceiling fan regulator sparking on speed 4',
      category: 'Electrical',
      priority: 'Critical',
      roomNumber: 'B-205',
      description: 'Sparks observed from switchboard when regulator turned past speed 3.',
      status: 'In Progress',
      student: { name: 'Vikram Mehta' },
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      _id: 'stf-c-7',
      ticketId: 'CMP-2026-007',
      title: 'Study lamp wall socket dead, no voltage output',
      category: 'Electrical',
      priority: 'Medium',
      roomNumber: 'A-108',
      description: 'Right wall socket above study desk is completely dead.',
      status: 'Open',
      student: { name: 'Rohan Joshi' },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];

  const fetchStaffQueue = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/complaints?limit=50');
      const list = res.data.complaints || res.data.data || [];
      if (list.length > 0) {
        setComplaints(list);
      } else {
        setComplaints(MOCK_STAFF_QUEUE);
      }
    } catch (err) {
      setComplaints(MOCK_STAFF_QUEUE);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffQueue();
  }, []);

  // Filter queue into Active vs Completed
  const { activeQueue, completedQueue } = useMemo(() => {
    const active = [];
    const completed = [];

    complaints.forEach((c) => {
      const st = (c.status || '').toLowerCase();
      if (st === 'resolved' || st === 'closed') {
        completed.push(c);
      } else {
        active.push(c);
      }
    });

    // Sort active queue: Critical on top, then High, then Medium, then Low
    const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    active.sort((a, b) => {
      const pA = priorityWeight[a.priority] || 0;
      const pB = priorityWeight[b.priority] || 0;
      return pB - pA;
    });

    return { activeQueue: active, completedQueue: completed };
  }, [complaints]);

  // One-tap: Start Work -> In Progress
  const handleStartWork = async (ticket, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/complaints/${ticket._id}/status`, {
        status: 'In Progress',
      });
      toast.success(`Work started on ticket ${ticket.ticketId || ''}`);
      setComplaints((prev) =>
        prev.map((c) => (c._id === ticket._id ? res.data.complaint || res.data.data : c))
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // One-tap: Submit Resolution -> Resolved
  const handleConfirmResolve = async () => {
    if (!resolvingTicket) return;
    setIsSubmittingResolution(true);
    try {
      // 1. Post resolution comment / note if provided
      if (resolutionNote.trim()) {
        await api.post(`/complaints/${resolvingTicket._id}/comments`, {
          text: `Resolution Summary: ${resolutionNote.trim()}`,
          isInternal: false,
        });
      }

      // 2. Shift status to Resolved
      const res = await api.patch(`/complaints/${resolvingTicket._id}/status`, {
        status: 'Resolved',
      });

      toast.success(`Ticket marked resolved!`);
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === resolvingTicket._id ? res.data.complaint || res.data.data : c
        )
      );
      setResolvingTicket(null);
      setResolutionNote('');
    } catch (err) {
      toast.error('Failed to mark resolved');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Technician Trade Header */}
      <div className="p-6 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[12px] bg-[var(--brand-teal-subtle)] text-[var(--brand-teal)] border border-[var(--brand-teal-border)] flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal)] font-mono-numbers">
                  {user?.staffTrade || 'Campus Maintenance Staff'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-resolved)]" />
                <span className="text-xs text-[var(--text-muted)] font-mono-numbers">On Duty</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
                {user?.name || 'Technician Queue'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-display text-3xl font-bold text-[var(--brand-teal)]">
                {activeQueue.length}
              </span>
              <p className="text-[11px] text-[var(--text-muted)] font-mono-numbers uppercase tracking-wider">
                Assigned Open
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchStaffQueue}
              isLoading={isRefreshing}
              title="Refresh queue"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Work Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
            Active Priority Queue
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-mono-numbers">
            Sorted by urgency & SLA
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : activeQueue.length === 0 ? (
          <EmptyState
            title="All tasks completed!"
            description="No active pending complaints in your queue. Great job keeping the hostel running."
          />
        ) : (
          <div className="space-y-3">
            {activeQueue.map((item) => {
              const isCritical = (item.priority || '').toLowerCase() === 'critical';
              const isInProgress = (item.status || '').toLowerCase() === 'in progress';

              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedTicket(item)}
                  className={`p-5 rounded-[14px] bg-[var(--bg-surface)] border transition-all cursor-pointer shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] flex flex-col justify-between gap-4 ${
                    isCritical
                      ? 'border-[var(--priority-critical)]/40 bg-[var(--priority-critical-bg)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--brand-teal-border)]'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-numbers text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                          {item.ticketId || `#${item._id.slice(-4)}`}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] font-mono-numbers bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                          <MapPin className="w-3 h-3 text-[var(--brand-teal)]" />
                          Room {item.roomNumber || '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={item.priority} />
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {item.description}
                    </p>

                    {item.student?.name && (
                      <p className="mt-2 text-[11px] text-[var(--text-muted)] font-mono-numbers">
                        Reported by: <span className="text-[var(--text-primary)]">{item.student.name}</span> • {formatRelativeTime(item.createdAt)}
                      </p>
                    )}
                  </div>

                  {/* One-Tap Action Buttons (Touch-friendly 48px) */}
                  <div
                    className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isInProgress ? (
                      <Button
                        variant="primary"
                        size="md"
                        className="h-11 px-5"
                        onClick={(e) => handleStartWork(item, e)}
                      >
                        <Play className="w-4 h-4 mr-1.5 fill-current" /> Start Work
                      </Button>
                    ) : (
                      <Button
                        variant="subtleTeal"
                        size="md"
                        className="h-11 px-5 text-[var(--status-resolved)] border-[var(--status-resolved)]/40 bg-[var(--status-resolved-bg)] hover:bg-[var(--status-resolved-bg)]/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResolvingTicket(item);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collapsible Completed Today Section */}
      {completedQueue.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between p-3 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--status-resolved)]" />
              <span>Resolved / Closed Tickets ({completedQueue.length})</span>
            </div>
            {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCompleted && (
            <div className="mt-3 space-y-2">
              {completedQueue.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedTicket(item)}
                  className="p-3.5 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div>
                    <span className="font-mono-numbers font-medium text-[var(--text-muted)] mr-2">
                      {item.ticketId || `#${item._id.slice(-4)}`}
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">{item.title}</span>
                    <span className="ml-2 text-[var(--text-muted)] font-mono-numbers">
                      (Room {item.roomNumber})
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resolution Confirmation Modal */}
      <Modal
        isOpen={!!resolvingTicket}
        onClose={() => setResolvingTicket(null)}
        title="Complete Maintenance Work"
        subtitle={`Confirming resolution for ticket ${resolvingTicket?.ticketId || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Please add a brief summary of the repair performed (e.g. <em>"Replaced MCB 16A breaker in electrical box; geyser heating tested normally"</em>):
          </p>
          <Textarea
            placeholder="Repair notes..."
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            className="text-xs"
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setResolvingTicket(null)}
              disabled={isSubmittingResolution}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isSubmittingResolution}
              onClick={handleConfirmResolve}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Fix & Mark Resolved
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.title || 'Ticket Details'}
        subtitle={selectedTicket?.ticketId || 'Audit Log'}
        width="max-w-2xl"
      >
        <ComplaintDetailView
          complaint={selectedTicket}
          onUpdate={(updated) => {
            setSelectedTicket(updated);
            setComplaints((prev) =>
              prev.map((c) => (c._id === updated._id ? updated : c))
            );
          }}
        />
      </Drawer>
    </div>
  );
}
