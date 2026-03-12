import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchCurrentProfile } from '../lib/profileApi';
import { checkUserExistsByEmail } from '../lib/authApi';
import { validateEmail } from '../utils/validation';

/**
 * Custom hook for handling authentication forms (login and registration)
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback when login/registration succeeds
 * @param {Function} options.onProfileUpdate - Callback to update profile state (optional)
 * @returns {Object} Auth form state and handlers
 */
export const useAuthForm = ({ onSuccess, onProfileUpdate }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(0);

  useEffect(() => {
    if (resetCountdown <= 0) return;
    const timer = setInterval(() => {
      setResetCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCountdown]);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setNotice('');
    setIsRegisterMode(false);
    setIsResetMode(false);
    setResetCountdown(0);
  }, []);

  const handleLoginSubmit = useCallback(async () => {
    setNotice('');
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

    setAuthLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      // Fetch profile after successful login
      try {
        const { profile: refreshedProfile } = await fetchCurrentProfile();
        if (onProfileUpdate) {
          onProfileUpdate(refreshedProfile);
        }
      } catch (profileError) {
        console.error('Profile fetch error', profileError);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Login failed', err);
      setError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, onSuccess, onProfileUpdate]);

  const handleRegisterSubmit = useCallback(async () => {
    setNotice('');
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
    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match');
      return;
    }

    setAuthLoading(true);
    const displayName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const { exists, error: existsError } = await checkUserExistsByEmail(normalizedEmail);
      if (existsError) {
        setError('Unable to verify this email right now. Please try again.');
        return;
      }
      if (exists) {
        setError('Email already exists. Try logging in or use Forgot password.');
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password.trim(),
        options: {
          data: { full_name: displayName || null },
        },
      });
      if (signUpError) {
        // Check if the error is due to email already existing
        const errorMessage = signUpError.message.toLowerCase();
        if (
          errorMessage.includes('already registered') ||
          errorMessage.includes('user already exists') ||
          errorMessage.includes('email already registered') ||
          errorMessage.includes('already exists')
        ) {
          setError('Email already exists, try logging in');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Create profile after successful signup
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await import('../lib/profileApi').then(({ upsertProfile }) =>
            upsertProfile({ full_name: displayName || null, phone: null })
          );
        }
      } catch (profileError) {
        console.error('Profile creation error', profileError);
      }

      const hasActiveSession = Boolean(signUpData?.session);

      if (hasActiveSession) {
        try {
          const { profile: refreshedProfile } = await fetchCurrentProfile();
          if (onProfileUpdate) {
            onProfileUpdate(refreshedProfile);
          }
        } catch (profileError) {
          console.error('Profile refresh error', profileError);
        }

        setError('');
        setNotice('');
        if (onSuccess) {
          onSuccess();
        }
        return;
      }

      setError('');
      setNotice('Check your email and confirm the link to finish signing up. Once verified, you can log in.');
      setIsRegisterMode(false);
    } catch (err) {
      console.error('Registration failed', err);
      setError('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }, [name, email, password, confirmPassword, onSuccess, onProfileUpdate]);

  const handleResetSubmit = useCallback(async () => {
    setNotice('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setAuthLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const { exists, error: existsError } = await checkUserExistsByEmail(normalizedEmail);
      if (existsError) {
        setError('Unable to verify this email right now. Please try again.');
        return;
      }
      if (!exists) {
        setError('Email does not exist. Please register first or check your email address.');
        return;
      }

      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo }
      );
      if (resetError) {
        const resetErrorMessage = resetError.message?.toLowerCase?.() || '';
        if (resetErrorMessage.includes('rate limit') || resetErrorMessage.includes('too many requests')) {
          setError('A reset link was requested recently. Please wait a minute before trying again.');
        } else {
          setError(resetError.message);
        }
        return;
      }
      setError('');
      setNotice('Please check your email for a password reset link. If you do not see it, check your spam folder.');
      setResetCountdown(60);
    } catch (err) {
      console.error('Reset request failed', err);
      setError('Reset request failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }, [email]);

  const switchToLogin = useCallback(() => {
    setIsRegisterMode(false);
    setIsResetMode(false);
    setError('');
    setNotice('');
  }, []);

  const switchToRegister = useCallback(() => {
    setIsRegisterMode(true);
    setIsResetMode(false);
    setError('');
    setNotice('');
  }, []);

  const switchToReset = useCallback(() => {
    setIsRegisterMode(false);
    setIsResetMode(true);
    setError('');
    setNotice('');
  }, []);

  return {
    // State
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
    // Setters
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setError,
    setIsRegisterMode,
    setIsResetMode,
    // Handlers
    handleLoginSubmit,
    handleRegisterSubmit,
    handleResetSubmit,
    switchToLogin,
    switchToRegister,
    switchToReset,
    resetForm,
  };
};
