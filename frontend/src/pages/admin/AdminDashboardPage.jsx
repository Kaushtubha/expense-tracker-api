import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Zap,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  PieChart,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading HostelPulse Intelligence Dashboard...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ color: '#ef4444', padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
          {error || 'Unable to load metrics'}
        </div>
      </div>
    );
  }

  const {
    totalComplaints = 0,
    statusBreakdown = {},
    urgentUnresolved = 0,
    averageResolutionHours = 0,
    categoryBreakdown = [],
    priorityBreakdown = {},
    fromCache = false,
  } = summary;

  return (
    <div className="container" style={{ padding: '36px 20px', minHeight: 'calc(100vh - 68px)' }}>
      {/* Dashboard Top Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.85rem' }}>Hostel Operations Overview</h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: fromCache ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: fromCache ? '#10b981' : '#818cf8',
                border: `1px solid ${fromCache ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {fromCache ? '⚡ Redis Cached (60s TTL)' : '📊 MongoDB $facet Pipeline'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time hostel maintenance indicators, repair cycle times, and operational health
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchSummary}
            disabled={refreshing}
            className="btn btn-secondary btn-sm"
            title="Refresh Analytics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/admin/complaints" className="btn btn-primary btn-sm">
            Manage Complaints <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* Total */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Total Complaints
            </span>
            <FolderOpen size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {totalComplaints}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            All-time reported issues
          </span>
        </div>

        {/* Open */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Open (Pending)
            </span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>
            {statusBreakdown.Open || 0}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Awaiting staff assignment
          </span>
        </div>

        {/* In Progress */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              In Progress
            </span>
            <Activity size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6' }}>
            {statusBreakdown['In Progress'] || 0}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Active repair in hostel
          </span>
        </div>

        {/* Resolved */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Resolved / Closed
            </span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>
            {(statusBreakdown.Resolved || 0) + (statusBreakdown.Closed || 0)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Successfully rectified
          </span>
        </div>

        {/* Urgent Unresolved */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            border: urgentUnresolved > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
            backgroundColor: urgentUnresolved > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: urgentUnresolved > 0 ? '#f87171' : 'var(--text-secondary)' }}>
              Urgent Unresolved
            </span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>
            {urgentUnresolved}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Requires immediate action
          </span>
        </div>

        {/* Avg Resolution Hours */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Avg Resolution Time
            </span>
            <TrendingUp size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {averageResolutionHours.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            From Open to Resolved
          </span>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Priority Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Category Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PieChart size={18} color="var(--brand-primary)" />
            <h2 style={{ fontSize: '1.15rem' }}>Complaints by Category</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryBreakdown.map((cat) => {
              const count = cat.count || 0;
              const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
              return (
                <div key={cat._id || cat.category}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CategoryIcon category={cat._id || cat.category} size={16} />
                      <span style={{ textTransform: 'capitalize', fontSize: '0.88rem', fontWeight: '600' }}>
                        {cat._id || cat.category}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  {/* Progress track */}
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--brand-gradient)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 600ms ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown & Operational Insights */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Zap size={18} color="#eab308" />
            <h2 style={{ fontSize: '1.15rem' }}>Severity & Priority Tiers</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {[
              { key: 'urgent', label: 'Urgent', color: '#ef4444', desc: 'Critical electrical/water emergencies' },
              { key: 'high', label: 'High', color: '#f97316', desc: 'Severe disruption needing same-day fix' },
              { key: 'medium', label: 'Medium', color: '#eab308', desc: 'Standard fixtures and routine repair' },
              { key: 'low', label: 'Low', color: '#06b6d4', desc: 'Minor cosmetic or low impact' },
            ].map((p) => {
              const count = priorityBreakdown[p.key] || 0;
              const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
              return (
                <div key={p.key}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: p.color,
                        }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{p.label}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: p.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 600ms ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            💡 <strong>Senior Engineer Architecture Note:</strong> This summary endpoint leverages a single MongoDB <code style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>$facet</code> pipeline to execute parallel aggregations in one round-trip. Cached in Redis with a 60s TTL and auto-invalidated whenever complaints mutate.
          </div>
        </div>
      </div>
    </div>
  );
};
