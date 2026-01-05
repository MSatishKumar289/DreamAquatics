import { useEffect, useState } from 'react';
import { getImageWithFallback } from '../assets';
import close_ic from '../assets/Icons/close_ic.svg';
import cartIcon from '../assets/Icons/cart_ic.svg';

const ProductModal = ({ isOpen, product, onClose, onAddToCart }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [qty, setQty] = useState(1);

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

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setShowConfirmation(false);
    }
  }, [isOpen, product]);

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
    if (showConfirmation) return;
    onAddToCart(product, qty);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 2000);
  };

  let imageSrc = product.image;
  if (typeof product.image === 'string') {
    imageSrc = product.image.startsWith('http')
      ? product.image
      : getImageWithFallback(product.image, product.title);
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

        <div className="relative flex flex-col gap-6 md:min-h-[420px] md:flex-row">
          <div className="space-y-4 md:w-1/2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={imageSrc}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {showConfirmation && (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-emerald-600 shadow-lg">
                    <span className="text-base font-bold">✓</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">Added to cart</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full items-center gap-3">
              <div className="flex w-1/2 items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <button
                  type="button"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  className="text-lg font-semibold text-slate-600 hover:text-slate-900"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="text-base font-semibold text-slate-900">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((prev) => prev + 1)}
                  className="text-lg font-semibold text-slate-600 hover:text-slate-900"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="inline-flex w-1/2 items-center justify-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 whitespace-nowrap"
                aria-label={`Add ${product.title} to cart`}
              >
                <img src={cartIcon} alt="" className="h-4 w-4 brightness-0 invert" aria-hidden />
                <span className="leading-none">Add to Cart</span>
              </button>
            </div>
          </div>
          <div className="space-y-4 md:w-1/2">
            <section className="space-y-4">
              <h2 id="modal-title" className="text-3xl font-semibold text-gray-900">
                {product.title}
              </h2>

              <p className="text-2xl font-bold text-gray-900">
                {'\u20B9'}
                {product?.price?.toLocaleString('en-IN')}
              </p>

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
