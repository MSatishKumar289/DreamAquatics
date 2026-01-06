import { supabase } from './supabaseClient';

/**
 * Fetches all categories from Supabase
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetches subcategories for a given category
 * @param {string|number} categoryId - The category ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchSubcategories(categoryId) {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetches products for a given subcategory
 * @param {string|number} subcategoryId - The subcategory ID
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchProducts(subcategoryId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          alt,
          position
        )
      `)
      .eq('subcategory_id', subcategoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchAllProductsWithCategories() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      created_at,
      subcategory:subcategories (
        id,
        name,
        slug,
        category:categories (
          id,
          slug
        )
      ),
      product_images ( id, url, alt, position )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return { data, error };
}
