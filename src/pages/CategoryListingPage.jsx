import { useParams, Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import ProductModal from "../components/ProductModal";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { fetchAllProductsWithCategories } from "../lib/catalogApi";

const CategoryListingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const { addToCart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // DB state
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [categorySlug, subCategorySlug]);

  // Map category slug to human-readable title
  const categoryLabel = {
    fishes: "Fishes",
    "live-plants": "Live Plants",
    accessories: "Accessories",
    tank: "Tank",
    plants: "Live Plants",
    tanks: "Tank",
  };

  const slugToTitle = (slug) => {
    if (!slug) return "";
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const subCategoryTitle = subCategorySlug ? slugToTitle(subCategorySlug) : null;

  const titleOfListingPage =
    subCategoryTitle ||
    categoryLabel[categorySlug] ||
    slugToTitle(categorySlug);

  // ✅ FIX: normalize route slug -> DB slug
  const normalizedCategorySlug = useMemo(() => {
    if (categorySlug === "live-plants") return "plants";
    if (categorySlug === "tank") return "tanks";
    return categorySlug;
  }, [categorySlug]);

  /* =========================
      FETCH ALL PRODUCTS (DB)
  ========================= */
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await fetchAllProductsWithCategories();

      if (error) {
        console.error("Error fetching products:", error);
        setDbProducts([]);
        setLoading(false);
        return;
      }

      setDbProducts(data || []);
      setLoading(false);
    })();
  }, []);

  /* =========================================================
     MODE A: Category View (/category/:categorySlug)
     → show SUBCATEGORIES (cards)
  ========================================================= */
  const subcategoryCards = useMemo(() => {
    if (!dbProducts?.length) return [];

    const filtered = dbProducts.filter((p) => {
      const pCatSlug = p?.subcategory?.category?.slug;
      return pCatSlug === normalizedCategorySlug;
    });

    // group by subcategory.id
    const map = new Map();

    filtered.forEach((p) => {
      const sub = p?.subcategory;
      if (!sub?.id) return;

      if (!map.has(sub.id)) map.set(sub.id, []);
      map.get(sub.id).push(p);
    });

    // build card model (use latest product as cover image)
    const cards = Array.from(map.values()).map((group) => {
      const latestProduct = group.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.created_at) > new Date(latest.created_at)
          ? current
          : latest;
      }, null);

      const sub = latestProduct?.subcategory;
      if (!sub?.id) return null;

      return {
        id: sub.id,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
        subcategorySlug: sub.slug,
        latestProductDate: latestProduct?.created_at || "",
        image: latestProduct?.product_images?.[0]?.url || "",
      };
    });

    return cards
      .filter(Boolean)
      .sort((a, b) => new Date(b.latestProductDate) - new Date(a.latestProductDate));
  }, [dbProducts, normalizedCategorySlug]);

  /* =========================================================
     MODE B: Subcategory View (/category/:categorySlug/:subCategorySlug)
     → show PRODUCTS
  ========================================================= */
  const productsForIteration = useMemo(() => {
    if (!dbProducts?.length) return [];

    if (!subCategorySlug) return [];

    return dbProducts.filter((p) => {
      const pCatSlug = p?.subcategory?.category?.slug;
      const pSubSlug = p?.subcategory?.slug;

      return pCatSlug === normalizedCategorySlug && pSubSlug === subCategorySlug;
    });
  }, [dbProducts, normalizedCategorySlug, subCategorySlug]);

  // ✅ decide which list to render
  const isSubcategoryMode = !!subCategorySlug;
  const listForGrid = isSubcategoryMode ? productsForIteration : subcategoryCards;

  const handleViewMore = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-12">
      <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl shadow-blue-100/70 backdrop-blur">
          <nav
            className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="text-slate-500 transition hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1"
            >
              Home
            </Link>
            <span className="mx-2 text-slate-400">/</span>

            {!subCategorySlug && <span className="text-slate-700">{categorySlug}</span>}

            {subCategorySlug && (
              <>
                <Link
                  to={`/category/${categorySlug}`}
                  className="text-slate-500 transition hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1"
                >
                  {categorySlug}
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-700">{subCategoryTitle}</span>
              </>
            )}
          </nav>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-blue-600">
                Collection
              </p>
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                {titleOfListingPage}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Explore carefully curated aquatic species ready to ship nationwide. Each card taps for full details and quick cart access.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Listings
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {loading ? "-" : listForGrid.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-blue-100/80">
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">Loading...</p>
            </div>
          ) : listForGrid.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {listForGrid.map((item) => (
                <CategoryCard
                  key={item.id}
                  categoryName={categorySlug}
                  product={item}
                  handleSubCategoryClick={() => {
                    // Only needed for subcategory mode product click
                    // but safe to keep as-is
                    if (isSubcategoryMode) handleViewMore(item);
                  }}
                  isSubCategory={!isSubcategoryMode} // ✅ category page => subcategory cards
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">
                No products found in this category.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ✅ Modal only makes sense in product listing mode */}
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
};

export default CategoryListingPage;
