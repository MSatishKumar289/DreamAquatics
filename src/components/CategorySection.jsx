import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';

const CategorySection = ({ categoryName, products }) => {
  const navigate = useNavigate();
  const categoryLabel = {
    'fishes': 'Fishes',
    'live-plants': 'Live Plants',
    'accessories': 'Accessories',
    'tank': 'Tank'
  };

  const displayName = categoryLabel[categoryName] || categoryName;

  const handleViewAll = () => {
    navigate(`/category/${categoryName}`);
  };

  // Take only the first 4 products for this category
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-6 md:py-8" aria-labelledby={`category-${categoryName}`}>
      <div className="container mx-auto px-2 sm:px-2 lg:px-4">
        <div className="rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-sky-100/60 backdrop-blur">
          {/* Section Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2
              id={`category-${categoryName}`}
              className="text-xl sm:text-2xl font-bold text-gray-900"
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
              <CategoryCard key={product.id} categoryName={categoryName} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
