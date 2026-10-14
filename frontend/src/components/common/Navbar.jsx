import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, PlusCircle, LayoutDashboard, ListFilter, LogOut, Wrench } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to={user?.role === 'student' ? '/student/complaints' : '/admin/dashboard'}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            <ShieldCheck size={20} color="#ffffff" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                background: 'var(--brand-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HostelPulse
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        {user && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.role === 'student' ? (
              <>
                <Link
                  to="/student/complaints"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isActive('/student/complaints')
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'transparent',
                    color: isActive('/student/complaints')
                      ? '#818cf8'
                      : 'var(--text-secondary)',
                    border: isActive('/student/complaints')
                      ? '1px solid rgba(99, 102, 241, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <ListFilter size={15} /> My Complaints
                </Link>
                <Link
                  to="/student/new-complaint"
                  className="btn btn-sm btn-primary"
                  style={{ padding: '7px 14px' }}
                >
                  <PlusCircle size={15} /> Raise Issue
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/admin/dashboard"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isActive('/admin/dashboard')
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'transparent',
                    color: isActive('/admin/dashboard')
                      ? '#818cf8'
                      : 'var(--text-secondary)',
                    border: isActive('/admin/dashboard')
                      ? '1px solid rgba(99, 102, 241, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <LayoutDashboard size={15} /> Overview
                </Link>
                <Link
                  to="/admin/complaints"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: isActive('/admin/complaints')
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'transparent',
                    color: isActive('/admin/complaints')
                      ? '#818cf8'
                      : 'var(--text-secondary)',
                    border: isActive('/admin/complaints')
                      ? '1px solid rgba(99, 102, 241, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <Wrench size={15} /> Manage Complaints
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User Profile & Logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <span
                style={{
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {user.name}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}
              >
                {user.role === 'student' ? `Room ${user.roomNumber || 'N/A'}` : user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="btn btn-sm btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-sm btn-primary">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
