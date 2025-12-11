import { Link, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginSubmit = useCallback(() => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    onLogin?.(email.trim());
    navigate('/');
  }, [email, password, onLogin, navigate]);

  const handleRegisterSubmit = useCallback(() => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    onLogin?.(email.trim(), name.trim());
    navigate('/');
  }, [name, email, password, onLogin, navigate]);

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
              {isRegisterMode ? 'Join us' : 'Welcome back'}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {isRegisterMode ? 'Create an account' : 'Log in to Dream Aquatics'}
            </h1>
            <p className="text-sm text-slate-600">
              {isRegisterMode ? 'Enter your details to create an account.' : 'Enter your email and password to continue.'}
            </p>
          </div>

          <div className="space-y-4">
            {isRegisterMode && (
              <label className="block text-sm font-semibold text-slate-700">
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>
            )}
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
            {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
            <button
              type="button"
              onClick={isRegisterMode ? handleRegisterSubmit : handleLoginSubmit}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white"
            >
              {isRegisterMode ? 'Register' : 'Login'}
            </button>
          </div>

          <div className="mt-6 text-center">
            {isRegisterMode ? (
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError('');
                  }}
                  className="font-semibold text-sky-600 hover:text-sky-700"
                >
                  Login
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError('');
                  }}
                  className="font-semibold text-sky-600 hover:text-sky-700"
                >
                  Register
                </button>
              </p>
            )}
            <p className="mt-4 text-sm text-slate-600">
              <Link to="/" className="font-semibold text-sky-600 hover:text-sky-700">
                Explore the collection
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
