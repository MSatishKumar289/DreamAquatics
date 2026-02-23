import { useState } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    isRegisterMode,
    isResetMode,
    name,
    email,
    password,
    confirmPassword,
    error,
    notice,
    authLoading,
    resetCountdown,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleResetSubmit,
    switchToLogin,
    switchToRegister,
    switchToReset,
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
            {isResetMode ? (
              'Reset your password'
            ) : isRegisterMode ? (
              'Create an account'
            ) : (
              <>
                <span className="block">Log in to</span>
                <span className="block">DreamAquatics</span>
              </>
            )}
          </h1>
          <p className="text-sm text-slate-600">
            {isResetMode
              ? 'We will send a reset link to your email.'
              : isRegisterMode
                ? 'Enter your details to create an account.'
                : 'Enter your email and password to continue.'}
          </p>
        </div>
      )}

      {!isPageVariant && (
        <>
          <h2 className="text-xl font-bold text-slate-900">
            {isResetMode ? 'Reset your password' : isRegisterMode ? 'Create an account' : 'Sign in'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isResetMode
              ? 'We will send a reset link to your email.'
              : isRegisterMode
                ? 'Enter your details to create an account.'
                : 'Enter your email and password to continue.'}
          </p>
        </>
      )}

      <div className={isPageVariant ? 'space-y-4' : 'mt-4 space-y-4'}>
        {isRegisterMode && !isResetMode && (
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
        {!isResetMode && (
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
        )}
        {isRegisterMode && !isResetMode && (
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
        )}
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        {notice && <p className="text-sm font-semibold text-emerald-600">{notice}</p>}
        {isResetMode && resetCountdown > 0 && (
          <p className="text-xs font-semibold text-slate-500">
            You can resend in {resetCountdown}s.
          </p>
        )}
        {isPageVariant ? (
          <button
            type="button"
            onClick={
              isResetMode
                ? handleResetSubmit
                : isRegisterMode
                  ? handleRegisterSubmit
                  : handleLoginSubmit
            }
            disabled={authLoading || (isResetMode && resetCountdown > 0)}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            {authLoading
              ? 'Please wait...'
              : isResetMode
                ? 'Send reset link'
                : isRegisterMode
                  ? 'Register'
                  : 'Login'}
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
              onClick={
                isResetMode
                  ? handleResetSubmit
                  : isRegisterMode
                    ? handleRegisterSubmit
                    : handleLoginSubmit
              }
              disabled={authLoading || (isResetMode && resetCountdown > 0)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-70"
            >
              {authLoading
                ? 'Please wait...'
                : isResetMode
                  ? 'Send reset link'
                  : isRegisterMode
                    ? 'Register'
                    : 'Login'}
            </button>
          </div>
        )}
      </div>

      <div className={isPageVariant ? 'mt-6 text-center' : 'mt-4 text-center'}>
        {isResetMode ? (
          <p className="text-sm text-slate-600">
            Remembered your password?{' '}
            <button
              type="button"
              onClick={switchToLogin}
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Login
            </button>
          </p>
        ) : isRegisterMode ? (
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                switchToLogin();
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
                switchToRegister();
              }}
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              Register
            </button>
          </p>
        )}
      </div>

      {!isRegisterMode && !isResetMode && (
        <div className={isPageVariant ? 'mt-3 text-center' : 'mt-3 text-center'}>
          <button
            type="button"
            onClick={switchToReset}
            className="text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            Forgot password?
          </button>
        </div>
      )}
    </>
  );
};

export default AuthForm;


