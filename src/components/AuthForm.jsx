import { useAuthForm } from '../hooks/useAuthForm';

/**
 * Reusable authentication form component
 * Can be used in both modal and page contexts
 */
const AuthForm = ({
  onSuccess,
  onProfileUpdate,
  variant = 'modal', // 'modal' or 'page'
  showCloseButton = false,
  onClose,
}) => {
  const {
    isRegisterMode,
    name,
    email,
    password,
    error,
    notice,
    authLoading,
    setName,
    setEmail,
    setPassword,
    setError,
    setIsRegisterMode,
    handleLoginSubmit,
    handleRegisterSubmit,
    toggleMode,
  } = useAuthForm({ onSuccess, onProfileUpdate });

  const isPageVariant = variant === 'page';

  return (
    <>
      {isPageVariant && (
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
            {isRegisterMode ? 'Join us' : 'Welcome back'}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {isRegisterMode ? (
              'Create an account'
            ) : (
              <>
                <span className="block">Log in to</span>
                <span className="block">DreamAquatics</span>
              </>
            )}
          </h1>
          <p className="text-sm text-slate-600">
            {isRegisterMode
              ? 'Enter your details to create an account.'
              : 'Enter your email and password to continue.'}
          </p>
        </div>
      )}

      {!isPageVariant && (
        <>
          <h2 className="text-xl font-bold text-slate-900">
            {isRegisterMode ? 'Create an account' : 'Sign in'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isRegisterMode
              ? 'Enter your details to create an account.'
              : 'Enter your email and password to continue.'}
          </p>
        </>
      )}

      <div className={isPageVariant ? 'space-y-4' : 'mt-4 space-y-4'}>
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
        {notice && <p className="text-sm font-semibold text-emerald-600">{notice}</p>}
        {isPageVariant ? (
          <button
            type="button"
            onClick={isRegisterMode ? handleRegisterSubmit : handleLoginSubmit}
            disabled={authLoading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            {authLoading ? 'Please wait...' : isRegisterMode ? 'Register' : 'Login'}
          </button>
        ) : (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={isRegisterMode ? handleRegisterSubmit : handleLoginSubmit}
              disabled={authLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-70"
            >
              {authLoading ? 'Please wait...' : isRegisterMode ? 'Register' : 'Login'}
            </button>
          </div>
        )}
      </div>

      <div className={isPageVariant ? 'mt-6 text-center' : 'mt-4 text-center'}>
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
      </div>
    </>
  );
};

export default AuthForm;


