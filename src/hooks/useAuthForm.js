import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchCurrentProfile } from '../lib/profileApi';
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setNotice('');
    setIsRegisterMode(false);
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

    setAuthLoading(true);
    const displayName = name.trim();
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
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

      setError('');
      setNotice('Check your email and confirm the link to finish signing up. Once verified, you can log in.');
      setIsRegisterMode(false);
    } catch (err) {
      console.error('Registration failed', err);
      setError('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }, [name, email, password]);

  const toggleMode = useCallback(() => {
    setIsRegisterMode((prev) => !prev);
    setError('');
  }, []);

  return {
    // State
    isRegisterMode,
    name,
    email,
    password,
    error,
    notice,
    authLoading,
    // Setters
    setName,
    setEmail,
    setPassword,
    setError,
    setIsRegisterMode,
    // Handlers
    handleLoginSubmit,
    handleRegisterSubmit,
    toggleMode,
    resetForm,
  };
};
