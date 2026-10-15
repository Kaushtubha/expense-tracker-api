import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'var(--priority-critical)',
    'var(--status-open)',
    'var(--status-progress)',
    'var(--status-resolved)',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !roomNumber) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        name,
        email,
        password,
        roomNumber: roomNumber.toUpperCase(),
      });
      toast.success('Registration successful! Welcome to HostelPulse.');
      navigate('/student/complaints');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please try a different email.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Left Graphic Panel */}
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
              Resident Access
            </span>
          </div>
        </div>

        <div className="my-auto py-8 max-w-md">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Register your room for transparent issue tracking.
          </h1>
          <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">
            Direct communication with hostel maintenance technicians, verified resolution timelines, and audit trails for every service request.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Direct delegation to campus electricians, plumbers & carpenters',
              'SLA priority queues with transparent turnaround tracking',
              'Student reopen power within 48 hours if repairs are incomplete',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <div className="w-4 h-4 rounded-full bg-[var(--status-resolved-bg)] text-[var(--status-resolved)] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-[var(--text-muted)] font-mono-numbers">
          HostelPulse v1.0 • Campus Operations Infrastructure
        </div>
      </div>

      {/* Right Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--brand-teal)] text-[var(--text-inverse)] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-display text-lg font-bold">HostelPulse</span>
          </div>

          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
              Create student account
            </h2>
            <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
              Provide your details to associate maintenance requests with your room.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3 rounded-[10px] bg-[var(--priority-critical-bg)] border border-[var(--priority-critical)]/30 text-xs text-[var(--priority-critical)] font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Rahul Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                University Email
              </label>
              <Input
                type="email"
                placeholder="rahul.v@hostel.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Room Number <span className="text-[var(--text-muted)] font-normal">(e.g. B-204, A-102)</span>
              </label>
              <Input
                type="text"
                placeholder="B-204"
                isMono={true}
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Password strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                    <span>Password strength:</span>
                    <span style={{ color: strengthColors[Math.max(0, strength - 1)] }}>
                      {strengthLabels[Math.max(0, strength - 1)]}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="rounded-full transition-colors duration-200"
                        style={{
                          backgroundColor:
                            step <= strength
                              ? strengthColors[strength - 1]
                              : 'var(--border-subtle)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              Complete Registration <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--brand-teal)] hover:underline"
            >
              Sign in to your room
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
