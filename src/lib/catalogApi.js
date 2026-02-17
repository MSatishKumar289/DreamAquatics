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
        stock_count,
        is_active,
        created_at,
        subcategory:subcategories (
          id,
          name,
          slug,
          description,
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
 * Fetch single product by id with category + subcategory
 * (Used for direct-open product details URLs)
 */
export async function fetchProductById(productId) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        description,
        stock_count,
        is_active,
        created_at,
        subcategory:subcategories (
          id,
          name,
          slug,
          description,
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
      .eq("id", productId)
      .eq("is_active", true)
      .single();

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

    const { error: dbError } = await supabase.from("product_images").insert({
      product_id: productId,
      url: publicUrl,
      path: filePath, // ✅ ADD THIS
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
    const BUCKET = "product-images";

    // 1) check existing image row (need id + path)
    const { data: existing, error: existingErr } = await supabase
      .from("product_images")
      .select("id, path")
      .eq("product_id", productId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingErr) throw existingErr;

    // 2) delete old storage file (if exists)
    if (existing?.path) {
      const { error: storageDelErr } = await supabase.storage
        .from(BUCKET)
        .remove([existing.path]);

      if (storageDelErr) throw storageDelErr;
    }

    // 3) upload new file
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) throw new Error("Public URL generation failed");

    // 4) update or insert product_images row
    if (existing?.id) {
      const { error: updateErr } = await supabase
        .from("product_images")
        .update({
          url: publicUrl,
          path: filePath,          // ✅ important
          alt: file.name,
          position: 0
        })
        .eq("id", existing.id);

      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase.from("product_images").insert({
        product_id: productId,
        url: publicUrl,
        path: filePath,            // ✅ important
        alt: file.name,
        position: 0
      });

      if (insertErr) throw insertErr;
    }

    return { error: null, publicUrl };
  } catch (error) {
    console.error("upsertProductPrimaryImage error:", error);
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
      .select("id, url, path, position")
      .eq("product_id", productId)
      .order("position", { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// /Deleting the image bucket
export async function deleteStorageFiles(paths = []) {
  try {
    const BUCKET = "product-images";
    const cleanPaths = paths.filter(Boolean);

    console.log("Deleting paths:", cleanPaths);

    if (!cleanPaths.length) return { error: null };

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove(cleanPaths);

    if (error) console.error("Storage delete error:", error);


    return { error };
  } catch (error) {
    return { error };
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

/**
 * Delete subcategory Cascade (also delete products-images from storage)
 */
export async function deleteSubcategoryCascade(subcategoryId) {
  try {
    // 1) Fetch all product IDs under subcategory
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id")
      .eq("subcategory_id", subcategoryId);

    if (prodErr) throw prodErr;

    const productIds = (products || []).map((p) => p.id);

    // 2) Fetch storage paths from product_images
    if (productIds.length > 0) {
      const { data: imgs, error: imgErr } = await supabase
        .from("product_images")
        .select("path")
        .in("product_id", productIds);

      if (imgErr) throw imgErr;

      const paths = (imgs || []).map((x) => x.path).filter(Boolean);

      // 3) Delete from storage bucket
      if (paths.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from("product-images")
          .remove(paths);

        if (storageErr) throw storageErr;
      }
    }

    // 4) Delete subcategory (cascade deletes products + product_images rows)
    const { error: delErr } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", subcategoryId);

    if (delErr) throw delErr;

    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function fetchPrimaryProductImage(productId) {
  try {
    const { data, error } = await supabase
      .from("product_images")
      .select("id, path")
      .eq("product_id", productId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteProductImageById({ imageId, path }) {
  try {
    const BUCKET = "product-images";

    // 1) delete from storage
    if (path) {
      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .remove([path]);

      if (storageErr) throw storageErr;
    }

    // 2) delete DB row
    const { error: dbErr } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (dbErr) throw dbErr;

    return { error: null };
  } catch (error) {
    return { error };
  }
}






