import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getImageWithFallback } from "../assets";
import plusIcon from "../assets/Icons/plus.png";
import incPlusIcon from "../assets/Icons/iplus.png";
import incMinusIcon from "../assets/Icons/iminus.png";
import closeIcon from "../assets/Icons/close_one.png";
import inStockIcon from "../assets/Icons/in.png";
import outStockIcon from "../assets/Icons/out.png";
import arrowIcon from "../assets/Icons/arrow.png";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { renderFormattedDescription } from "../utils/formatDescription";

const StockStatusRow = ({ isSoldOut }) => (
  <div className="mb-0.5 flex items-center gap-2">
    <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap sm:gap-1.5 sm:px-2.5 sm:text-[11px] ${
        isSoldOut ? "text-rose-700" : "text-emerald-700"
      }`}
    >
      <img
        src={isSoldOut ? outStockIcon : inStockIcon}
        alt=""
        className="h-5 w-5"
        aria-hidden="true"
      />
      {isSoldOut ? "Out of Stock" : "In Stock"}
    </span>
    <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
  </div>
);

const ProductImageArea = ({
  isSubCategory,
  compact,
  imageSrc,
  productTitle,
  productSubtitle,
  showViewHint,
  showExpandHint,
  isFavorite,
  onToggleFavorite,
  onImageClick,
}) => (
      <div
        className={`relative w-full overflow-hidden rounded-t-2xl ${
          isSubCategory
            ? "bg-gradient-to-br from-[#FFF9E6] via-[#FFF4CC] to-[#FFFDF3]"
            : "bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]"
        }`}
      >
        <div
          className={`relative w-full border-b border-slate-200/60 rounded-t-2xl overflow-hidden ${
            compact ? "aspect-[1/1]" : "aspect-[4/3] sm:aspect-[4/3]"
          }`}
        >
      {isSubCategory ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-11 border-b border-slate-200 bg-white px-3">
            <h3
              className="line-clamp-1 flex h-full items-center justify-center text-center text-[0.76rem] font-semibold uppercase tracking-[0.06em] text-slate-900 sm:text-[0.88rem]"
              style={{
                color: "#0f172a",
                textShadow: "0 1px 1px rgba(255,255,255,0.55)",
              }}
            >
              {productTitle}
            </h3>
          </div>
          <span
            className={`pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 sm:hidden ${
              showViewHint ? "opacity-100" : ""
            }`}
          >
            Tap to view
          </span>
          <div className="h-full w-full pt-11">
            <img
              src={imageSrc}
              alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
              className="h-full w-full object-contain bg-white transition-transform duration-300 group-hover:scale-105"
              onClick={onImageClick}
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E" +
                  encodeURIComponent(productTitle) +
                  "%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </>
      ) : (
        <img
          src={imageSrc}
          alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
          className="h-full w-full object-contain bg-white transition-transform duration-300 group-hover:scale-105"
          onClick={onImageClick}
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E" +
              encodeURIComponent(productTitle) +
              "%3C/text%3E%3C/svg%3E";
          }}
        />
      )}
      {!isSubCategory && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite?.();
            }}
            className={`absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border shadow transition ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-slate-200 bg-white/95 text-slate-600 hover:text-rose-600"
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 21s-7-4.35-9.5-8.4C.8 9.6 2.2 5.8 5.8 5c2.2-.5 4.2.4 5.2 2.1 1-1.7 3-2.6 5.2-2.1 3.6.8 5 4.6 3.3 7.6C19 16.65 12 21 12 21Z" />
            </svg>
          </button>
          <div className="pointer-events-none absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 5h5v5" />
              <path d="M19 5l-7 7" />
              <path d="M10 19H5v-5" />
              <path d="M5 19l7-7" />
            </svg>
          </div>
          {showExpandHint && (
            <span className="pointer-events-none absolute bottom-12 right-3 z-10 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md sm:hidden">
              Tap to enlarge
            </span>
          )}
        </>
      )}
    </div>
  </div>
);

