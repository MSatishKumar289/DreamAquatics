import { supabase } from "./supabaseClient";

const ESSENTIALS_TABLE = "essential_products";

export const fetchEssentialEntries = async () =>
  supabase
    .from(ESSENTIALS_TABLE)
    .select("id, product_id, added_at")
    .order("added_at", { ascending: false });

export const updateEssentialForProduct = async ({ productId, enabled }) => {
  if (!productId) {
    return { data: null, error: new Error("Missing product id") };
  }

  if (enabled) {
    const { error } = await supabase
      .from(ESSENTIALS_TABLE)
      .upsert({ product_id: productId }, { onConflict: "product_id" });
    if (error) return { data: null, error };
  } else {
    const { error } = await supabase
      .from(ESSENTIALS_TABLE)
      .delete()
      .eq("product_id", productId);
    if (error) return { data: null, error };
  }

  return fetchEssentialEntries();
};
