import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllProductsWithCategories } from "../lib/catalogApi";
import CategoryCard from "../components/CategoryCard";

const UnderHundredPage = () => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await fetchAllProductsWithCategories();
      if (!active) return;
      if (error) {
        setItems([]);
        setLoading(false);
        return;
      }
      const filtered = (data || [])
        .filter((product) => {
          const price = Number(product?.price);
          return Number.isFinite(price) && price <= 100;
        })
        .sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
      setItems(filtered);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const getRouteCategorySlug = (product) => {
    const slug = String(product?.subcategory?.category?.slug || "").toLowerCase();
    if (slug === "plants") return "live-plants";
    if (slug === "tanks") return "tank";
    return slug || "fishes";
  };

  const title = useMemo(() => `Under \u20B9100 (${items.length})`, [items.length]);

  const categoryFilterOptions = useMemo(() => {
    const seen = new Set();
    const options = [{ value: "all", label: "All Categories" }];
    items.forEach((product) => {
      const slug = getRouteCategorySlug(product);
      if (seen.has(slug)) return;
      seen.add(slug);
      const labelBySlug = {
        fishes: "Fishes",
        "live-plants": "Live Plants",
        accessories: "Tanks & Accessories",
        tank: "Fish Food & Medicines",
      };
      options.push({
        value: slug,
        label: labelBySlug[slug] || slug,
      });
    });
    return options;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((product) => getRouteCategorySlug(product) === selectedCategory);
  }, [items, selectedCategory]);


  const getRelatedProductsFor = (baseProduct) => {
    const subcategoryId = baseProduct?.subcategory?.id;
    if (!subcategoryId) return [];
    return items.filter((item) => item?.subcategory?.id === subcategoryId);
  };

  return (
    <main className="min-h-screen bg-transparent px-4 pb-12 pt-8 sm:px-6 md:pt-10">
      <section className="container mx-auto">
        <div className="rounded-3xl bg-white/85 px-4 py-5 shadow-inner ring-1 ring-sky-100/60 sm:px-6">
          <div className="mb-4 flex items-center justify-start gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Go back"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
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
            <h1 className="text-left text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
          </div>

          {!loading && items.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                Category
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold normal-case tracking-normal text-slate-700 focus:border-blue-500 focus:outline-none"
                >
                  {categoryFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`under-hundred-loading-${index}`}
                  className="overflow-hidden rounded-[6px] border border-slate-200 bg-white/80"
                >
                  <div className="da-card-skeleton aspect-[4/3.1]" />
                  <div className="space-y-2 p-2">
                    <div className="da-card-skeleton h-3 w-4/5" />
                    <div className="da-card-skeleton h-3 w-2/5" />
                    <div className="da-card-skeleton h-8 w-full rounded-[5px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No products found under \u20B9100.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No products found in this category under \u20B9100.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {filteredItems.map((product, index) => (
                <div
                  key={product.id}
                  className="h-full da-card-reveal"
                  style={{ "--da-stagger": `${Math.min(index, 12) * 18}ms` }}
                >
                  <CategoryCard
                    categoryName={getRouteCategorySlug(product)}
                    product={product}
                    relatedProducts={getRelatedProductsFor(product)}
                    showStockBadge
                    borderless
                    itemDetailGoldenBorder
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default UnderHundredPage;
