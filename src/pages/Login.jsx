import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [error, setError] = useState('');
  const [googleReady, setGoogleReady] = useState(false);

  const decodeJwt = (token) => {
    const payload = token?.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(decoded);
  };

  const handleCredential = useCallback((response) => {
    try {
      const payload = decodeJwt(response.credential);
      const name = payload?.name || payload?.given_name || 'Friend';
      const email = payload?.email || '';
      onLogin?.(name, email);
      navigate('/');
    } catch (e) {
      setError('Could not read Google response. Please try again.');
    }
  }, [navigate, onLogin]);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setError('Google sign-in could not load. Check your connection.');
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!googleReady || !googleButtonRef.current) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Add VITE_GOOGLE_CLIENT_ID to your .env file to enable Google login.');
      return;
    }
    // Clear existing rendered button to avoid duplicates on re-render.
    googleButtonRef.current.innerHTML = '';
    const { accounts } = window.google;
    accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });
    accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: 320,
      text: 'continue_with',
    });
  }, [googleReady, handleCredential]);

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
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Welcome back</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Log in to Dream Aquatics</h1>
            <p className="text-sm text-slate-600">Track orders, saved carts, and custom builds.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <div ref={googleButtonRef} className="flex justify-center" />
            </div>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <p className="text-center text-xs text-amber-700">
                Set VITE_GOOGLE_CLIENT_ID in .env to enable Google sign-in.
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to Dream Aquatics?{' '}
            <Link to="/" className="font-semibold text-sky-600 hover:text-sky-700">
              Explore the collection
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
