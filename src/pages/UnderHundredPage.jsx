import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllProductsWithCategories } from "../lib/catalogApi";
import CategoryCard from "../components/CategoryCard";

const UnderHundredPage = () => {
  const [items, setItems] = useState([]);
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

  const title = useMemo(() => `Under \u20B9100 (${items.length})`, [items.length]);

  const getRouteCategorySlug = (product) => {
    const slug = String(product?.subcategory?.category?.slug || "").toLowerCase();
    if (slug === "plants") return "live-plants";
    if (slug === "tanks") return "tank";
    return slug || "fishes";
  };

  const getRelatedProductsFor = (baseProduct) => {
    const subcategoryId = baseProduct?.subcategory?.id;
    if (!subcategoryId) return [];
    return items.filter((item) => item?.subcategory?.id === subcategoryId);
  };

  return (
    <main className="min-h-screen bg-transparent px-4 pb-12 pt-16 sm:px-6 md:pt-20">
      <section className="container mx-auto">
        <div className="rounded-3xl bg-white/85 px-4 py-5 shadow-inner ring-1 ring-sky-100/60 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
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
            <h1 className="text-right text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              Loading products...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No products found under \u20B9100.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {items.map((product) => (
                <CategoryCard
                  key={product.id}
                  categoryName={getRouteCategorySlug(product)}
                  product={product}
                  relatedProducts={getRelatedProductsFor(product)}
                  showStockBadge
                  borderless
                  itemDetailGoldenBorder
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default UnderHundredPage;
