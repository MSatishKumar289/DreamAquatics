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
    <section className="py-6 md:py-8" aria-labelledby={`category-${categoryName}`}>
      <div className="w-full px-0">
        <div className="rounded-none bg-white/95 px-2 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:rounded-3xl sm:px-6 lg:px-10">
          {/* Section Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2
              id={`category-${categoryName}`}
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            >
              {displayName}
            </h2>            <button
              className="btn-primary"
              aria-label={`View all ${displayName.toLowerCase()}`}
              onClick={handleViewAll}
            >
              View All
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
