import { supabase } from "./supabaseClient";

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
