import { supabase } from './supabaseClient';

export async function fetchCurrentProfile() {
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult?.user;

  if (!user) {
    return { profile: null, error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { profile: data ?? null, error };
}

export async function upsertProfile(updates = {}) {
  const { data: userResult } = await supabase.auth.getUser();
  const user = userResult?.user;

  if (!user) {
    return { profile: null, error: new Error('No user') };
  }

  const payload = {
    id: user.id,
    full_name: updates.full_name ?? null,
    phone: updates.phone ?? null,
    avatar_url: updates.avatar_url ?? null,
    role: updates.role ?? 'user',
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { returning: 'representation' })
    .select()
    .maybeSingle();

  return { profile: data ?? null, error };
}

