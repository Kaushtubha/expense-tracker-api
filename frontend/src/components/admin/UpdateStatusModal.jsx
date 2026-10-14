import React, { useState } from 'react';
import api from '../../services/api';
import { X, RefreshCw } from 'lucide-react';

export const UpdateStatusModal = ({ complaint, onClose, onStatusUpdated }) => {
  const [status, setStatus] = useState(complaint.status || 'In Progress');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await api.patch(`/complaints/${complaint._id}/status`, {
        status,
        note: note.trim() || undefined,
      });
      onStatusUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
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
          maxWidth: '460px',
          padding: '28px',
          backgroundColor: '#111827',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Update Complaint Status</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Room {complaint.roomNumber} • Current: <strong>{complaint.status}</strong>
            </p>
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label" htmlFor="newStatus">New Lifecycle Status</label>
            <select
              id="newStatus"
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress (Work Ongoing)</option>
              <option value="Resolved">Resolved (Work Completed)</option>
              <option value="Closed">Closed (Verified & Finished)</option>
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="auditNote">Audit Trail Note / Reason (Optional)</label>
            <textarea
              id="auditNote"
              rows={3}
              className="input-field"
              placeholder="e.g. Replaced capacitor in fan, checked voltage stability."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ fontSize: '0.86rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
