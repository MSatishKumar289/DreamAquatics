import { supabase } from './supabaseClient';

async function fetchCurrentProfile() {
  const { data: user, error: userError } = await supabase.auth.getUser();
  
  if (!user || userError) {
    return { profile: null, error: null };
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { profile: data, error };
}

async function upsertProfile(updates) {
  const { data: user, error: userError } = await supabase.auth.getUser();
  
  if (!user || userError) {
    return { profile: null, error: userError || new Error('No user found') };
  }
  
  const payload = {
    id: user.id,
    full_name: updates.full_name ?? null,
    phone: updates.phone ?? null,
    avatar_url: updates.avatar_url ?? null,
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload)
    .select()
    .single();
  
  return { profile: data, error };
}

export { fetchCurrentProfile, upsertProfile };

