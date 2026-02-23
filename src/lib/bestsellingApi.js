import { supabase } from "./supabaseClient";
import { fetchAllProductsWithCategories } from "./catalogApi";

const CATEGORY_SLUG_MAP = {
  fishes: "fishes",
  "live-plants": "plants",
  accessories: "accessories",
  tank: "tanks",
};

const fetchCategoryEntries = async (categoryKey) =>
  supabase
    .from("bestselling_products")
    .select("id, product_id, category_key, added_at")
    .eq("category_key", categoryKey)
    .order("added_at", { ascending: true });

const insertEntry = async (productId, categoryKey) =>
  supabase.from("bestselling_products").insert({
    product_id: productId,
    category_key: categoryKey,
  });

const deleteEntryById = async (entryId) =>
  supabase.from("bestselling_products").delete().eq("id", entryId);

const deleteEntryByProduct = async (productId) =>
  supabase.from("bestselling_products").delete().eq("product_id", productId);

const autoFillCategory = async ({
  categoryKey,
  existingProductIds,
  excludeProductIds = new Set(),
}) => {
  const { data: products, error } = await fetchAllProductsWithCategories();
  if (error) return { data: null, error };

  const categorySlug = CATEGORY_SLUG_MAP[categoryKey];
  if (!categorySlug) return { data: null, error: null };

  const candidates = (products || [])
    .filter((product) => product?.subcategory?.category?.slug === categorySlug)
    .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));

  let inserted = 0;
  for (const product of candidates) {
    if (existingProductIds.has(product.id)) continue;
    if (excludeProductIds.has(product.id)) continue;
    const { error: insertError } = await insertEntry(product.id, categoryKey);
    if (insertError) return { data: null, error: insertError };
    existingProductIds.add(product.id);
    inserted += 1;
    if (existingProductIds.size >= 2 || inserted >= 2) break;
  }

  return { data: { inserted }, error: null };
};

export const fetchBestsellingEntries = async () =>
  supabase
    .from("bestselling_products")
    .select("id, product_id, category_key, added_at")
    .order("added_at", { ascending: true });

export const fetchBestsellingEntriesWithProducts = async () =>
  supabase
    .from("bestselling_products")
    .select(
      `
      id,
      product_id,
      category_key,
      added_at,
      product:products (
        id,
        name,
        subcategory:subcategories (
          id,
          name,
          category:categories (
            id,
            name,
            slug
          )
        )
      )
    `
    )
    .order("added_at", { ascending: true });

export const updateBestsellerForProduct = async ({
  productId,
  categoryKey,
  enabled,
}) => {
  if (!productId || !categoryKey) {
    return { data: null, error: new Error("Missing product/category") };
  }

  const { data: current, error: currentError } = await fetchCategoryEntries(
    categoryKey
  );
  if (currentError) return { data: null, error: currentError };

  const existingEntry = (current || []).find(
    (entry) => entry.product_id === productId
  );

  let working = [...(current || [])];

  if (enabled) {
    if (!existingEntry) {
      if (working.length >= 2) {
        const oldest = working[0];
        const { error: delErr } = await deleteEntryById(oldest.id);
        if (delErr) return { data: null, error: delErr };
        working = working.slice(1);
      }

      const { error: insertError } = await insertEntry(productId, categoryKey);
      if (insertError) return { data: null, error: insertError };
      working = [...working, { product_id: productId }];
    }
  } else if (existingEntry) {
    const { error: delErr } = await deleteEntryByProduct(productId);
    if (delErr) return { data: null, error: delErr };
    working = working.filter((entry) => entry.product_id !== productId);
  }

  if (working.length < 2) {
    const existingIds = new Set(working.map((entry) => entry.product_id));
    const { error: fillError } = await autoFillCategory({
      categoryKey,
      existingProductIds: existingIds,
      excludeProductIds: enabled ? new Set() : new Set([productId]),
    });
    if (fillError) return { data: null, error: fillError };
  }

  return fetchBestsellingEntriesWithProducts();
};
