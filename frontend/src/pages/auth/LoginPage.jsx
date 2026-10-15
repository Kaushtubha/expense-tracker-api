import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const { login, bypassLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('warden@hostel.edu');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const demoRoles = [
    {
      label: 'Warden',
      role: 'admin',
      email: 'warden@hostel.edu',
      pass: 'Password123!',
      badge: 'Chief Admin',
      route: '/admin/dashboard',
    },
    {
      label: 'Student',
      role: 'student',
      email: 'student1@hostel.edu',
      pass: 'Password123!',
      badge: 'Room B-204',
      route: '/student/complaints',
    },
    {
      label: 'Electrician',
      role: 'staff',
      email: 'electrician@hostel.edu',
      pass: 'Password123!',
      badge: 'Technician',
      route: '/staff/queue',
    },
    {
      label: 'Plumber',
      role: 'staff',
      email: 'plumber@hostel.edu',
      pass: 'Password123!',
      badge: 'Technician',
      route: '/staff/queue',
    },
  ];

  // 1-Click Instant Bypass into any role
  const handleInstantBypass = (roleKey) => {
    const user = bypassLogin(roleKey);
    toast.success(`Logged in as ${user.name} (Demo Mode)`);

    if (user.role === 'student') {
      navigate('/student/complaints');
    } else if (user.role === 'staff') {
      navigate('/staff/queue');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleDemoSelect = (role) => {
    setEmail(role.email);
    setPassword(role.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);

      if (user.role === 'student') {
        navigate('/student/complaints');
      } else if (user.role === 'staff') {
        navigate('/staff/queue');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Authentication failed. Please verify your email and password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Left Calm Operations Graphic Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--bg-surface)] border-r border-[var(--border-color)] p-12 flex-col justify-between overflow-hidden calm-radial-glow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--brand-teal)] text-[var(--text-inverse)] flex items-center justify-center shadow-[var(--shadow-subtle)]">
            <Building2 className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight">
              HostelPulse
            </span>
            <span className="ml-2 text-xs font-mono-numbers px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] uppercase">
              Control Room
            </span>
          </div>
        </div>

        <div className="my-auto py-8">
          <svg
            className="w-full max-w-md mx-auto text-[var(--border-color)] stroke-current"
            viewBox="0 0 400 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            strokeWidth="1.25"
          >
            <rect
              x="40"
              y="30"
              width="320"
              height="260"
              rx="12"
              stroke="currentColor"
              fill="var(--bg-subtle)"
              fillOpacity="0.3"
            />
            <line x1="40" y1="95" x2="360" y2="95" stroke="currentColor" strokeDasharray="4 4" />
            <line x1="40" y1="160" x2="360" y2="160" stroke="currentColor" strokeDasharray="4 4" />
            <line x1="40" y1="225" x2="360" y2="225" stroke="currentColor" strokeDasharray="4 4" />

            <line x1="145" y1="30" x2="145" y2="290" stroke="currentColor" strokeDasharray="4 4" />
            <line x1="255" y1="30" x2="255" y2="290" stroke="currentColor" strokeDasharray="4 4" />

            <rect
              x="60"
              y="45"
              width="65"
              height="35"
              rx="6"
              stroke="var(--brand-teal)"
              strokeWidth="1.5"
              fill="var(--brand-teal)"
              fillOpacity="0.08"
            />
            <text x="75" y="67" fill="var(--brand-teal)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              B-204
            </text>
            <circle cx="115" cy="55" r="3" fill="var(--status-resolved)" />

            <rect x="165" y="45" width="65" height="35" rx="6" stroke="currentColor" />
            <text x="180" y="67" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono">
              A-102
            </text>

            <rect
              x="275"
              y="45"
              width="65"
              height="35"
              rx="6"
              stroke="var(--priority-critical)"
              strokeWidth="1.5"
              fill="var(--priority-critical)"
              fillOpacity="0.08"
            />
            <text x="290" y="67" fill="var(--priority-critical)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              C-301
            </text>
            <circle cx="330" cy="55" r="3" fill="var(--priority-critical)" className="pulse-critical" />

            <rect x="60" y="110" width="65" height="35" rx="6" stroke="currentColor" />
            <text x="75" y="132" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono">
              B-205
            </text>

            <rect
              x="165"
              y="110"
              width="65"
              height="35"
              rx="6"
              stroke="var(--status-progress)"
              strokeWidth="1.5"
              fill="var(--status-progress)"
              fillOpacity="0.08"
            />
            <text x="180" y="132" fill="var(--status-progress)" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              A-103
            </text>
            <circle cx="220" cy="120" r="3" fill="var(--status-progress)" />

            <rect x="275" y="110" width="65" height="35" rx="6" stroke="currentColor" />
            <text x="290" y="132" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono">
              C-302
            </text>

            <path d="M70 250H130M175 250H235M280 250H340" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="mt-8 max-w-md">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Calm, 24/7 Facility Operations.
            </h1>
            <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              Real-time issue resolution, role-based delegation, and institutional SLA accountability for student residential hostels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono-numbers">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-teal)]" />
          <span>Encrypted Dual-Token JWT • Institutional Audit Trail</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--brand-teal)] text-[var(--text-inverse)] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-display text-lg font-bold">HostelPulse</span>
          </div>

          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
              Sign in to your account
            </h2>
            <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
              Click any demo role below for <strong>instant 1-click bypass</strong> or sign in.
            </p>
          </div>

          {/* 1-Click Instant Demo Bypass Bar */}
          <div className="mt-6 p-3 rounded-[12px] bg-[var(--bg-subtle)] border border-[var(--brand-teal-border)] shadow-[var(--shadow-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-[var(--brand-teal)] uppercase tracking-wider flex items-center gap-1 font-mono-numbers">
                <Zap className="w-3.5 h-3.5 fill-current" /> Instant Bypass Mode (No Password)
              </p>
              <span className="text-[10px] text-[var(--text-muted)]">1-Click Access</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoRoles.map((role) => (
                <button
                  key={role.label}
                  type="button"
                  onClick={() => handleInstantBypass(role.role === 'staff' ? role.label.toLowerCase() : role.role)}
                  className="px-2.5 py-2 rounded-[8px] bg-[var(--bg-surface)] hover:bg-[var(--brand-teal-subtle)] border border-[var(--border-color)] hover:border-[var(--brand-teal)] text-left transition-all text-xs cursor-pointer group shadow-[var(--shadow-xs)] hover-lift-sm"
                >
                  <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-teal)] leading-none flex items-center justify-between">
                    {role.label}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono-numbers mt-1 leading-none">
                    {role.badge}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-[10px] bg-[var(--priority-critical-bg)] border border-[var(--priority-critical)]/30 text-xs text-[var(--priority-critical)] font-medium space-y-2">
                <p>{error}</p>
                <div className="pt-1 border-t border-[var(--priority-critical)]/20 flex items-center justify-between">
                  <span>Backend connecting?</span>
                  <button
                    type="button"
                    onClick={() => handleInstantBypass('admin')}
                    className="underline font-bold text-[var(--brand-teal)] hover:opacity-80 cursor-pointer"
                  >
                    ⚡ Bypass & Open Warden View
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                University Email
              </label>
              <Input
                type="email"
                placeholder="student@hostel.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Show
                    </>
                  )}
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[var(--brand-teal)] focus:ring-[var(--brand-teal)]"
                />
                Remember this device
              </label>
              <span className="text-[var(--text-muted)]">Forgot password? Contact warden</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In with Credentials <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Registration link */}
          <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
            New hostel resident?{' '}
            <Link
              to="/register"
              className="font-semibold text-[var(--brand-teal)] hover:underline"
            >
              Register your room
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
