import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'signin';
  const nextUrl = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || !password) {
      setError('Please enter a valid email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Base44 SDK handles login redirect
      // For now, we'll let the SDK handle auth
      // The actual login flow is managed by base44.auth.redirectToLogin()
      // This page is a placeholder for polish
      await new Promise(resolve => setTimeout(resolve, 500)); // Placeholder
      // In production, Base44 auth page handles the actual login
      window.location.href = `${window.location.origin}/auth?mode=signin&next=${encodeURIComponent(nextUrl)}`;
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || !password || !displayName) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Base44 SDK handles signup redirect
      await new Promise(resolve => setTimeout(resolve, 500)); // Placeholder
      window.location.href = `${window.location.origin}/auth?mode=signup&next=${encodeURIComponent(nextUrl)}`;
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0A0F' }}>
      <style>{`
        .auth-card {
          background: rgba(10,10,15,0.98);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .auth-input {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(255,255,255,0.08) !important;
          color: white !important;
        }
        .auth-input::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex gap-1 mb-6">
            {['#FF0000', '#0000FF', '#FFFF00'].map((color, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ background: color }}
              />
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {mode === 'signin' ? 'Sign In' : 'Join Skrtlife'}
          </h1>
          <p className="text-white/50 text-sm">
            {mode === 'signin'
              ? 'Access your DripSync studio and creator tools.'
              : 'Create your account to unlock Creator Mode and exclusive drops.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="auth-card rounded-2xl p-8 mb-6">
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {/* Sign Up: Display Name */}
            {mode === 'signup' && (
              <div>
                <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Display Name
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  className="auth-input h-11"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="auth-input h-11"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="auth-input h-11"
              />
            </div>

            {/* Error */}
            {error && <p className="text-red-400 text-xs">{error}</p>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-bold text-sm mt-6"
              style={{
                background: '#00D4FF',
                color: '#000',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center text-white/60 text-xs">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate(`/Auth?mode=signup&next=${encodeURIComponent(nextUrl)}`)}
                  className="text-white hover:text-white/80 font-bold"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => navigate(`/Auth?mode=signin&next=${encodeURIComponent(nextUrl)}`)}
                  className="text-white hover:text-white/80 font-bold"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center space-y-3 text-white/40 text-xs">
          <p>✓ Secure authentication powered by Base44</p>
          <p>✓ Your data is encrypted and never shared</p>
        </div>
      </motion.div>
    </div>
  );
}