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

export async function updateProduct(productId, payload) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", productId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Update image from Edit modal
export async function upsertProductPrimaryImage({ productId, file }) {
  try {
    // 1) upload file
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) throw new Error("Public URL generation failed");

    // 2) check existing image row
    const { data: existing, error: existingErr } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingErr) throw existingErr;

    // 3) update or insert
    if (existing?.id) {
      const { error: updateErr } = await supabase
        .from("product_images")
        .update({ url: publicUrl, alt: file.name, position: 0 })
        .eq("id", existing.id);

      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("product_images")
        .insert({ product_id: productId, url: publicUrl, alt: file.name, position: 0 });

      if (insertErr) throw insertErr;
    }

    return { error: null, publicUrl };
  } catch (error) {
    return { error };
  }
}

// DELETE Product from DB
export async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    return { error };
  } catch (error) {
    return { error };
  }
}

// Fetch Product Image for cleanup
export async function fetchProductImages(productId) {
  try {
    const { data, error } = await supabase
      .from("product_images")
      .select("id, url, position")
      .eq("product_id", productId)
      .order("position", { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// /Deleting the image row
export async function deleteProductImageRow(imageId) {
  try {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    return { error };
  } catch (error) {
    return { error };
  }
}

function extractStoragePathFromPublicUrl(publicUrl) {
  // expected:
  // https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
  const marker = "/storage/v1/object/public/product-images/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.substring(idx + marker.length);
}

export async function deleteStorageFileByPublicUrl(publicUrl) {
  try {
    const path = extractStoragePathFromPublicUrl(publicUrl);
    if (!path) return { error: new Error("Invalid public url") };

    const { error } = await supabase.storage
      .from("product-images")
      .remove([path]);

    return { error };
  } catch (error) {
    return { error };
  }
}

/** ===============================================================
  * CRUD for Sub Categories

  * Create subcategory
 */
export async function createSubcategory(payload) {
  try {
    const { data, error } = await supabase
      .from("subcategories")
      .insert(payload)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update subcategory
 */
export async function updateSubcategory(subcategoryId, payload) {
  try {
    const { data, error } = await supabase
      .from("subcategories")
      .update(payload)
      .eq("id", subcategoryId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete subcategory
 */
export async function deleteSubcategory(subcategoryId) {
  try {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", subcategoryId);

    return { error };
  } catch (error) {
    return { error };
  }
}





