import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Building2,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Wrench,
  User,
} from 'lucide-react';
import clsx from 'clsx';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const role = user?.role || 'student';

  const navLinks = [
    ...(role === 'student'
      ? [
          {
            to: '/student/complaints',
            label: 'My Complaints',
            icon: ClipboardList,
          },
        ]
      : []),
    ...(role === 'admin'
      ? [
          {
            to: '/admin/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
          },
          {
            to: '/admin/complaints',
            label: 'Complaints Master',
            icon: ClipboardList,
          },
        ]
      : []),
    ...(role === 'staff'
      ? [
          {
            to: '/staff/queue',
            label: 'Work Queue',
            icon: Wrench,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[var(--text-primary)] hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-[8px] bg-[var(--brand-teal)] text-[var(--text-inverse)] flex items-center justify-center shadow-[var(--shadow-subtle)]">
            <Building2 className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <span className="font-display text-base font-semibold tracking-tight">
              HostelPulse
            </span>
            <span className="ml-2 text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] uppercase">
              Ops
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-[8px] transition-all hover-lift-sm',
                  isActive
                    ? 'bg-[var(--brand-teal-subtle)] text-[var(--brand-teal)] border border-[var(--brand-teal-border)] shadow-[var(--shadow-xs)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent'
                )}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right tools: Theme toggle, User badge, Logout */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)] transition-all cursor-pointer hover-lift-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* User pill */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] shadow-[var(--shadow-xs)] hover:border-[var(--brand-teal-border)] hover-lift-sm transition-all cursor-default">
            <div className="w-6 h-6 rounded-full bg-[var(--brand-teal)]/15 text-[var(--brand-teal)] flex items-center justify-center text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-[var(--text-primary)] leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono-numbers mt-0.5 leading-none capitalize">
                {role === 'student' && user?.roomNumber
                  ? `Room ${user.roomNumber}`
                  : role === 'staff'
                  ? user?.staffTrade || 'Technician'
                  : 'Warden'}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            title="Log out of session"
            className="p-2 rounded-[8px] text-[var(--text-muted)] hover:text-[var(--priority-critical)] hover:bg-[var(--priority-critical-bg)] border border-transparent transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
