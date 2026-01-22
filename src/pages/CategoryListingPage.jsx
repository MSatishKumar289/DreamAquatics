import { useParams, Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import { useState, useEffect, useMemo, useRef } from "react";
import { useCart } from "../context/CartContext";
import { fetchAllProductsWithCategories } from "../lib/catalogApi";

const CategoryListingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const { addToCart } = useCart();

  // DB state
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const openingSearchRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    setSearchQuery("");
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    const onScroll = () => {
      if (openingSearchRef.current) return;
      const atTop = window.scrollY <= 0;
      if (isSearchFocused) {
        if (!atTop) {
          searchInputRef.current?.blur();
          setIsSearchFocused(false);
          setIsSearchCollapsed(true);
        }
        return;
      }
      if (!atTop) {
        setIsSearchCollapsed(true);
        return;
      }
      setIsSearchCollapsed(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isSearchFocused]);

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

  const renderCategoryIcon = (value) => {
    switch (value) {
      case "fishes":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 12c2.5-3 7-5 12-4l4 4-4 4c-5 1-9.5-1-12-4Z" />
            <circle cx="10" cy="12" r="1" fill="currentColor" />
          </svg>
        );
      case "live-plants":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 20V6" />
            <path d="M12 12c-3-1-4-3-4-6 3 1 4 3 4 6Z" />
            <path d="M12 14c3-1 4-3 4-6-3 1-4 3-4 6Z" />
          </svg>
        );
      case "accessories":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M14 6l4 4-8 8H6v-4l8-8Z" />
            <path d="M13 7l4 4" />
          </svg>
        );
      case "tank":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="7" width="18" height="10" rx="2" />
            <path d="M7 17c1 2 9 2 10 0" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="8" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        );
    }
  };

  const subCategoryTitle = subCategorySlug ? slugToTitle(subCategorySlug) : null;

  const titleOfListingPage =
    subCategoryTitle ||
    categoryLabel[categorySlug] ||
    slugToTitle(categorySlug);

  const categoryIconKey = useMemo(() => {
    if (categorySlug === "plants") return "live-plants";
    if (categorySlug === "tanks") return "tank";
    return categorySlug;
  }, [categorySlug]);

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
        subcategoryDescription: sub.description || "",
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

    const filtered = dbProducts.filter((p) => {
      const pCatSlug = p?.subcategory?.category?.slug;
      const pSubSlug = p?.subcategory?.slug;

      return pCatSlug === normalizedCategorySlug && pSubSlug === subCategorySlug;
    });
    const getStockFlag = (item) => {
      const count = Number(item?.stock_count);
      if (Number.isFinite(count)) return count > 0;
      const status = String(item?.availability || item?.status || "").toLowerCase();
      if (!status) return true;
      return !/out|sold/.test(status);
    };
    return filtered.sort((a, b) => {
      const aInStock = getStockFlag(a);
      const bInStock = getStockFlag(b);
      if (aInStock === bInStock) return 0;
      return aInStock ? -1 : 1;
    });
  }, [dbProducts, normalizedCategorySlug, subCategorySlug]);

  // ✅ decide which list to render
  const isSubcategoryMode = !!subCategorySlug;
  const listForGrid = isSubcategoryMode ? productsForIteration : subcategoryCards;
  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return listForGrid;
    return listForGrid.filter((item) => {
      const title = isSubcategoryMode
        ? (item?.name || item?.title || "")
        : (item?.subcategoryName || item?.name || item?.title || "");
      return title.toLowerCase().includes(query);
    });
  }, [isSubcategoryMode, listForGrid, searchQuery]);
  const subcategoryDescription = useMemo(() => {
    if (!isSubcategoryMode) return "";
    const firstWithDescription = productsForIteration.find(
      (item) => item?.subcategory?.description
    );
    if (firstWithDescription?.subcategory?.description) {
      return firstWithDescription.subcategory.description;
    }
    const fallback = dbProducts.find(
      (item) =>
        item?.subcategory?.slug === subCategorySlug &&
        item?.subcategory?.category?.slug === normalizedCategorySlug &&
        item?.subcategory?.description
    );
    return fallback?.subcategory?.description || "";
  }, [
    isSubcategoryMode,
    productsForIteration,
    dbProducts,
    subCategorySlug,
    normalizedCategorySlug
  ]);
  const descriptionText = subcategoryDescription
    ? subcategoryDescription
    : "Explore carefully curated aquatic species ready to ship nationwide. Add items straight from the cards.";
  const hasLongDescription = descriptionText.trim().length > 160;
  const isSearching = searchQuery.trim().length > 0;

  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
  };

  const searchBar = (
    <div className="container mx-auto flex justify-center">
      <div
        onClick={() => {
          if (!isSearchCollapsed) return;
          openingSearchRef.current = true;
          setIsSearchFocused(true);
          setIsSearchCollapsed(false);
          window.scrollTo({ top: 0, behavior: "auto" });
          setTimeout(() => {
            openingSearchRef.current = false;
            searchInputRef.current?.focus();
          }, 80);
        }}
        className={`relative mt-[5px] mb-[10px] w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex sm:items-center sm:justify-between sm:gap-4 ${
          isSearchCollapsed
            ? "translate-x-2 rounded-full bg-transparent px-0 py-0 shadow-none ring-0 cursor-pointer"
            : "translate-x-0 h-[56px] rounded-xl border border-slate-200 bg-white/95 px-2 py-2 shadow-sm ring-1 ring-slate-100 sm:h-auto sm:px-4 sm:py-3"
        }`}
      >
        <div
          className={`flex w-full items-center gap-2 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isSearchCollapsed
              ? "pointer-events-none -translate-y-3 scale-[0.98] opacity-0"
              : "translate-y-0 scale-100 opacity-100"
          }`}
        >
          <div className="relative flex h-9 w-10 shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white sm:h-10 sm:w-14 sm:rounded-xl">
            <span className="pointer-events-none text-slate-600">
              {renderCategoryIcon(categoryIconKey)}
            </span>
            <span className="pointer-events-none text-slate-500">
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
          <div className="relative flex h-9 flex-1 min-w-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 sm:h-auto sm:rounded-xl sm:py-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={
                  isSubcategoryMode
                    ? "Search in this category"
                    : "Search subcategories"
                }
                ref={searchInputRef}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            {searchQuery.trim() ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="Clear search"
              >
                X
              </button>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" />
              </svg>
            )}
          </div>
        </div>
        <div
          className={`absolute right-3 top-1/2 flex -translate-y-1/2 items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:right-4 ${
            isSearchCollapsed
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-3 scale-[0.98] opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setIsSearchCollapsed(false);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Open search"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-12">
      <section className="fixed inset-x-0 top-16 z-40 px-4 pt-0 sm:px-6 md:top-20">
        {searchBar}
      </section>
      <div className="h-[78px] md:h-[84px]" aria-hidden="true" />
      <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        {!isSearching && (
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

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm uppercase tracking-[0.4em] text-blue-600">
                  Collection
                </p>
                <h1 className="text-4xl font-bold text-slate-900 line-clamp-2 sm:text-5xl">
                  {titleOfListingPage}
                </h1>
              </div>

              <div className="flex flex-none gap-3">
                <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-center shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Listings
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {loading ? "-" : (isSubcategoryMode ? filteredList.length : listForGrid.length)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="max-w-none text-base text-slate-600 line-clamp-3">
                {descriptionText}
              </p>
              {hasLongDescription && (
                <button
                  type="button"
                  onClick={() => setShowDescriptionModal(true)}
                  className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  View more
                </button>
              )}
            </div>
          </div>
          </section>
        )}

        <section
          className={`rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-blue-100/80 ${
            isSearching ? "mt-4" : "mt-8"
          }`}
        >
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">Loading...</p>
            </div>
          ) : filteredList.length > 0 ? (
            <div
              className={`rounded-3xl ${
                isSearching
                  ? "bg-white/95 px-4 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:px-6 lg:px-10"
                  : ""
              }`}
            >
              {isSearching && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                      Search results
                    </p>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {filteredList.length} items found
                    </h2>
                  </div>
                </div>
              )}
              {isSearching ? (
                <div
                  className="columns-2 gap-4 max-h-[70vh] overflow-y-auto pb-24 sm:max-h-none sm:overflow-visible sm:pb-0 sm:columns-3 lg:columns-4"
                  onScroll={() => searchInputRef.current?.blur()}
                >
                  {filteredList.map((item) => (
                    <div key={item.id} className="mb-4 break-inside-avoid">
                      <CategoryCard
                        categoryName={categorySlug}
                        product={item}
                        isSubCategory={!isSubcategoryMode}
                        onAddToCart={handleAddToCart}
                        showStockBadge={isSubcategoryMode}
                        isMasonry
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredList.map((item) => (
                    <CategoryCard
                      key={item.id}
                      categoryName={categorySlug}
                      product={item}
                      isSubCategory={!isSubcategoryMode}
                      onAddToCart={handleAddToCart}
                      showStockBadge={isSubcategoryMode}
                    />
                  ))}
                </div>
              )}
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

      {showDescriptionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowDescriptionModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Collection
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {titleOfListingPage}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDescriptionModal(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                aria-label="Close description"
              >
                X
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-base text-slate-600">
              {descriptionText}
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default CategoryListingPage;
