import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { ComplaintDetailModal } from '../../components/complaint/ComplaintDetailModal';
import { PlusCircle, Search, Filter, MessageSquare, Clock, AlertCircle } from 'lucide-react';

export const StudentComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected complaint for modal
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const res = await api.get('/complaints', { params });
      setComplaints(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container" style={{ padding: '36px 20px', minHeight: 'calc(100vh - 68px)' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>My Complaints</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Room {user?.roomNumber || 'N/A'} • Track your reported hostel maintenance issues
          </p>
        </div>

        <Link to="/student/new-complaint" className="btn btn-primary">
          <PlusCircle size={18} /> Raise New Complaint
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="btn btn-sm"
              style={{
                backgroundColor: statusFilter === st ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: statusFilter === st ? '#818cf8' : 'var(--text-secondary)',
                border: statusFilter === st ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="input-field"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '150px', padding: '8px 12px', fontSize: '0.84rem' }}
          >
            <option value="All">All Categories</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="wifi">Wi-Fi</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="furniture">Furniture</option>
            <option value="other">Other</option>
          </select>

          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', width: '180px', padding: '8px 12px 8px 32px', fontSize: '0.84rem' }}
            />
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading your complaints...
        </div>
      ) : error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Filter size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Complaints Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '380px' }}>
              {searchQuery || statusFilter !== 'All' || categoryFilter !== 'All'
                ? 'No issues match your current filters. Try resetting the filters.'
                : 'You have not raised any complaints yet. Everything seems in order!'}
            </p>
          </div>
          <Link to="/student/new-complaint" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Raise a Complaint
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredComplaints.map((c) => (
            <div
              key={c._id}
              className="glass-card"
              style={{
                padding: '22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onClick={() => setSelectedComplaintId(c._id)}
            >
              <div>
                {/* Card Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CategoryIcon category={c.category} size={18} />
                    <span style={{ fontSize: '0.82rem', textTransform: 'capitalize', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      {c.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: 1.35 }}>
                  {c.title}
                </h3>

                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {c.description}
                </p>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} />
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MessageSquare size={13} />
                    <span>{c.comments?.length || 0}</span>
                  </div>
                  <span style={{ color: '#818cf8', fontWeight: '600' }}>View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal View */}
      {selectedComplaintId && (
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onComplaintUpdated={() => fetchComplaints()}
        />
      )}
    </div>
  );
};
