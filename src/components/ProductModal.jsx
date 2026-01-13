import { useEffect, useMemo, useState } from "react";
import { getImageWithFallback } from "../assets";
import close_ic from "../assets/Icons/close_ic.svg";

const ProductModal = ({ isOpen, product, onClose, onAddToCart }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ✅ always compute safe values (even when closed) to keep Hooks stable
  const safeProduct = product || {};
  const title = safeProduct?.title || safeProduct?.name || "Product";

  const imageFromDb = safeProduct?.product_images?.[0]?.url || "";
  const imageRaw = safeProduct?.image || imageFromDb;

  const imageSrc = useMemo(() => {
    if (!imageRaw) return getImageWithFallback("", title);

    if (typeof imageRaw === "string") {
      if (imageRaw.startsWith("http")) return imageRaw;
      return getImageWithFallback(imageRaw, title);
    }

    return getImageWithFallback("", title);
  }, [imageRaw, title]);

  const priceValue = Number(safeProduct?.price ?? 0);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    if (showConfirmation) return;
    onAddToCart(safeProduct);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 2000);
  };

  // ✅ return AFTER hooks
  if (!isOpen || !product) return null;

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
              <img src={imageSrc} alt={title} className="w-full h-full object-cover" />

              {showConfirmation && (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-emerald-600 shadow-lg">
                    <span className="text-base font-bold">✓</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">
                      Added to cart
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
              aria-label={`Add ${title} to cart`}
            >
              Add to Cart
            </button>
          </div>

          <div className="space-y-4 md:w-1/2">
            <section className="space-y-4">
              <h2 id="modal-title" className="text-3xl font-semibold text-gray-900">
                {title}
              </h2>

              <p className="text-2xl font-bold text-gray-900">
                {"\u20B9"}
                {priceValue.toLocaleString("en-IN")}
              </p>

              <p className="text-md text-gray-700 leading-relaxed">
                {safeProduct?.description || ""}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
