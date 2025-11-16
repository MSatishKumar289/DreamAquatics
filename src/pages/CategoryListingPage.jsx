import { useParams, Link } from 'react-router-dom';
import { getProductsByCategory } from '../data/sampleProducts';
import ProductTile from '../components/ProductTile';
import ProductModal from '../components/ProductModal';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const CategoryListingPage = () => {
  const { categorySlug } = useParams();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map category slug to human-readable title
  const categoryLabel = {
    'fishes': 'Fishes',
    'live-plants': 'Live Plants',
    'accessories': 'Accessories',
    'tank': 'Tank'
  };

  const categoryTitle = categoryLabel[categorySlug] || categorySlug;

  // Filter products by category
  const products = getProductsByCategory(categorySlug);

  const handleViewMore = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
          <Link
            to="/"
            className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{categoryTitle}</span>
        </nav>

        {/* Category Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
          {categoryTitle}
        </h1>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
            {products.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                onViewMore={handleViewMore}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
      />
    </main>
  );
};

export default CategoryListingPage;