const ProductInfo = ({
  isSubCategory,
  isMasonry,
  productTitle,
  productSubtitle,
  price,
}) => {
  const currentPrice = Number(price ?? 0);
  const originalPrice = Math.round(currentPrice * 1.15);
  const savingsAmount = Math.max(0, originalPrice - currentPrice);
  const formattedCurrentPrice = currentPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedOriginalPrice = originalPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedSavingsAmount = savingsAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className={`text-center ${
        isSubCategory ? "min-h-[32px]" : "min-h-[95px]"
      } ${!isSubCategory && !isMasonry ? "flex flex-1 flex-col justify-between" : ""}`}
    >
      <div
        className={`${
          isSubCategory ? "" : "flex min-h-[34px] items-center justify-center"
        }`}
      >
        <h3
          className={`px-1 font-semibold text-[#102A43] ${
            isSubCategory
              ? "text-[0.72rem] sm:text-[0.82rem] line-clamp-2"
              : "text-[0.850rem] sm:text-[1rem] line-clamp-none sm:line-clamp-2"
          }`}
        >
          {productTitle}
        </h3>
      </div>
      {!isSubCategory && productSubtitle && (
        <p className="mt-1 text-sm text-slate-600 line-clamp-1">
          {productSubtitle}
        </p>
      )}
      {!isSubCategory && (
        <div className="mt-1 flex justify-center">
          <span className="inline-block rounded-sm border border-amber-500/70 bg-amber-200/80 px-1.5 text-[11px] font-semibold tracking-wide text-slate-700 ring-1 ring-amber-600/30">
            Peaceful {"\u2022"} Easy Care
          </span>
        </div>
      )}
      {!isSubCategory && (
        <div className="mt-1 flex min-h-[48px] w-full flex-col items-center justify-center">
          <div className="flex h-[32px] w-full items-center justify-center">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3">
              {currentPrice > 0 ? (
                <p className="text-[12px] font-medium text-slate-400 line-through">
                  {"\u20B9"}
                  {formattedOriginalPrice}
                </p>
              ) : (
                <span />
              )}
              <p className="text-[1.05rem] font-semibold text-[#1D3A8A]">
                {"\u20B9"}
                {formattedCurrentPrice}
              </p>
            </div>
          </div>
          {savingsAmount > 0 && (
            <p className="text-[11px] font-semibold text-emerald-600">
              You Save {"\u20B9"}
              {formattedSavingsAmount}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const CartControls = ({
  currentQty,
  isSoldOut,
  onAddToCart,
  onDecrease,
  onIncrease,
  showAddedHint,
  isPreviewOpen,
  productTitle,
}) => (
  <div className="relative mt-auto pt-0.5">
    {showAddedHint && !isPreviewOpen && (
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-200">
        Added 1 item
      </span>
    )}
    {currentQty === 0 ? (
      <div className="relative flex justify-center">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isSoldOut}
                  className="group inline-flex h-9 w-[135px] min-w-[135px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-0 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
            <img src={plusIcon} alt="" className="h-5 w-5" />
          </span>
          Add to cart
        </button>
      </div>
    ) : (
      <div className="flex justify-center">
        <div className="w-[160px] min-w-[160px]">
          <div className="inline-flex h-9 w-full items-center justify-between rounded-full bg-gradient-to-r from-slate-50 to-slate-100 px-2 shadow-sm">
            <button
              type="button"
              onClick={onDecrease}
              disabled={isSoldOut}
              className="h-7 w-7 rounded-full bg-white text-sm font-semibold text-[#1D3A8A] shadow disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={`Decrease quantity for ${productTitle}`}
            >
              <img src={incMinusIcon} alt="" className="h-7 w-7" />
            </button>
            <span className="text-sm font-semibold text-[#1D3A8A]">
              {currentQty}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={isSoldOut}
              className="h-7 w-7 rounded-full bg-white text-sm font-semibold text-[#1D3A8A] shadow disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={`Increase quantity for ${productTitle}`}
            >
              <img src={incPlusIcon} alt="" className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

const SubcategoryFooter = ({
  startFromPrice,
  count,
  onClick,
}) => {
  const commonProps = {
    type: "button",
    onClick: (event) => {
      event.stopPropagation();
      onClick?.();
    },
  };

  return (
    <div className="absolute inset-x-3 bottom-2 flex items-center">
      <button
        {...commonProps}
        className="relative inline-flex w-full items-center justify-between px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
      >
        <span className="relative top-0.5 flex flex-1 items-center justify-center gap-1 pl-1 text-center text-[10px] tracking-[0.1em] whitespace-nowrap sm:text-[11px] sm:tracking-[0.16em]">
          <span>Starts from</span>
          <span>
            {"\u20B9"}
            {startFromPrice !== null ? startFromPrice.toLocaleString("en-IN") : "-"}
          </span>
        </span>
        <span className="relative ml-3 inline-flex h-10 w-10 flex-none items-center justify-center pr-1">
          <img src={arrowIcon} alt="" className="h-8 w-8" aria-hidden="true" />
          {count !== null && (
            <span className="absolute -right-1 -top-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-white px-1 py-0.5 text-[10px] font-semibold tracking-normal text-blue-700 shadow ring-2 ring-blue-400">
              {count}
            </span>
          )}
        </span>
      </button>
    </div>
  );
};

const PreviewModal = ({
  isOpen,
  productTitle,
  productDescription,
  imageSrc,
  price,
  currentQty,
  isSoldOut,
  showAddedHint,
  onClose,
  onAddToCart,
  onDecrease,
  onIncrease,
}) => {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          aria-label="Close image preview"
        >
          <img src={closeIcon} alt="" className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex max-h-[calc(90vh-3rem)] flex-col gap-6 p-6 md:flex-row md:items-stretch">
          <div className="flex w-full flex-col md:w-1/2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={imageSrc}
                alt={productTitle}
                className="h-full w-full object-contain bg-white"
              />
            </div>
            <div className="mt-1 flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                {productTitle}
              </h2>
              <p className="text-lg font-semibold text-slate-900">
                {"\u20B9"}
                {Number(price ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-1 min-h-0 flex-col gap-3 md:w-1/2">
            <div className="flex-1 overflow-y-auto pr-1 md:mt-1 md:pr-0">
              {productDescription ? (
                <div className="text-sm leading-relaxed text-slate-600">
                  {renderFormattedDescription(productDescription)}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Product details will be available soon.
                </p>
              )}
            </div>
            <div className="relative mt-auto flex justify-center pt-1">
              {showAddedHint && (
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-200">
                  Added 1 item
                </span>
              )}
              {currentQty === 0 ? (
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={isSoldOut}
                  className="group inline-flex h-11 w-full max-w-[180px] min-w-[180px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-0 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                    <img src={plusIcon} alt="" className="h-6 w-6" />
                  </span>
                  Add to cart
                </button>
              ) : (
                <div className="inline-flex h-11 w-full max-w-[220px] min-w-[220px] items-center justify-between rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2 shadow-sm">
                  <button
                    type="button"
                    onClick={onDecrease}
                    disabled={isSoldOut}
                    className="h-9 w-9 rounded-full bg-white text-base font-semibold text-blue-700 shadow hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-blue-300"
                    aria-label={`Decrease quantity for ${productTitle}`}
                  >
                    <img src={incMinusIcon} alt="" className="h-9 w-9" />
                  </button>
                  <span className="px-3 text-base font-semibold text-blue-700">
                    {currentQty}
                  </span>
                  <button
                    type="button"
                    onClick={onIncrease}
                    disabled={isSoldOut}
                    className="h-9 w-9 rounded-full bg-white text-base font-semibold text-blue-700 shadow hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-blue-300"
                    aria-label={`Increase quantity for ${productTitle}`}
                  >
                    <img src={incPlusIcon} alt="" className="h-9 w-9" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const RemoveConfirmModal = ({ isOpen, productTitle, onCancel, onConfirm }) => {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Remove item?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Remove {productTitle} from your cart?
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CategoryCard = ({
  categoryName,
  product,
  isSubCategory = false,
  onAddToCart,
  showStockBadge,
  isMasonry = false,
  compact = false,
  borderless = false,
  itemDetailGoldenBorder = false,
}) => {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQty, removeItem } = useCart();
  const { toggleFavorite, isFavorite: isProductFavorite } = useFavorites();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showViewHint, setShowViewHint] = useState(false);
  const [showExpandHint, setShowExpandHint] = useState(false);
  const [showAddedHint, setShowAddedHint] = useState(false);
  const [favoriteToastMessage, setFavoriteToastMessage] = useState("");
  const [pendingRemove, setPendingRemove] = useState(false);

  const productTitle = isSubCategory
    ? product?.subcategoryName || product?.name || product?.title || "Category"
    : product?.name || product?.title || "Product";

  const productSubtitle = product?.subtitle || "";
  const productDescription =
    product?.description || product?.details || product?.summary || "";
  const startFromPrice = Number.isFinite(Number(product?.startFromPrice))
    ? Number(product?.startFromPrice)
    : null;

  const productImage = isSubCategory
    ? product?.image || product?.product_images?.[0]?.url || product?.image
    : product?.product_images?.[0]?.url || product?.image;

  const availabilityText = String(
    product?.availability || product?.status || ""
  ).toLowerCase();
  const parsedStockCount = Number.isFinite(Number(product?.stock_count))
    ? Number(product?.stock_count)
    : null;
  const isSoldOut = parsedStockCount !== null
    ? parsedStockCount <= 0
    : /out|sold/.test(availabilityText);

  const shouldShowStockBadge =
    typeof showStockBadge === "boolean" ? showStockBadge : !isSubCategory;

  const handleClick = () => {
    if (!isSubCategory) return;
    if (product?.subcategorySlug) {
      navigate(`/category/${categoryName}/${product.subcategorySlug}`);
    }
  };

  useEffect(() => {
    if (!isPreviewOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsPreviewOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isPreviewOpen]);

  // One-time hint to nudge users to view product details (subcategories only)
  useEffect(() => {
    if (!isSubCategory) return;
    if (typeof window === "undefined") return;
    const storageKey = "da-view-hint-shown";
    const alreadyShown = window.localStorage.getItem(storageKey);
    if (alreadyShown) return;

    let timer;

    const triggerHint = () => {
      setShowViewHint(true);
      timer = setTimeout(() => setShowViewHint(false), 1600);
      window.localStorage.setItem(storageKey, "1");
      window.removeEventListener("pointerdown", onFirstTap);
    };

    const onFirstTap = (event) => {
      if (event.pointerType !== "touch") return;
      triggerHint();
    };

    window.addEventListener("pointerdown", onFirstTap, { passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("pointerdown", onFirstTap);
    };
  }, [isSubCategory]);

  useEffect(() => {
    if (!showAddedHint) return;
    const timer = setTimeout(() => setShowAddedHint(false), 1600);
    return () => clearTimeout(timer);
  }, [showAddedHint]);

  useEffect(() => {
    if (!favoriteToastMessage) return;
    const timer = setTimeout(() => setFavoriteToastMessage(""), 1600);
    return () => clearTimeout(timer);
  }, [favoriteToastMessage]);

  const currentQty =
    cartItems?.find((item) => item.id === product?.id)?.qty || 0;
  const favoriteSelected = !isSubCategory && isProductFavorite(product?.id);
  const handleFavoriteToggle = () => {
    if (isSubCategory) return;
    const isAdding = !favoriteSelected;
    toggleFavorite(product);
    setFavoriteToastMessage(
      isAdding ? "Added to favourite" : "Removed from favourite"
    );
  };

  const handleAddToCart = (event) => {
    event?.stopPropagation();
    if (isSoldOut) return;
    if (currentQty > 0) return;
    runFlyToCartAnimation();
    const addHandler = onAddToCart || addToCart;
    addHandler?.(product, 1);
    setShowAddedHint(true);
  };

  const imageSrc =
    typeof productImage === "string" && productImage.startsWith("http")
      ? productImage
      : getImageWithFallback(productImage, productTitle);

  const runFlyToCartAnimation = () => {
    try {
      const img = document.querySelector(
        `img[alt="${productTitle.replace(/"/g, '\\"')}"]`
      );
      const cartTargets = Array.from(
        document.querySelectorAll('[data-cart-target="cart"]')
      );
      const cartTarget = cartTargets.find((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (!img || !cartTarget) return;

      const imgRect = img.getBoundingClientRect();
      const cartRect = cartTarget.getBoundingClientRect();

      const flyer = document.createElement("img");
      flyer.src = imageSrc;
      flyer.alt = "";
      flyer.setAttribute("aria-hidden", "true");
      flyer.style.position = "fixed";
      flyer.style.left = `${imgRect.left}px`;
      flyer.style.top = `${imgRect.top}px`;
      flyer.style.width = `${imgRect.width}px`;
      flyer.style.height = `${imgRect.height}px`;
      flyer.style.borderRadius = "12px";
      flyer.style.zIndex = "9999";
      flyer.style.transition =
        "transform 0.6s ease-in-out, opacity 0.6s ease-in-out";
      flyer.style.transformOrigin = "center";
      document.body.appendChild(flyer);

      const targetX = cartRect.left + cartRect.width / 2 - imgRect.left - imgRect.width / 2;
      const targetY = cartRect.top + cartRect.height / 2 - imgRect.top - imgRect.height / 2;

      requestAnimationFrame(() => {
        flyer.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.1)`;
        flyer.style.opacity = "0.2";
      });

      const badge = document.createElement("div");
      badge.style.position = "fixed";
      badge.style.left = `${cartRect.left + cartRect.width / 2 - 6}px`;
      badge.style.top = `${cartRect.top - 4}px`;
      badge.style.width = "12px";
      badge.style.height = "12px";
      badge.style.borderRadius = "9999px";
      badge.style.background = "#2563eb";
      badge.style.zIndex = "10000";
      badge.style.transform = "scale(0)";
      badge.style.transition = "transform 0.25s ease-out, opacity 0.25s ease-out";
      document.body.appendChild(badge);

      setTimeout(() => {
        badge.style.transform = "scale(1)";
      }, 450);

      setTimeout(() => {
        flyer.remove();
        badge.style.opacity = "0";
        setTimeout(() => badge.remove(), 200);
      }, 700);
    } catch (error) {
      console.error("fly-to-cart failed", error);
    }
  };

  // One-time hint for product image expand (products only)
  useEffect(() => {
    if (isSubCategory) return;
    if (typeof window === "undefined") return;
    const storageKey = "da-expand-hint-shown";
    const alreadyShown = window.localStorage.getItem(storageKey);
    if (alreadyShown) return;
    setShowExpandHint(true);
    const timer = setTimeout(() => setShowExpandHint(false), 1600);
    window.localStorage.setItem(storageKey, "1");
    return () => clearTimeout(timer);
  }, [isSubCategory]);

  return (
    <article
      className={`group relative overflow-visible rounded-2xl bg-white shadow-sm transition-shadow duration-300 ${
        isSubCategory
          ? "cursor-pointer pb-6 sm:pb-8 bg-gradient-to-b from-[#FFF9E6] via-[#FFF4CD] to-[#FFFDF3] shadow-[0_8px_18px_rgba(146,117,34,0.12)] hover:shadow-[0_10px_22px_rgba(146,117,34,0.16)]"
          : "flex h-full flex-col bg-gradient-to-b from-[#FFF8DC] via-[#FFF3C4] to-[#FFFDF2] shadow-[0_8px_18px_rgba(146,117,34,0.12)] hover:shadow-[0_10px_22px_rgba(146,117,34,0.16)]"
      } ${
        itemDetailGoldenBorder && !isSubCategory
          ? "border-[0.5px] border-amber-300/90"
          : borderless
            ? "border-0"
            : "border border-slate-300"
      } ${compact ? "h-full" : ""}`}
      tabIndex={isSubCategory ? "0" : undefined}
      role={isSubCategory ? "button" : "group"}
      aria-label={
        isSubCategory ? `View ${productTitle} subcategory` : productTitle
      }
      onClick={handleClick}
    >
      <ProductImageArea
        isSubCategory={isSubCategory}
        compact={compact}
        imageSrc={imageSrc}
        productTitle={productTitle}
        productSubtitle={productSubtitle}
        showViewHint={showViewHint}
        showExpandHint={showExpandHint}
        isFavorite={favoriteSelected}
        onToggleFavorite={handleFavoriteToggle}
        onImageClick={(event) => {
          if (isSubCategory) return;
          event.stopPropagation();
          setIsPreviewOpen(true);
        }}
      />

      <div
        className={`${compact ? "px-2 pb-2 pt-1.5" : "px-2 pb-2 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2"} ${
          isSubCategory
            ? "flex flex-col gap-2 pb-8 sm:gap-3 sm:pb-9"
            : isMasonry
              ? "flex flex-1 flex-col gap-1 sm:gap-1.5"
              : compact
                ? "flex min-h-[111px] flex-1 flex-col gap-1 sm:gap-1.5"
                : "flex min-h-[137px] flex-1 flex-col gap-1 sm:min-h-[159px] sm:gap-1.5"
        }`}
      >
        {!isSubCategory && (
          <ProductInfo
            isSubCategory={isSubCategory}
            isMasonry={isMasonry}
            productTitle={productTitle}
            productSubtitle={productSubtitle}
            price={product?.price}
          />
        )}

        {!isSubCategory && (
          <StockStatusRow isSoldOut={isSoldOut} />
        )}

        {!isSubCategory && (
          <CartControls
            currentQty={currentQty}
            isSoldOut={isSoldOut}
            onAddToCart={handleAddToCart}
            onDecrease={(event) => {
              event.stopPropagation();
              if (currentQty <= 1) {
                setPendingRemove(true);
                return;
              }
              updateQty?.(product?.id, currentQty - 1);
            }}
            onIncrease={(event) => {
              event.stopPropagation();
              updateQty?.(product?.id, currentQty + 1);
            }}
            showAddedHint={showAddedHint}
            isPreviewOpen={isPreviewOpen}
            productTitle={productTitle}
          />
        )}
      </div>

      {isSubCategory && (
        <SubcategoryFooter
          startFromPrice={startFromPrice}
          count={Number.isFinite(product?.itemCount) ? product.itemCount : null}
          onClick={handleClick}
        />
      )}

      <PreviewModal
        isOpen={isPreviewOpen}
        productTitle={productTitle}
        productDescription={productDescription}
        imageSrc={imageSrc}
        price={product?.price}
        currentQty={currentQty}
        isSoldOut={isSoldOut}
        showAddedHint={showAddedHint}
        onClose={() => setIsPreviewOpen(false)}
        onAddToCart={handleAddToCart}
        onDecrease={(event) => {
          event.stopPropagation();
          if (currentQty <= 1) {
            setPendingRemove(true);
            return;
          }
          updateQty?.(product?.id, currentQty - 1);
        }}
        onIncrease={(event) => {
          event.stopPropagation();
          updateQty?.(product?.id, currentQty + 1);
        }}
      />

      <RemoveConfirmModal
        isOpen={pendingRemove}
        productTitle={productTitle}
        onCancel={() => setPendingRemove(false)}
        onConfirm={() => {
          removeItem?.(product?.id);
          setPendingRemove(false);
        }}
      />

      {favoriteToastMessage && !isSubCategory && (
        <div className="pointer-events-none absolute inset-x-3 bottom-12 z-30 flex justify-center">
          <span className="whitespace-nowrap rounded-md bg-rose-400 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-white shadow-md shadow-rose-100 sm:px-2.5 sm:text-[10px] sm:tracking-wide">
            {favoriteToastMessage}
          </span>
        </div>
      )}
    </article>
  );
};

export default CategoryCard;

