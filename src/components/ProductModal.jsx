import { useEffect } from 'react';
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-[70vw] mx-4 p-6 relative max-h-[60vh] overflow-y-auto">
        {/* Close Button */}
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label="Close modal"
        >
          <img width={32} src={close_ic} alt="Close"/>
        </button>

        <div className='flex'>
          {/* Product Image */}
          <div className="w-full rounded-xl mb-4 aspect-[4/3] bg-gray-100 overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className='flex flex-col justify-between pt-4 ml-4 '>
            <section>
              {/* Product Title */}
              <h2 id="modal-title" className="text-2xl font-semibold">
                {product.title}
              </h2>

              {/* Price */}
              <p className="text-lg font-bold text-emerald-600 mt-2">
                ₹{product.price}
              </p>

              {/* Full Description */}
              <p className="text-md text-gray-700 mt-4">
                {product.description}
              </p>
            </section>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
              aria-label={`Add ${product.title} to cart`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

