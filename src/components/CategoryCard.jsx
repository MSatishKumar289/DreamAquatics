import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getImageWithFallback } from "../assets";
import plusIcon from "../assets/Icons/plus.png";
import incPlusIcon from "../assets/Icons/iplus.png";
import incMinusIcon from "../assets/Icons/iminus.png";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { getProductPricing } from "../lib/pricing";

const resolveCatalogImage = (src, fallbackLabel) => {
  if (typeof src !== "string" || !src.trim()) {
    return getImageWithFallback("", fallbackLabel);
  }

  if (
    /^(https?:)?\/\//.test(src) ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("/")
  ) {
    return src;
  }

  return getImageWithFallback(src, fallbackLabel);
};

const ProductImageArea = ({
  isSubCategory,
  compact,
  whiteCard,
  savingsBadgeAmount,
  imageSrc,
  imageGallery = [],
  productTitle,
  productSubtitle,
  showViewHint,
  isFavorite,
  onToggleFavorite,
  onImageClick,
}) => {
  if (isSubCategory) {
    const visualImages = (imageGallery.length ? imageGallery : [imageSrc]).slice(0, 3);
    const primaryImage = visualImages[0] || imageSrc;
    const secondaryImages = visualImages.slice(1, 3);
    const hasSecondaryImages = secondaryImages.length > 0;

    return (
      <div className="relative flex h-full w-full flex-col items-center">
        <span
          className={`pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white opacity-0 shadow-lg transition group-hover:opacity-100 sm:hidden ${
            showViewHint ? "opacity-100" : ""
          }`}
        >
          Tap to view
        </span>

        <div className="relative mx-auto aspect-[1/1.24] w-full overflow-hidden rounded-[12px] border border-[#f3d35a] bg-[#d7e6f1] shadow-[0_10px_22px_rgba(66,110,145,0.18),0_0_0_1px_rgba(255,225,92,0.45)] sm:aspect-[1/1.05]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.08))]" />
          <div
            className={`absolute top-[8%] bottom-[24%] ${
              hasSecondaryImages ? "inset-x-[6%]" : "inset-x-[3%]"
            }`}
          >
            {secondaryImages[0] && (
              <div className="absolute bottom-[7%] left-[5%] z-20 h-[76%] w-[34%] origin-bottom-left -rotate-[18deg] overflow-hidden rounded-[12px] bg-white shadow-[0_14px_24px_rgba(15,23,42,0.24)] ring-1 ring-black/6 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <img
                  src={secondaryImages[0]}
                  alt=""
                  className="h-full w-full object-cover"
                  aria-hidden="true"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Crect fill='%23dbe4ea' width='260' height='260'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}

            {secondaryImages[1] && (
              <div className="absolute bottom-[7%] right-[5%] z-20 h-[76%] w-[34%] origin-bottom-right rotate-[18deg] overflow-hidden rounded-[12px] bg-white shadow-[0_14px_24px_rgba(15,23,42,0.24)] ring-1 ring-black/6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                <img
                  src={secondaryImages[1]}
                  alt=""
                  className="h-full w-full object-cover"
                  aria-hidden="true"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Crect fill='%23dbe4ea' width='260' height='260'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}

            <div
              className={`absolute top-[1%] bottom-0 z-30 overflow-hidden rounded-[12px] bg-white shadow-[0_18px_30px_rgba(15,23,42,0.30)] ring-1 ring-black/6 transition-transform duration-300 group-hover:-translate-y-1.5 ${
                hasSecondaryImages ? "inset-x-[5%] sm:inset-x-[10%]" : "inset-x-0"
              }`}
            >
              <img
                src={primaryImage}
                alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='420'%3E%3Crect fill='%23dbe4ea' width='400' height='420'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E" +
                    encodeURIComponent(productTitle) +
                    "%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] rounded-b-[12px] bg-[linear-gradient(180deg,rgba(232,241,248,0.96),rgba(214,230,241,0.98))] ring-1 ring-white/30" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-[22%] items-center justify-center px-2.5 pb-2 pt-2">
            <p className="line-clamp-2 text-center text-[0.84rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[#111111] sm:text-[1rem]">
              {productTitle}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-t-[6px] ${
        whiteCard
          ? "bg-white"
          : "bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden border-b border-slate-200/60 rounded-t-[6px] ${
          compact ? "aspect-[1/1]" : "aspect-[4/3.1] sm:aspect-[4/3.2]"
        }`}
      >
        <img
          src={imageSrc}
          alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            whiteCard
              ? "bg-white"
              : "bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]"
          }`}
          onClick={onImageClick}
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E" +
              encodeURIComponent(productTitle) +
              "%3C/text%3E%3C/svg%3E";
          }}
        />
        <>
          {savingsBadgeAmount > 0 && (
            <span className="pointer-events-none absolute right-0 top-0 z-20 inline-flex items-center rounded-bl-md bg-emerald-600 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm">
              Save {"\u20B9"}
              {savingsBadgeAmount.toLocaleString("en-IN")}
            </span>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite?.();
            }}
            className={`absolute bottom-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border shadow transition ${
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
        </>
      </div>
    </div>
  );
};

const ProductInfo = ({
  isSubCategory,
  isMasonry,
  compact,
  productTitle,
  productBadgeText,
  price,
  originalPrice,
  savingsAmount,
}) => {
  const currentPrice = Number(price ?? 0);
  const formattedCurrentPrice = currentPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedOriginalPrice = originalPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <div
      className={`${isSubCategory ? "text-left" : "text-center"} ${
        isSubCategory ? "min-h-[32px]" : "min-h-[44px]"
      } ${!isSubCategory && !isMasonry ? "flex flex-1 flex-col justify-between" : ""}`}
    >
      <div
        className={`${
          isSubCategory ? "" : "flex min-h-[28px] items-center justify-center"
        }`}
      >
        <h3
          className={`px-1 font-semibold text-[#102A43] ${
            isSubCategory
              ? "text-[0.72rem] sm:text-[0.82rem] line-clamp-2"
              : compact
                ? "text-[0.72rem] leading-tight line-clamp-2"
                : "text-[0.82rem] sm:text-[0.92rem] leading-tight line-clamp-2"
          }`}
        >
          {productTitle}
        </h3>
      </div>
      {!isSubCategory && productBadgeText && (
        <div className="mt-1 flex justify-center">
          <span className="inline-flex max-w-[88%] -skew-x-[10deg] items-center rounded-[4px] bg-[#FFE100] px-3 py-0.5 text-[#0D2F5A] shadow-sm">
            <span
              className="truncate skew-x-[10deg] text-[10px] font-semibold tracking-[0.05em]"
              style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
            >
              {productBadgeText}
            </span>
          </span>
        </div>
      )}
      {!isSubCategory && (
        <div className={`${productBadgeText ? "mt-[7px]" : "mt-0.5"} flex min-h-[24px] w-full flex-col items-center justify-center`}>
          <div className="flex h-[20px] w-full items-center justify-center">
            <div className="inline-flex items-center justify-center gap-2 sm:gap-3">
              {currentPrice > 0 ? (
                <p className="text-[12px] font-medium text-slate-400 line-through">
                  {"\u20B9"}
                  {formattedOriginalPrice}
                </p>
              ) : (
                <span />
              )}
              <p className={`${compact ? "text-[0.95rem]" : "text-[1.05rem]"} font-semibold text-[#1D3A8A]`}>
                {"\u20B9"}
                {formattedCurrentPrice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CartControls = ({
  currentQty,
  isSoldOut,
  compact,
  onAddToCart,
  onDecrease,
  onIncrease,
  showAddedHint,
  productTitle,
}) => (
  <div className="relative mt-auto pt-0.5">
    {showAddedHint && (
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-200">
        Added 1 item
      </span>
    )}
    <div className="flex items-center gap-2">
      {isSoldOut ? (
        <button
          type="button"
          disabled
          className={`inline-flex ${compact ? "h-8 text-[9px]" : "h-9 text-[10px]"} w-full min-w-0 items-center justify-center rounded-[5px] bg-slate-200 px-3 py-0 font-semibold uppercase tracking-wide text-slate-600 shadow-sm`}
        >
          Back Soon !
        </button>
      ) : currentQty === 0 ? (
        <button
          type="button"
          onClick={onAddToCart}
          className={`da-add-cart-btn group ${compact ? "h-9 gap-1 whitespace-nowrap text-[8px] tracking-[0.03em]" : "h-9 text-[10px]"} w-full min-w-0 px-3 py-0`}
        >
          <span className={`grid shrink-0 ${compact ? "h-4 w-4" : "h-5 w-5"} aspect-square place-items-center rounded-full bg-white/20`}>
            <img src={plusIcon} alt="" className={`${compact ? "h-4 w-4" : "h-5 w-5"} object-contain`} />
          </span>
          Add to cart
        </button>
      ) : (
        <div className="w-full min-w-0">
          <div
            className={`inline-flex ${compact ? "h-8" : "h-9"} w-full items-center justify-between rounded-full bg-gradient-to-r from-slate-50 to-slate-100 px-2 shadow-sm`}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onDecrease}
              disabled={isSoldOut}
              className={`${compact ? "h-6 w-6" : "h-7 w-7"} rounded-full bg-white text-sm font-semibold text-[#1D3A8A] shadow disabled:cursor-not-allowed disabled:text-slate-300`}
              aria-label={`Decrease quantity for ${productTitle}`}
            >
              <img src={incMinusIcon} alt="" className={`${compact ? "h-6 w-6" : "h-7 w-7"}`} />
            </button>
            <span className={`${compact ? "text-[12px]" : "text-sm"} font-semibold text-[#1D3A8A]`}>
              {currentQty}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={isSoldOut}
              className={`${compact ? "h-6 w-6" : "h-7 w-7"} rounded-full bg-white text-sm font-semibold text-[#1D3A8A] shadow disabled:cursor-not-allowed disabled:text-slate-300`}
              aria-label={`Increase quantity for ${productTitle}`}
            >
              <img src={incPlusIcon} alt="" className={`${compact ? "h-6 w-6" : "h-7 w-7"}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

const RemoveConfirmModal = ({ isOpen, productTitle, onCancel, onConfirm }) => {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onCancel?.();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Remove item?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Remove {productTitle} from your cart?
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCancel?.();
            }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onConfirm?.();
            }}
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
  relatedProducts = [],
  isSubCategory = false,
  onAddToCart,
  isMasonry = false,
  compact = false,
  borderless = false,
  itemDetailGoldenBorder = false,
  whiteCard = false,
  className = "",
}) => {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQty, removeItem } = useCart();
  const { toggleFavorite, isFavorite: isProductFavorite } = useFavorites();
  const [showViewHint, setShowViewHint] = useState(false);
  const [showAddedHint, setShowAddedHint] = useState(false);
  const [favoriteToastMessage, setFavoriteToastMessage] = useState("");
  const [favoriteToastType, setFavoriteToastType] = useState("success");
  const [pendingRemove, setPendingRemove] = useState(false);

  const productTitle = isSubCategory
    ? product?.subcategoryName || product?.name || product?.title || "Category"
    : product?.name || product?.title || "Product";

  const productSubtitle = product?.subtitle || "";
  const productImage = isSubCategory
    ? product?.image || product?.product_images?.[0]?.url || product?.image
    : product?.product_images?.[0]?.url || product?.image;
  const subcategoryImageGallery = Array.isArray(product?.imageGallery) ? product.imageGallery : [];
  const productBadgeTextRaw = product?.badge_label || "";
  const productBadgeTextValue = typeof productBadgeTextRaw === "string"
    ? productBadgeTextRaw.trim()
    : "";
  const productBadgeText = productBadgeTextValue.toUpperCase();

  const availabilityText = String(
    product?.availability || product?.status || ""
  ).toLowerCase();
  const { nonDiscountPrice, savingsAmount } = getProductPricing(product);
  const savingsBadgeAmount = Math.max(0, Math.round(savingsAmount));
  const parsedStockCount = Number.isFinite(Number(product?.stock_count))
    ? Number(product?.stock_count)
    : null;
  const isSoldOut = parsedStockCount !== null
    ? parsedStockCount <= 0
    : /out|sold/.test(availabilityText);

  const handleClick = () => {
    if (isSubCategory) {
      if (product?.subcategorySlug) {
        navigate(`/category/${categoryName}/${product.subcategorySlug}`);
      }
      return;
    }
    if (product?.id) {
      navigate(`/product/${product.id}`, { state: { product, relatedProducts } });
    }
  };

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
  const handleFavoriteToggle = async () => {
    if (isSubCategory) return;
    const isAdding = !favoriteSelected;
    const { error } = await toggleFavorite(product);
    if (error) {
      setFavoriteToastType("error");
      setFavoriteToastMessage("Some error occurred, try again later");
      return;
    }
    setFavoriteToastType("success");
    setFavoriteToastMessage(isAdding ? "Added to favourite" : "Removed from favourite");
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

  const imageSrc = resolveCatalogImage(productImage, productTitle);
  const subcategoryVisualImages = isSubCategory
    ? [productImage, ...subcategoryImageGallery]
        .filter((src) => typeof src === "string" && src.trim())
        .filter((src, index, list) => list.indexOf(src) === index)
        .map((src) => resolveCatalogImage(src, productTitle))
        .slice(0, 3)
    : [];

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

  return (
    <article
      className={`group relative ${
        isSubCategory
          ? "flex h-full cursor-pointer flex-col justify-start overflow-visible rounded-[28px] bg-transparent pt-0.5 shadow-none transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/80"
          : `rounded-[6px] bg-white shadow-sm transition-shadow duration-300 overflow-visible ${
              whiteCard
                ? "flex h-full flex-col bg-white shadow-[0_8px_18px_rgba(15,23,42,0.10)] hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)]"
                : "flex h-full flex-col bg-gradient-to-b from-[#FFF8DC] via-[#FFF3C4] to-[#FFFDF2] shadow-[0_8px_18px_rgba(146,117,34,0.12)] hover:shadow-[0_10px_22px_rgba(146,117,34,0.16)]"
            } ${
              itemDetailGoldenBorder
                ? "border-[0.5px] border-amber-300/90"
                : borderless
                  ? "border-0"
                  : "border border-slate-300"
            }`
      } ${compact ? "h-full" : ""} ${className}`}
      tabIndex="0"
      role="button"
      aria-label={
        isSubCategory ? `View ${productTitle} subcategory` : productTitle
      }
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <ProductImageArea
        isSubCategory={isSubCategory}
        compact={compact}
        whiteCard={whiteCard}
        savingsBadgeAmount={savingsBadgeAmount}
        imageSrc={imageSrc}
        imageGallery={subcategoryVisualImages}
        productTitle={productTitle}
        productSubtitle={productSubtitle}
        showViewHint={showViewHint}
        isFavorite={favoriteSelected}
        onToggleFavorite={handleFavoriteToggle}
        onImageClick={(event) => {
          if (isSubCategory) return;
          event.stopPropagation();
          navigate(`/product/${product?.id}`, { state: { product, relatedProducts } });
        }}
      />

      <div
        className={`${compact ? "px-2 pb-2 pt-1.5" : "px-2 pb-2 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2"} ${
          isSubCategory
            ? "hidden"
            : isMasonry
              ? "flex flex-1 flex-col gap-1 sm:gap-1.5"
              : compact
                ? "flex min-h-[78px] flex-1 flex-col gap-0.5 sm:gap-1"
                : "flex min-h-[74px] flex-1 flex-col gap-0.5 sm:min-h-[84px] sm:gap-1"
        }`}
      >
        {!isSubCategory && (
          <ProductInfo
            isSubCategory={isSubCategory}
            isMasonry={isMasonry}
            compact={compact}
            productTitle={productTitle}
            productBadgeText={productBadgeText}
            price={product?.price}
            originalPrice={nonDiscountPrice}
            savingsAmount={savingsAmount}
          />
        )}

        {!isSubCategory && (
          <CartControls
            currentQty={currentQty}
            isSoldOut={isSoldOut}
            compact={compact}
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
            productTitle={productTitle}
          />
        )}
      </div>

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
          <span
            className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-white shadow-md sm:px-2.5 sm:text-[10px] sm:tracking-wide ${
              favoriteToastType === "error"
                ? "bg-rose-600 shadow-rose-200"
                : "bg-emerald-600 shadow-emerald-200"
            }`}
          >
            {favoriteToastMessage}
          </span>
        </div>
      )}
    </article>
  );
};

export default CategoryCard;

