import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';

const CategorySection = ({ categoryName, products, subcategoryCount = 0 }) => {
  const navigate = useNavigate();
  const categoryLabel = {
    'fishes': '🐠 Fishes',
    'live-plants': '🌿 Live Plants',
    'accessories': '🧰 Accessories',
    'tank': '🫧 Tank'
  };

  const displayName = categoryLabel[categoryName] || categoryName;

  const handleViewAll = () => {
    navigate(`/category/${categoryName}`);
  };

  const displayProducts = products;
  const productCount = subcategoryCount;
  const showingCount = displayProducts.length;
  // console.log(displayProducts);

  return (
    <section className="px-4 pt-6 sm:px-6 container mx-auto" aria-labelledby={`category-${categoryName}`}>
      <div className="w-full px-0">
        <div className="rounded-none bg-white/75 px-2 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:rounded-3xl sm:px-6 lg:px-10">
          {/* Section Header */}
          <div className="mb-4 flex flex-nowrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2
                id={`category-${categoryName}`}
                className="truncate text-xl font-bold text-gray-900 sm:text-2xl"
              >
                {displayName}
              </h2>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Showing {showingCount} of {productCount}
              </p>
            </div>
            <button
              className="group relative inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-200 hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] focus:outline-none sm:px-4 sm:text-xs sm:tracking-[0.3em]"
              aria-label={`View all ${displayName.toLowerCase()}`}
              onClick={handleViewAll}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="6" height="6" rx="1" />
                  <rect x="14" y="4" width="6" height="6" rx="1" />
                  <rect x="4" y="14" width="6" height="6" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
              </span>
              <span>View All</span>
              <span className="absolute -right-2 -top-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-white shadow ring-2 ring-blue-300">
                {productCount}
              </span>
            </button>
          </div>

          <div className="mb-2 flex items-center justify-end">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:text-[11px]">
              Swipe
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </div>

          {/* Two-row horizontal scroll for all breakpoints */}
          <div className="-mx-2 overflow-x-auto px-2 pb-2">
            <div className="grid w-max snap-x snap-mandatory grid-flow-col grid-rows-2 gap-4 auto-cols-[230px] sm:auto-cols-[250px] lg:auto-cols-[270px]">
              {displayProducts.map((product) => (
                <div
                  key={product.subcategoryId || product.id}
                  className="snap-start"
                >
                  <CategoryCard
                    categoryName={categoryName}
                    product={product}
                    isSubCategory
                    showStockBadge={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
