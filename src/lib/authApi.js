import { supabase } from './supabaseClient';

export const getSessionUser = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) return { user: null, error };
  return { user: session?.user || null, error: null };
};

export const onAuthChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });
};

export async function checkUserExistsByEmail(email) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail) {
    return { exists: false, error: new Error('Missing email') };
  }

  const { data, error } = await supabase.functions.invoke('check-user-exists', {
    body: { email: normalizedEmail },
  });

  return {
    exists: Boolean(data?.exists),
    error: error || null,
  };
}
