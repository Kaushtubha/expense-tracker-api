import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

describe('Frontend Component & Guard Suite', () => {
  // Test 1: StatusBadge rendering
  it('renders StatusBadge with correct text for Open, In Progress, and Resolved', () => {
    const { rerender } = render(<StatusBadge status="Open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();

    rerender(<StatusBadge status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<StatusBadge status="Resolved" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  // Test 2: PriorityBadge rendering
  it('renders PriorityBadge with urgent, high, and medium levels', () => {
    const { rerender } = render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText(/urgent/i)).toBeInTheDocument();

    rerender(<PriorityBadge priority="high" />);
    expect(screen.getByText(/high/i)).toBeInTheDocument();

    rerender(<PriorityBadge priority="low" />);
    expect(screen.getByText(/low/i)).toBeInTheDocument();
  });

  // Test 3: CategoryIcon renders SVGs for each category
  it('renders category icons without crashing', () => {
    const { container: c1 } = render(<CategoryIcon category="water" />);
    expect(c1.querySelector('svg')).toBeInTheDocument();

    const { container: c2 } = render(<CategoryIcon category="electricity" />);
    expect(c2.querySelector('svg')).toBeInTheDocument();

    const { container: c3 } = render(<CategoryIcon category="wifi" />);
    expect(c3.querySelector('svg')).toBeInTheDocument();
  });

  // Test 4: ProtectedRoute renders children when authenticated with correct role
  it('renders children when authenticated and role matches', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u1', name: 'Aarav', role: 'student' },
      isAuthenticated: true,
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Protected Student Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Student Content')).toBeInTheDocument();
  });

  // Test 5: ProtectedRoute blocks unauthorized role access
  it('redirects unauthorized roles away from protected views', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'u2', name: 'Warden', role: 'admin' },
      isAuthenticated: true,
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Secret Student Dashboard</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText('Secret Student Dashboard')).not.toBeInTheDocument();
  });

  // Test 6: ProtectedRoute displays loading spinner when auth status is initializing
  it('shows loading indicator when auth is checking session', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Visible Only After Load</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText(/Verifying authentication/i)).toBeInTheDocument();
    expect(screen.queryByText('Visible Only After Load')).not.toBeInTheDocument();
  });
});
