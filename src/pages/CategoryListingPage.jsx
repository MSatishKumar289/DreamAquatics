import { useParams, Link } from 'react-router-dom';
import { getProductsByCategory } from '../data/sampleProducts';
import { getSubItems } from '../data/subSampleProducts';
import CategoryCard from '../components/CategoryCard';

import ProductModal from '../components/ProductModal';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const CategoryListingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [categorySlug, subCategorySlug]);

  
  // Map category slug to human-readable title
  const categoryLabel = {
    'fishes': 'Fishes',
    'live-plants': 'Live Plants',
    'accessories': 'Accessories',
    'tank': 'Tank'
  };
  
  const categoryTitle = categorySlug;
  
  // Convert slug to title format (e.g., "neon-tetra" -> "Neon Tetra")
  const slugToTitle = (slug) => {
    if (!slug) return '';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const subCategoryTitle = subCategorySlug ? slugToTitle(subCategorySlug) : null;
  const titleOfListingPage = subCategoryTitle || categoryLabel[categorySlug];
  
  // Filter products by category
  const products = getProductsByCategory(categorySlug);
  // getSubItems expects the exact title format, not slug
  const subProducts = subCategoryTitle ? getSubItems('subCategoryTitle') : [];
  // console.log("subProducts: ", subProducts, ",", subCategorySlug, "," , getSubItems(subCategorySlug));
  
  const productForIteration = subCategorySlug?.length > 0 ? subProducts : products;
  
  // console.log("We are inside CategoryListingPage - categoryTitle: ", categoryTitle);
  // console.log(" categorySlug: ", categorySlug);
  // console.log( " subCategorySlug: ", subCategorySlug);
  // console.log("productForIteration: ", productForIteration);
  // console.log("subProducts: ", subProducts, "--- products: ", products)
  
  const handleViewMore = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white pb-12">
      <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl shadow-blue-100/70 backdrop-blur">
          <nav className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400" aria-label="Breadcrumb">
            <Link
              to="/"
              className="text-slate-500 transition hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1"
            >
              Home
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            {!subCategorySlug && <span className="text-slate-700">{categoryTitle}</span>}
            {subCategorySlug && (
              <>
                <Link
                  to={`/category/${categorySlug}`}
                  className="text-slate-500 transition hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1"
                >
                  {categoryTitle}
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-700">{subCategoryTitle}</span>
              </>
            )}
          </nav>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-blue-600">Collection</p>
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                {titleOfListingPage}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Explore carefully curated aquatic species ready to ship nationwide. Each card taps for full details and quick cart access.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Listings</p>
                <p className="text-2xl font-semibold text-slate-900">{productForIteration.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg shadow-blue-100/80">
          {productForIteration.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {productForIteration.map((product) => (
                <CategoryCard
                  key={product.id}
                  categoryName={categoryTitle}
                  product={product}
                  handleSubCategoryClick={() => {
                    handleViewMore(product);
                  }}
                  isSubCategory={subCategorySlug != undefined}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">No products found in this category.</p>
            </div>
          )}
        </section>
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

