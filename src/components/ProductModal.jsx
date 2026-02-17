import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getImageWithFallback } from "../assets";
import plusIcon from "../assets/Icons/plus.png";
import incPlusIcon from "../assets/Icons/iplus.png";
import incMinusIcon from "../assets/Icons/iminus.png";
import closeIcon from "../assets/Icons/close_one.png";
import { useCart } from "../context/CartContext";
import { renderFormattedDescription } from "../utils/formatDescription";

const ProductModal = ({ isOpen, product, onClose, onAddToCart }) => {
  const { cartItems, addToCart, updateQty, removeItem } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [qty, setQty] = useState(0);
  const [pendingRemove, setPendingRemove] = useState(false);

  // ? always compute safe values (even when closed) to keep Hooks stable
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
  const originalPriceValue = Math.round(priceValue * 1.15);
  const formattedPriceValue = priceValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedOriginalPriceValue = originalPriceValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

  const currentQty =
    cartItems?.find((item) => item.id === safeProduct?.id)?.qty || 0;

  useEffect(() => {
    if (isOpen) {
      setQty(currentQty);
    }
  }, [isOpen, safeProduct?.id, currentQty]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    if (showConfirmation) return;
    const addHandler = onAddToCart || addToCart;
    addHandler?.(safeProduct, 1);
    setQty(1);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 2000);
  };

  // ? return AFTER hooks
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF8DC] via-[#FFF3C4] to-[#FFFDF2] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          aria-label="Close modal"
        >
          <img src={closeIcon} alt="" className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex max-h-[calc(90vh-3rem)] flex-col gap-6 p-6 md:flex-row md:items-stretch">
          <div className="flex w-full flex-col md:w-1/2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]">
              <img src={imageSrc} alt={title} className="h-full w-full object-contain bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]" />
              {showConfirmation && (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                    Added to cart
                  </div>
                </div>
              )}
            </div>
            <div className="mt-1 flex flex-col items-center rounded-2xl border border-amber-200/70 bg-gradient-to-b from-[#FFF8DC]/75 via-[#FFF3C4]/65 to-[#FFFDF2]/80 px-3 py-3 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
              <div className="mt-1 flex items-center justify-center gap-2">
                <p className="text-2xl font-semibold text-[#1D3A8A] sm:text-3xl">
                  {"\u20B9"}
                  {formattedPriceValue}
                </p>
                {originalPriceValue > priceValue && (
                  <p className="text-xl font-medium text-slate-400 line-through">
                    {"\u20B9"}
                    {formattedOriginalPriceValue}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-1 min-h-0 flex-col gap-3 md:w-1/2">
            <div className="premium-flat-scrollbar flex-1 overflow-y-auto overscroll-contain pr-1 md:mt-1 md:pr-0">
              {safeProduct?.description ? (
                <div className="text-sm leading-relaxed text-slate-600">
                  {renderFormattedDescription(safeProduct?.description || "")}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Product details will be available soon.</p>
              )}
            </div>

            <div className="relative mt-auto flex justify-center pt-1">
              {qty === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="group inline-flex h-11 w-full max-w-[180px] min-w-[180px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-4 py-0 text-sm font-semibold uppercase tracking-wide text-amber-950 shadow-md transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
                  aria-label={`Add ${title} to cart`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                    <img src={plusIcon} alt="" className="h-6 w-6" />
                  </span>
                  Add to cart
                </button>
              ) : (
                <div className="inline-flex h-11 w-full max-w-[220px] min-w-[220px] items-center justify-between rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2 shadow-sm">
                  <div
                    className="contents"
                    role="group"
                    aria-label={`Quantity control for ${title}`}
                  >
                    <button
                      type="button"
                        onClick={() => {
                          if (qty <= 1) {
                            setPendingRemove(true);
                            return;
                          }
                          const next = qty - 1;
                          setQty(next);
                          updateQty?.(safeProduct?.id, next);
                        }}
                        aria-label={`Decrease quantity for ${title}`}
                        className="h-9 w-9 rounded-full bg-white text-base font-semibold text-blue-700 shadow hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <img src={incMinusIcon} alt="" className="h-9 w-9" />
                      </button>
                      <span className="px-3 text-base font-semibold text-blue-700">{qty}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = qty + 1;
                          setQty(next);
                          updateQty?.(safeProduct?.id, next);
                        }}
                        aria-label={`Increase quantity for ${title}`}
                        className="h-9 w-9 rounded-full bg-white text-base font-semibold text-blue-700 shadow hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <img src={incPlusIcon} alt="" className="h-9 w-9" />
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {pendingRemove &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setPendingRemove(false);
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">
                Remove item?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Remove {title} from your cart?
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingRemove(false)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeItem?.(safeProduct?.id);
                    setQty(0);
                    setPendingRemove(false);
                  }}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ProductModal;

