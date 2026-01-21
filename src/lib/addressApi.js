// src/lib/addressApi.js
import { supabase } from "./supabaseClient";

const TABLE = "customer_addresses";

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { userId: null, error };
  const userId = data?.user?.id || null;
  return { userId, error: null };
}

export async function fetchCustomerAddresses() {
    try {
      const { data: userResult, error: userErr } = await supabase.auth.getUser();
      if (userErr) return { data: [], error: userErr };
  
      const userId = userResult?.user?.id;
      if (!userId) return { data: [], error: null };
  
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });
  
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

export async function createCustomerAddress(payload) {
    try {
        const { data: userResult } = await supabase.auth.getUser();
        const userId = userResult?.user?.id;
        if (!userId) return { data: null, error: new Error("No user") };

        const { data, error } = await supabase
        .from("customer_addresses")
        .insert([{ ...payload, user_id: userId }])
        .select("*");

        return { data: data?.[0] ?? null, error };
    } catch (error) {
        return { data: null, error };
    }
}
  

export async function updateCustomerAddress(id, payload) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteCustomerAddress(id) {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    return { ok: !error, error };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function setDefaultAddress(addressId) {
  try {
    const { userId, error: userErr } = await getCurrentUserId();
    if (userErr) return { ok: false, error: userErr };
    if (!userId) return { ok: false, error: new Error("No user") };

    // Clear defaults
    const { error: clearError } = await supabase
      .from(TABLE)
      .update({ is_default: false })
      .eq("user_id", userId);

    if (clearError) return { ok: false, error: clearError };

    // Set selected default
    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("user_id", userId)
      .select("*")
      .single();

    return { ok: !error, data, error };
  } catch (error) {
    return { ok: false, error };
  }
}
