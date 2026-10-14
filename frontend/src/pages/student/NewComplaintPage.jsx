import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import {
  ArrowLeft,
  Send,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

const categories = [
  { id: 'water', label: 'Water & Plumbing', desc: 'Taps, leakage, geysers, flush, drains' },
  { id: 'electricity', label: 'Electricity & Power', desc: 'Sockets, fans, tube lights, tripping' },
  { id: 'wifi', label: 'Wi-Fi & Internet', desc: 'SSID down, captive portal, slow speed' },
  { id: 'furniture', label: 'Furniture & Fixtures', desc: 'Tables, chairs, doors, latches, beds' },
  { id: 'cleanliness', label: 'Housekeeping & Waste', desc: 'Washrooms, dustbins, corridors' },
  { id: 'other', label: 'Other Facilities', desc: 'Windows, pigeon nets, miscellaneous' },
];

const priorities = [
  { id: 'low', label: 'Low', color: '#06b6d4', desc: 'Minor issue, does not hinder daily routine' },
  { id: 'medium', label: 'Medium', color: '#eab308', desc: 'Needs attention within 24-48 hours' },
  { id: 'high', label: 'High', color: '#f97316', desc: 'Causes severe inconvenience (same day)' },
  { id: 'urgent', label: 'Urgent', color: '#ef4444', desc: 'Hazard/emergency (water overflow, spark)' },
];

export const NewComplaintPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('water');
  const [priority, setPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !roomNumber.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/complaints', {
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        roomNumber: roomNumber.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      navigate('/student/complaints', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to lodge complaint. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '800px' }}>
      <Link
        to="/student/complaints"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-secondary)',
          fontSize: '0.86rem',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} /> Back to My Complaints
      </Link>

      <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Raise a Maintenance Complaint</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Report an issue in your hostel room or common wing. The warden and staff will be notified.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              marginBottom: '24px',
              color: '#f87171',
              fontSize: '0.86rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category Selector Grid */}
          <div>
            <label className="input-label" style={{ marginBottom: '10px' }}>
              Select Issue Category *
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '10px',
              }}
            >
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CategoryIcon category={cat.id} size={18} />
                        <span style={{ fontSize: '0.88rem', fontWeight: '600', color: isSelected ? '#a5b4fc' : 'var(--text-primary)' }}>
                          {cat.label}
                        </span>
                      </div>
                      {isSelected && <Check size={16} color="#6366f1" />}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {cat.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Pills */}
          <div>
            <label className="input-label" style={{ marginBottom: '10px' }}>
              Priority Level *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              {priorities.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? `1px solid ${p.color}` : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ display: 'block', fontWeight: '700', fontSize: '0.84rem', color: p.color }}>
                      {p.label}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title & Room Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '14px' }}>
            <div>
              <label className="input-label" htmlFor="title">Issue Summary (Title) *</label>
              <input
                id="title"
                type="text"
                required
                className="input-field"
                placeholder="e.g. Geyser water not heating / Fan regulator broken"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label" htmlFor="room">Room Number *</label>
              <input
                id="room"
                type="text"
                required
                className="input-field"
                placeholder="A-101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="input-label" htmlFor="desc">Detailed Description *</label>
            <textarea
              id="desc"
              rows={4}
              required
              className="input-field"
              placeholder="Describe the exact issue, symptoms, and when it started occurring..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ lineHeight: 1.5 }}
            />
          </div>

          {/* Optional Image URL */}
          <div>
            <label className="input-label" htmlFor="imgUrl">Photo Evidence URL (Optional)</label>
            <div style={{ position: 'relative' }}>
              <ImageIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="imgUrl"
                type="url"
                className="input-field"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Link to="/student/complaints" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '12px 24px', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Lodging Complaint...' : 'Submit Complaint'}
              {!submitting && <Send size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
