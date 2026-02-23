import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setHasSession(Boolean(data?.session));
      setSessionChecked(true);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(Boolean(session));
        setSessionChecked(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async () => {
    setError('');
    setNotice('');

    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match');
      return;
    }

    setAuthLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      await supabase.auth.signOut();
      setNotice('Password updated. Please log in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password reset failed', err);
      setError('Password reset failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-blue-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-sky-400/35 via-cyan-300/30 to-blue-500/35 blur-3xl" aria-hidden />
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
              Password reset
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Create a new password</h1>
            <p className="text-sm text-slate-600">
              Enter a new password for your DreamAquatics account.
            </p>
          </div>

          {sessionChecked && !hasSession ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-center text-sm text-amber-900">
              <p className="font-semibold">This reset link is invalid or expired.</p>
              <p className="mt-1 text-xs text-amber-800">
                Please request a new reset email from the login screen.
              </p>
              <div className="mt-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  Go to login
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                New password
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a new password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Confirm password
                <div className="relative mt-2">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
              {notice && <p className="text-sm font-semibold text-emerald-600">{notice}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={authLoading}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70"
              >
                {authLoading ? 'Please wait...' : 'Update password'}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
