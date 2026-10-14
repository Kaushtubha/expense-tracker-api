import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { ComplaintDetailModal } from '../../components/complaint/ComplaintDetailModal';
import { UpdateStatusModal } from '../../components/admin/UpdateStatusModal';
import { AssignStaffModal } from '../../components/admin/AssignStaffModal';
import {
  Search,
  Filter,
  UserCheck,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [detailComplaintId, setDetailComplaintId] = useState(null);
  const [statusModalComplaint, setStatusModalComplaint] = useState(null);
  const [assignModalComplaint, setAssignModalComplaint] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (status) params.status = status;
      if (category) params.category = category;
      if (priority) params.priority = priority;

      const res = await api.get('/complaints', { params });
      setComplaints(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, category, priority]);

  // Client-side search for rapid responsiveness
  const filtered = complaints.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.roomNumber.toLowerCase().includes(q) ||
      (c.student?.name && c.student.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container" style={{ padding: '36px 20px', minHeight: 'calc(100vh - 68px)' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Maintenance Complaints Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Filter, assign, and update student maintenance requests across hostel wings
          </p>
        </div>

        <button onClick={fetchComplaints} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <select
            className="input-field"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ width: '140px', padding: '8px 12px', fontSize: '0.84rem' }}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Category filter */}
          <select
            className="input-field"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            style={{ width: '150px', padding: '8px 12px', fontSize: '0.84rem' }}
          >
            <option value="">All Categories</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="wifi">Wi-Fi</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="furniture">Furniture</option>
            <option value="other">Other</option>
          </select>

          {/* Priority filter */}
          <select
            className="input-field"
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            style={{ width: '130px', padding: '8px 12px', fontSize: '0.84rem' }}
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search room / title..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', width: '220px', padding: '8px 12px 8px 32px', fontSize: '0.84rem' }}
          />
        </div>
      </div>

      {/* Complaints Table */}
      {error && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', borderRadius: '10px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="glass-card" style={{ overflowX: 'auto', padding: '0', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: '600' }}>Room</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: '600' }}>Issue Title</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: '600' }}>Priority</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: '600' }}>Assigned To</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Loading complaints table...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  No complaints found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c._id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Room */}
                  <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {c.roomNumber}
                  </td>

                  {/* Title & Student */}
                  <td style={{ padding: '14px 18px', maxWidth: '240px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      By: {c.student?.name || 'Student'}
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CategoryIcon category={c.category} size={15} />
                      <span style={{ textTransform: 'capitalize' }}>{c.category}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '14px 18px' }}>
                    <PriorityBadge priority={c.priority} />
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={c.status} />
                  </td>

                  {/* Assigned To */}
                  <td style={{ padding: '14px 18px', color: c.assignedTo ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {c.assignedTo?.name || '—'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        title="View Full Timeline & Comments"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 8px' }}
                        onClick={() => setDetailComplaintId(c._id)}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        title="Update Status"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 8px' }}
                        onClick={() => setStatusModalComplaint(c)}
                      >
                        <RefreshCw size={13} />
                      </button>
                      <button
                        title="Assign Maintenance Staff"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '5px 8px' }}
                        onClick={() => setAssignModalComplaint(c)}
                      >
                        <UserCheck size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing page {pagination.page} of {pagination.totalPages || 1} ({pagination.totalCount || 0} total issues)
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="btn btn-secondary btn-sm"
              style={{ opacity: page >= (pagination.totalPages || 1) ? 0.5 : 1 }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {detailComplaintId && (
        <ComplaintDetailModal
          complaintId={detailComplaintId}
          onClose={() => setDetailComplaintId(null)}
          onComplaintUpdated={fetchComplaints}
        />
      )}

      {statusModalComplaint && (
        <UpdateStatusModal
          complaint={statusModalComplaint}
          onClose={() => setStatusModalComplaint(null)}
          onStatusUpdated={fetchComplaints}
        />
      )}

      {assignModalComplaint && (
        <AssignStaffModal
          complaint={assignModalComplaint}
          onClose={() => setAssignModalComplaint(null)}
          onAssigned={fetchComplaints}
        />
      )}
    </div>
  );
};
