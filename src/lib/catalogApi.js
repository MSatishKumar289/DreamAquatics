import { supabase } from "./supabaseClient";

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetch subcategories for a given category (UUID)
 */
export async function fetchSubcategories(categoryId) {
  try {
    const { data, error } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("created_at", { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetch products for a given subcategory (UUID)
 */
export async function fetchProducts(subcategoryId) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id,
          url,
          alt,
          position
        )
      `)
      .eq("subcategory_id", subcategoryId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetch ALL products with category + subcategory
 * (Used for Home / View All / admin overviews)
 */
export async function fetchAllProductsWithCategories() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        description,
        is_active,
        created_at,
        subcategory:subcategories (
          id,
          name,
          slug,
          category:categories (
            id,
            name,
            slug
          )
        ),
        product_images (
          id,
          url,
          alt,
          position
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Create product
 */
export async function createProduct(payload) {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Upload product image and create product_images row
 */
export async function uploadProductImage({ productId, file }) {
  try {
    const BUCKET = "product-images"; // ✅ must match exactly in Supabase

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) throw new Error("Public URL generation failed");

    const { error: dbError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        url: publicUrl,
        alt: file.name,
        position: 0
      });

    if (dbError) throw dbError;

    return { error: null };
  } catch (error) {
    console.error("uploadProductImage error:", error);
    return { error };
  }
}



