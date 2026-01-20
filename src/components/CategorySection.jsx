import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';

const CategorySection = ({ categoryName, products }) => {
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
  // console.log(displayProducts);

  return (
    <section className="px-4 pt-6 sm:px-6 container mx-auto" aria-labelledby={`category-${categoryName}`}>
      <div className="w-full px-0">
        <div className="rounded-none bg-white/95 px-2 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:rounded-3xl sm:px-6 lg:px-10">
          {/* Section Header */}
          <div className="relative mb-6 pr-28 sm:pr-32">
            <h2
              id={`category-${categoryName}`}
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            >
              {displayName}
            </h2>
            <button
              className="group absolute right-0 top-0 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(37,99,235,0.25)] focus:outline-none"
              aria-label={`View all ${displayName.toLowerCase()}`}
              onClick={handleViewAll}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-700">
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
