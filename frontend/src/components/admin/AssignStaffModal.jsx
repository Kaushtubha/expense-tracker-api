import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, UserCheck, Check } from 'lucide-react';

export const AssignStaffModal = ({ complaint, onClose, onAssigned }) => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fallback demo staff list if API doesn't have an endpoint for staff list
  useEffect(() => {
    // We can infer staff members from seed accounts or query them
    setStaffList([
      { _id: 'electrician_id', name: 'Suresh Kumar', email: 'electrician@hostel.edu', role: 'staff', specialty: 'Electrician' },
      { _id: 'plumber_id', name: 'Ramesh Patel', email: 'plumber@hostel.edu', role: 'staff', specialty: 'Plumber' },
      { _id: 'carpenter_id', name: 'Mahesh Sharma', email: 'carpenter@hostel.edu', role: 'staff', specialty: 'Carpenter' },
    ]);
  }, []);

  const handleAssign = async (staffId) => {
    try {
      setSubmitting(true);
      setError('');
      // In seed, staff members were created with email
      // To get real IDs, let's fetch staff or let user input/select
      const res = await api.patch(`/complaints/${complaint._id}/assign`, {
        staffId: staffId,
      });
      onAssigned(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign staff member');
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
          maxWidth: '480px',
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
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <UserCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Assign Maintenance Staff</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Room {complaint.roomNumber} • {complaint.category}
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Complaint: <strong style={{ color: 'var(--text-primary)' }}>"{complaint.title}"</strong>
        </p>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <label className="input-label">Select Hostel Staff Member:</label>
          {/* Form input for staff user ID or selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Paste Staff Member User ID..."
              className="input-field"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              style={{ fontSize: '0.86rem' }}
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Tip: You can use any valid User Object ID with role 'staff' or 'admin'.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || !selectedStaffId.trim()}
            className="btn btn-primary btn-sm"
            onClick={() => handleAssign(selectedStaffId.trim())}
          >
            {submitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
