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
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2
              id={`category-${categoryName}`}
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            >
              {displayName}
            </h2>
            <button
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              aria-label={`View all ${displayName.toLowerCase()}`}
              onClick={handleViewAll}
            >
              <span>View All</span>
              <span className="text-lg text-white/80 transition group-hover:translate-x-0.5">→</span>
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
