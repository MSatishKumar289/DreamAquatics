import { useEffect } from 'react';
import { getImageWithFallback } from '../assets';
import close_ic from '../assets/Icons/close_ic.svg';

const ProductModal = ({ isOpen, product, onClose, onAddToCart }) => {
  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  const handleOverlayClick = (e) => {
    // Close only if clicking the overlay, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    // Optionally close modal after adding to cart
    // onClose();
  };

  let imageSrc = product.image;
  if (typeof product.image === 'string') {
    if (product.image.startsWith('http')) {
      imageSrc = product.image;
    } else {
      imageSrc = getImageWithFallback(product.image, product.title);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative mx-4 w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl md:p-8">
        <div className="mb-4 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <img width={18} height={18} src={close_ic} alt="Close" />
          </button>
        </div>

        <div className="flex flex-col gap-6 md:min-h-[420px] md:flex-row">
          {/* Product Image */}
          <div className="space-y-4 md:w-1/2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={imageSrc}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
              aria-label={`Add ${product.title} to cart`}
            >
              Add to Cart
            </button>
          </div>
          <div className="space-y-4 md:w-1/2">
            <section className="space-y-4">
              {/* Product Title */}
              <h2 id="modal-title" className="text-3xl font-semibold text-gray-900">
                {product.title}
              </h2>

              {/* Price */}
              <p className="text-2xl font-bold text-gray-900">
                {'\u20B9'}
                {product?.price?.toLocaleString('en-IN')}
              </p>

              {/* Full Description */}
              <p className="text-md text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

