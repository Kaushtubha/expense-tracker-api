import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, Phone, Home, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    roomNumber: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
        roomNumber: formData.role === 'student' ? formData.roomNumber : undefined,
      };

      const user = await register(payload);
      if (user.role === 'student') {
        navigate('/student/complaints', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Registration failed. Please check inputs.';
      setError(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--brand-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '12px',
            }}
          >
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Register to lodge hostel complaints or manage facility repairs
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
              marginBottom: '20px',
              color: '#f87171',
              fontSize: '0.86rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="e.g. Aarav Patel"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="email">Institute Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="student@hostel.edu"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="input-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Min 8 chars"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="staff">Staff (Maintenance)</option>
                <option value="admin">Warden (Admin)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: formData.role === 'student' ? '1fr 1fr' : '1fr', gap: '14px' }}>
            {formData.role === 'student' && (
              <div>
                <label className="input-label" htmlFor="roomNumber">Room Number *</label>
                <div style={{ position: 'relative' }}>
                  <Home size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="roomNumber"
                    name="roomNumber"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. A-101"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="input-label" htmlFor="phone">Phone (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input-field"
                  placeholder="e.g. 9855001122"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ marginTop: '10px', height: '46px', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Registering Account...' : 'Complete Registration'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
