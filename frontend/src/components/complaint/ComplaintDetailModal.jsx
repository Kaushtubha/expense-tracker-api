import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  X,
  Clock,
  User,
  RotateCcw,
  Send,
  MessageSquare,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';

export const ComplaintDetailModal = ({ complaintId, onClose, onComplaintUpdated }) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reopen input
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${complaintId}`);
      setComplaint(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchDetails();
    }
  }, [complaintId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/complaints/${complaintId}/comments`, {
        text: commentText.trim(),
        isInternal: user.role !== 'student' ? isInternalComment : false,
      });
      setComplaint(res.data);
      setCommentText('');
      setIsInternalComment(false);
      if (onComplaintUpdated) onComplaintUpdated(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    try {
      setReopening(true);
      const res = await api.patch(`/complaints/${complaintId}/status`, {
        status: 'Open',
        note: reopenReason.trim(),
      });
      setComplaint(res.data);
      setShowReopenBox(false);
      setReopenReason('');
      if (onComplaintUpdated) onComplaintUpdated(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen complaint');
    } finally {
      setReopening(false);
    }
  };

  if (!complaintId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          backgroundColor: '#111827',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-secondary)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            Loading issue details...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', padding: '20px' }}>{error}</div>
        ) : (
          <div>
            {/* Top Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CategoryIcon category={complaint.category} size={20} />
              <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '0.86rem', fontWeight: '600' }}>
                {complaint.category}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Room {complaint.roomNumber}
              </span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', lineHeight: 1.3 }}>
              {complaint.title}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {complaint.description}
            </p>

            {/* Assigned Staff Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '24px',
                fontSize: '0.86rem',
              }}
            >
              <User size={16} color="#818cf8" />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Staff: </span>
                <span style={{ fontWeight: '600', color: complaint.assignedTo ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {complaint.assignedTo?.name || 'Unassigned (Pending Warden review)'}
                </span>
                {complaint.assignedTo?.phone && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                    (📞 {complaint.assignedTo.phone})
                  </span>
                )}
              </div>
            </div>

            {/* Student Reopen Banner if Resolved */}
            {user.role === 'student' && complaint.status === 'Resolved' && (
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#f59e0b" />
                    <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#fbbf24' }}>
                      Marked as Resolved. Did this fix your issue?
                    </span>
                  </div>
                  {!showReopenBox && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowReopenBox(true)}
                      style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                    >
                      <RotateCcw size={14} /> Reopen Issue
                    </button>
                  )}
                </div>

                {showReopenBox && (
                  <form onSubmit={handleReopen} style={{ marginTop: '12px' }}>
                    <textarea
                      required
                      className="input-field"
                      rows={2}
                      placeholder="Explain what is still not working properly..."
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setShowReopenBox(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={reopening}
                        className="btn btn-sm btn-danger"
                      >
                        {reopening ? 'Reopening...' : 'Confirm Reopen'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Status History Stepper / Audit Trail */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <History size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Status History Trail</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px' }}>
                {complaint.statusHistory?.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      paddingLeft: '24px',
                      borderLeft: idx === complaint.statusHistory.length - 1 ? '2px solid transparent' : '2px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '-7px',
                        top: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#6366f1',
                        border: '2px solid #111827',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                        Status set to <span style={{ color: '#818cf8' }}>{step.status}</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        by {step.changedBy?.name || 'System'} ({step.changedBy?.role || 'user'})
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {step.note && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        "{step.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Feed */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MessageSquare size={16} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                  Comments & Updates ({complaint.comments?.length || 0})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                {complaint.comments?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    No comments yet. Post an update or question below.
                  </p>
                ) : (
                  complaint.comments?.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: c.isInternal ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: c.isInternal ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {c.author?.name || 'User'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {c.author?.role || 'staff'}
                          </span>
                          {c.isInternal && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                fontWeight: '700',
                              }}
                            >
                              Internal Staff Note
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  required
                  rows={2}
                  className="input-field"
                  placeholder="Write a message or update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ fontSize: '0.86rem' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {user.role !== 'student' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                      />
                      Internal note (hidden from student)
                    </label>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="btn btn-sm btn-primary"
                    style={{ opacity: submittingComment ? 0.7 : 1 }}
                  >
                    <Send size={14} /> Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
