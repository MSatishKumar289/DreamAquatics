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

  // Take only the first 4 products for this category
  const displayProducts = products.slice(0, 4);
  const productCount = subcategoryCount;
  // console.log(displayProducts);

  return (
    <section className="px-4 pt-6 sm:px-6 container mx-auto" aria-labelledby={`category-${categoryName}`}>
      <div className="w-full px-0">
        <div className="rounded-none bg-white/95 px-2 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:rounded-3xl sm:px-6 lg:px-10">
          {/* Section Header */}
          <div className="mb-4 flex flex-nowrap items-center justify-between gap-3">
            <h2
              id={`category-${categoryName}`}
              className="truncate text-xl font-bold text-gray-900 sm:text-2xl"
            >
              {displayName}
            </h2>
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

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 sm:gap-5 md:grid-cols-4 md:gap-5">
            {displayProducts.map((product) => (
              <CategoryCard
                key={product.subcategoryId || product.id}
                categoryName={categoryName}
                product={product}
                isSubCategory
                showStockBadge={false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
