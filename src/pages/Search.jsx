import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllProductsWithCategories } from "../lib/catalogApi";
import CategoryCard from "../components/CategoryCard";
import WhatsIcon from "../assets/Images/whatsapp.jpeg";

const Search = () => {
  const CATEGORY_SLUG_MAP = {
    fishes: "fishes",
    "live-plants": "plants",
    accessories: "accessories",
    tank: "tanks",
  };
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const categoryOptions = [
    { value: "all", label: "All categories" },
    { value: "fishes", label: "Fishes" },
    { value: "live-plants", label: "Live Plants" },
    { value: "accessories", label: "Accessories" },
    { value: "tank", label: "Tank" },
  ];

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

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allProducts.filter((product) => {
      const title = (product.name || product.title || "").toLowerCase();
      const subcategory = (product.subcategory?.name || "").toLowerCase();
      const matchCategory =
        searchCategory === "all"
          ? true
          : CATEGORY_SLUG_MAP[searchCategory] === product.subcategory?.category?.slug;
      return matchCategory && (title.includes(query) || subcategory.includes(query));
    });
  }, [allProducts, searchCategory, searchQuery, CATEGORY_SLUG_MAP]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await fetchAllProductsWithCategories();
        if (!mounted) return;
        if (error) {
          console.error("Error fetching products:", error);
          setAllProducts([]);
        } else {
          setAllProducts(data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white pb-12">
      <section className="fixed inset-x-0 top-16 z-40 px-4 pt-0 sm:px-6 md:top-20">
        <div className="container mx-auto flex justify-center">
          <div className="relative mt-[5px] mb-[10px] w-full rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm ring-1 ring-slate-100 sm:px-4 sm:py-3">
            <div className="flex w-full max-w-4xl items-center gap-2 mx-auto">
              <div className="relative flex h-9 w-12 items-center justify-center gap-0.8 rounded-xl border border-slate-200 bg-white sm:h-10 sm:w-14">
                <span className="pointer-events-none text-slate-600">
                  {renderCategoryIcon(searchCategory)}
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
                <select
                  value={searchCategory}
                  onChange={(event) => setSearchCategory(event.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer bg-transparent text-transparent focus:outline-none"
                  aria-label="Search category"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-slate-700">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:py-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="absolute left-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Back"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for products"
                  ref={searchInputRef}
                  className="w-full bg-transparent pl-9 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {searchQuery.trim() ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      navigate("/");
                    }}
                    className="absolute right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label="Clear search"
                  >
                    X
                  </button>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute right-3 h-6 w-6 text-slate-400"
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
          </div>
        </div>
      </section>

      <div className="h-[78px] md:h-[84px]" aria-hidden="true" />

      <section className="container mx-auto px-4 pt-6 sm:px-6">
        <div className="rounded-3xl bg-white/95 px-4 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:px-6 lg:px-10">
          {searchQuery.trim() && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Search results
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {searchResults.length} items found
                </h2>
                <p className="mt-2 text-center text-xs text-sky-600/80">
                  Images are for reference. Actual product appearance may vary.
                </p>
              </div>
            </div>
          )}

          <div className="mt-5">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading products...</div>
            ) : searchQuery.trim() && searchResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                <p className="text-sm font-semibold text-slate-700">
                  Didn&apos;t find what you were looking for?
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Tell us what you need and we will help you find it.
                </p>
                <a
                  href={`https://wa.me/918667418965?text=${encodeURIComponent(
                    `Hi, I'm looking for ${searchQuery.trim() || "a product"} — please share the details.`
                  )}`}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/80 bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
                >
                  <img src={WhatsIcon} alt="" className="h-4 w-4 rounded-full object-contain" aria-hidden />
                  WhatsApp us
                </a>
              </div>
            ) : searchQuery.trim() ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {searchResults.map((product) => (
                  <div key={product.id} className="h-full">
                    <CategoryCard
                      categoryName={
                        Object.keys(CATEGORY_SLUG_MAP).find(
                          (key) => CATEGORY_SLUG_MAP[key] === product.subcategory?.category?.slug
                        ) || "fishes"
                      }
                      product={product}
                      showStockBadge
                      compact
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-slate-500">
                Start typing to see results.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Search;
