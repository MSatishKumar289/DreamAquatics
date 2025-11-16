import CategoryCard from './CategoryCard';

const CategorySection = ({ categoryName, products }) => {
  const categoryLabel = {
    'fishes': 'Fishes',
    'live-plants': 'Live Plants',
    'accessories': 'Accessories',
    'tank': 'Tank'
  };

  const displayName = categoryLabel[categoryName] || categoryName;

  const handleViewAll = () => {
    // Placeholder for future navigation
  };

  // Take only the first 4 products for this category
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-8 md:py-12" aria-labelledby={`category-${categoryName}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id={`category-${categoryName}`}
            className="text-xl sm:text-2xl font-bold text-gray-900"
          >
            {displayName}
          </h2>
          <button
            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1 transition-colors"
            aria-label={`View all ${displayName.toLowerCase()}`}
            onClick={handleViewAll}
          >
            View All
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <CategoryCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
