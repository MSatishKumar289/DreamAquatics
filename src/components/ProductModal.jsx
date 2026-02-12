import { useEffect, useMemo, useState } from "react";
import { getImageWithFallback } from "../assets";
import plusIcon from "../assets/Icons/plus.png";
import incPlusIcon from "../assets/Icons/iplus.png";
import incMinusIcon from "../assets/Icons/iminus.png";
import closeIcon from "../assets/Icons/close_one.png";
import { useCart } from "../context/CartContext";

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
      aria-labelledby="modal-title"
    >
      <div className="relative mx-4 w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl md:p-8 max-h-[90dvh] overflow-y-auto md:max-h-[90vh] md:overflow-hidden">
        <div className="mb-4 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <img src={closeIcon} alt="" className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex flex-col gap-6 md:min-h-[420px] md:flex-row max-h-none md:max-h-[calc(90vh-5rem)]">
          <div className="space-y-4 md:w-1/2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <img src={imageSrc} alt={title} className="w-full h-full object-cover" />

              {showConfirmation && (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 text-emerald-600 shadow-lg">
                    <span className="text-base font-bold">?</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em]">
                      Added to cart
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center">
              <h2 id="modal-title" className="text-3xl font-semibold text-gray-900">
                {title}
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {"\u20B9"}
                {priceValue.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-center text-xs text-sky-600/80">
                Images are for reference. Actual product appearance may vary.
              </p>
            </div>
          </div>

          <div className="space-y-4 md:w-1/2 flex flex-col min-h-0">
            <section className="space-y-4 flex flex-col min-h-0">
              <p className="text-md whitespace-pre-line text-gray-700 leading-relaxed overflow-y-auto pr-2 max-h-[35vh] md:max-h-none">
                {safeProduct?.description || ""}
              </p>
            </section>

            <div className="flex w-full items-stretch justify-end gap-3 md:pt-2">
              {qty === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="group inline-flex h-12 w-52 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-0 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  aria-label={`Add ${title} to cart`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                    <img src={plusIcon} alt="" className="h-6 w-6" />
                  </span>
                  Add to cart
                </button>
              ) : (
                <div className="w-52">
                  <div
                    className="inline-flex h-12 w-full items-center justify-between rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2 shadow-sm"
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
                      className="h-10 w-10 rounded-full bg-white text-base font-semibold text-blue-700 shadow hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <img src={incMinusIcon} alt="" className="h-10 w-10" />
                    </button>
                    <span className="text-base font-semibold text-blue-700">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = qty + 1;
                        setQty(next);
                        updateQty?.(safeProduct?.id, next);
                      }}
                      aria-label={`Increase quantity for ${title}`}
                      className="h-10 w-10 rounded-full bg-white text-base font-semibold text-blue-700 shadow hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <img src={incPlusIcon} alt="" className="h-10 w-10" />
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

