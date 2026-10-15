import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import {
  formatRelativeTime,
  formatFullDateTime,
  STATUSES,
} from '../../lib/formatters';
import {
  Clock,
  Send,
  Lock,
  RotateCcw,
  User,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  MessageSquare,
  History,
  Shield,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

export function ComplaintDetailView({
  complaint,
  onUpdate,
  technicians = [],
}) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Reopen State
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  // Lightbox
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Status & Assign Actions
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(
    complaint.assignedTo?._id || ''
  );
  const [isAssigning, setIsAssigning] = useState(false);

  if (!complaint) return null;

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'staff';
  const isStudent = user?.role === 'student';
  const isResolved = (complaint.status || '').toLowerCase() === 'resolved';

  // 1. Post Comment / Note
  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/complaints/${complaint._id}/comments`, {
        text: commentText.trim(),
        isInternal: isInternalNote,
      });
      toast.success(isInternalNote ? 'Internal note added' : 'Comment posted');
      setCommentText('');
      setIsInternalNote(false);
      if (onUpdate) onUpdate(res.data.complaint || res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 2. Reopen Ticket (Student)
  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      toast.error('Please specify why this issue is not fixed yet.');
      return;
    }

    setIsReopening(true);
    try {
      const res = await api.post(`/complaints/${complaint._id}/reopen`, {
        reason: reopenReason.trim(),
      });
      toast.success('Complaint reopened and escalated to maintenance staff');
      setShowReopenBox(false);
      setReopenReason('');
      if (onUpdate) onUpdate(res.data.complaint || res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen complaint');
    } finally {
      setIsReopening(false);
    }
  };

  // 3. Status Switcher (Admin / Staff)
  const handleStatusChange = async (newStatus) => {
    if (newStatus === complaint.status) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/complaints/${complaint._id}/status`, {
        status: newStatus,
      });
      toast.success(`Status updated to ${newStatus}`);
      if (onUpdate) onUpdate(res.data.complaint || res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 4. Assign Staff (Admin)
  const handleAssignStaff = async (staffId) => {
    setSelectedStaffId(staffId);
    if (!staffId) return;

    setIsAssigning(true);
    try {
      const res = await api.patch(`/complaints/${complaint._id}/assign`, {
        staffId,
      });
      toast.success('Technician assigned successfully');
      if (onUpdate) onUpdate(res.data.complaint || res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign staff');
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter internal notes if student
  const visibleComments = (complaint.comments || []).filter(
    (c) => !c.isInternal || isStaffOrAdmin
  );

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono-numbers text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {complaint.ticketId || `#CMP-${complaint._id?.slice(-4)}`}
          </span>
          <CategoryBadge category={complaint.category} />
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
          {complaint.reopenCount > 0 && (
            <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded-full bg-[var(--priority-critical-bg)] text-[var(--priority-critical)] border border-[var(--priority-critical)]/30 font-medium inline-flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reopened {complaint.reopenCount}x
            </span>
          )}
        </div>

        <h1 className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
          {complaint.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-mono-numbers">
          <span>Room: <strong className="text-[var(--text-primary)]">{complaint.roomNumber || '—'}</strong></span>
          <span>Student: <strong className="text-[var(--text-primary)]">{complaint.student?.name || 'Resident'}</strong></span>
          <span>Lodged: <strong className="text-[var(--text-primary)]">{formatRelativeTime(complaint.createdAt)}</strong></span>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
        {complaint.description}
      </div>

      {/* Image Attachment (with zoom lightbox) */}
      {complaint.imageUrl && (
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
            Attached Verification Photo
          </p>
          <div
            onClick={() => setIsImageZoomed(true)}
            className="relative group w-full max-w-sm rounded-[10px] overflow-hidden border border-[var(--border-color)] bg-black/5 cursor-pointer shadow-[var(--shadow-subtle)]"
          >
            <img
              src={complaint.imageUrl}
              alt="Complaint photo"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1.5 font-medium">
              <ZoomIn className="w-4 h-4" /> Click to enlarge
            </div>
          </div>

          {/* Lightbox Modal */}
          {isImageZoomed && (
            <div
              onClick={() => setIsImageZoomed(false)}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
            >
              <img
                src={complaint.imageUrl}
                alt="Enlarged complaint view"
                className="max-w-full max-h-[90vh] rounded-[10px] shadow-2xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Admin / Staff Controls: Status Switcher & Delegation */}
      {isStaffOrAdmin && (
        <div className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4 shadow-[var(--shadow-subtle)]">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Advance Ticket Status
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {STATUSES.map((st) => {
                const isActive = (complaint.status || '').toLowerCase() === st.id.toLowerCase();
                return (
                  <button
                    key={st.id}
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange(st.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-[8px] border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--brand-teal)] text-[var(--text-inverse)] border-[var(--brand-teal)] shadow-sm'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--border-color)]'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staff Delegation (Admin only) */}
          {user?.role === 'admin' && technicians.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Assign Maintenance Specialist
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => handleAssignStaff(e.target.value)}
                disabled={isAssigning}
                className="w-full h-10 px-3 text-xs rounded-[10px] bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-[var(--brand-teal)] cursor-pointer"
              >
                <option value="">Unassigned (Open Queue)</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} — {t.staffTrade || 'General Staff'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Student Reopen Section (Active when status is Resolved) */}
      {isStudent && isResolved && (
        <div className="p-4 rounded-[12px] bg-[var(--status-resolved-bg)] border border-[var(--status-resolved-border)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--status-resolved)]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Marked Resolved by Maintenance Team</span>
            </div>
            {!showReopenBox && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReopenBox(true)}
                className="text-[var(--priority-critical)] border-[var(--priority-critical)]/40 hover:bg-[var(--priority-critical-bg)]"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Not Fixed? Reopen
              </Button>
            )}
          </div>

          {showReopenBox && (
            <div className="mt-3 pt-3 border-t border-[var(--status-resolved-border)] space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">
                Explain what is still faulty (e.g. <em>"Geyser still tripping MCB switch after 5 mins"</em>):
              </p>
              <Textarea
                placeholder="Reason for reopening..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="text-xs"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReopenBox(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isReopening}
                  onClick={handleReopen}
                >
                  Confirm Reopen Ticket
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vertical Audit Trail / Timeline */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
            Audit Trail & History
          </h2>
        </div>

        <div className="relative pl-6 border-l-2 border-[var(--border-subtle)] space-y-4 my-2">
          {/* Initial Ticket Raised */}
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--brand-teal)] ring-4 ring-[var(--bg-surface)]" />
            <div className="text-xs">
              <p className="font-semibold text-[var(--text-primary)]">
                Complaint Registered by {complaint.student?.name || 'Resident'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono-numbers mt-0.5">
                {formatFullDateTime(complaint.createdAt)}
              </p>
            </div>
          </div>

          {/* Audit events */}
          {(complaint.timeline || []).map((event, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--text-muted)] ring-4 ring-[var(--bg-surface)]" />
              <div className="text-xs">
                <p className="font-medium text-[var(--text-primary)]">
                  Status shifted to <span className="font-semibold text-[var(--brand-teal)]">{event.status}</span>
                  {event.changedBy?.name && ` by ${event.changedBy.name}`}
                </p>
                {event.note && (
                  <p className="mt-1 text-xs text-[var(--text-secondary)] italic bg-[var(--bg-subtle)] px-2.5 py-1 rounded-[6px]">
                    "{event.note}"
                  </p>
                )}
                <p className="text-[10px] text-[var(--text-muted)] font-mono-numbers mt-0.5">
                  {formatFullDateTime(event.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Thread & Internal Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
            <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
              Activity & Comments
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono-numbers">
            {visibleComments.length} messages
          </span>
        </div>

        {/* Message Stream */}
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
          {visibleComments.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic text-center py-4">
              No messages posted yet. Use the composer below to inquire or coordinate.
            </p>
          ) : (
            visibleComments.map((comment, idx) => {
              const isStaffAuthor = comment.author?.role === 'staff' || comment.author?.role === 'admin';
              const isInternal = comment.isInternal;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-[10px] text-xs space-y-1 ${
                    isInternal
                      ? 'bg-[var(--bg-subtle)] border-2 border-dashed border-[var(--border-color)]'
                      : isStaffAuthor
                      ? 'bg-[var(--brand-teal-subtle)] border border-[var(--brand-teal-border)] ml-3'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-color)] mr-3'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      {isInternal && <Lock className="w-3 h-3 text-[var(--priority-critical)]" />}
                      {comment.author?.name || 'User'}
                      <span className="text-[10px] font-normal text-[var(--text-muted)] capitalize">
                        ({comment.author?.role || 'member'})
                      </span>
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono-numbers">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {comment.text}
                  </p>
                  {isInternal && (
                    <span className="inline-block text-[9px] uppercase tracking-wider text-[var(--priority-critical)] font-bold">
                      Private Internal Note (Hidden from Student)
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Comment Composer */}
        <form onSubmit={handleAddComment} className="space-y-2">
          <Textarea
            placeholder={
              isInternalNote
                ? 'Add confidential note (vendor quotes, internal remarks)...'
                : 'Write a comment or coordinate access with technician...'
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            className="text-xs min-h-[72px]"
          />

          <div className="flex items-center justify-between">
            {isStaffOrAdmin ? (
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded text-[var(--brand-teal)] focus:ring-[var(--brand-teal)]"
                />
                <Lock className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="font-medium">Internal Note (Staff only)</span>
              </label>
            ) : (
              <span className="text-[11px] text-[var(--text-muted)]">
                Press Enter to send
              </span>
            )}

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingComment}
              disabled={!commentText.trim()}
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
