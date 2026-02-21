import { supabase } from "./supabaseClient";

const FAVORITES_TABLE = "user_favorites";

const getCurrentUserId = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return { userId: null, error };
  if (!user?.id) return { userId: null, error: new Error("User not logged in") };
  return { userId: user.id, error: null };
};

export const fetchMyFavoriteProducts = async () => {
  const { userId, error: userError } = await getCurrentUserId();
  if (userError) return { data: [], error: userError };

  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .select(
      `
      product_id,
      created_at,
      product:products (
        id,
        name,
        price,
        non_discount_price,
        stock_count,
        is_active,
        product_images (
          id,
          url,
          alt,
          position
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error };

  const products = (data || [])
    .map((row) => row?.product)
    .filter((product) => product?.id && product?.is_active !== false);

  return { data: products, error: null };
};

export const addFavoriteProduct = async (productId) => {
  if (!productId) return { error: new Error("Missing product id") };
  const { userId, error: userError } = await getCurrentUserId();
  if (userError) return { error: userError };

  const { error } = await supabase
    .from(FAVORITES_TABLE)
    .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });

  return { error: error || null };
};

export const removeFavoriteProduct = async (productId) => {
  if (!productId) return { error: new Error("Missing product id") };
  const { userId, error: userError } = await getCurrentUserId();
  if (userError) return { error: userError };

  const { error } = await supabase
    .from(FAVORITES_TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  return { error: error || null };
};
