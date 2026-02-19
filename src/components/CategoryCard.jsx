import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getImageWithFallback } from "../assets";
import plusIcon from "../assets/Icons/plus.png";
import incPlusIcon from "../assets/Icons/iplus.png";
import incMinusIcon from "../assets/Icons/iminus.png";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const ProductImageArea = ({
  isSubCategory,
  compact,
  whiteCard,
  savingsBadgeAmount,
  imageSrc,
  productTitle,
  productSubtitle,
  showViewHint,
  isFavorite,
  onToggleFavorite,
  onImageClick,
}) => (
      <div
        className={`relative w-full overflow-hidden ${
          isSubCategory ? "h-full rounded-[6px]" : "rounded-t-[6px]"
        } ${
          whiteCard
            ? "bg-white"
            : isSubCategory
              ? "bg-white"
              : "bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]"
        }`}
      >
        <div
          className={`relative w-full overflow-hidden ${
            isSubCategory ? "h-full rounded-[6px]" : "border-b border-slate-200/60 rounded-t-[6px]"
          } ${
            isSubCategory ? "" : compact ? "aspect-[1/1]" : "aspect-[4/3.1] sm:aspect-[4/3.2]"
          }`}
        >
      {isSubCategory ? (
        <>
          <span
            className={`pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 sm:hidden ${
              showViewHint ? "opacity-100" : ""
            }`}
          >
            Tap to view
          </span>
          <div className="h-full w-full">
            <img
              src={imageSrc}
              alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
              className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
                isSubCategory
                  ? "bg-white"
                  : whiteCard
                  ? "bg-white"
                  : "bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]"
              } ${isSubCategory ? "brightness-[0.93] group-hover:brightness-100" : ""}`}
              onClick={onImageClick}
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E" +
                  encodeURIComponent(productTitle) +
                  "%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
            <div className="w-full bg-black/45 px-2 pb-[3px] pt-[2px] backdrop-blur-[1.5px]">
              <p
                className="mx-auto line-clamp-2 max-w-[92%] text-center text-[0.68rem] font-semibold uppercase leading-[1.12] tracking-[0.01em] text-white sm:text-[0.8rem]"
                style={{
                  fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif",
                  textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 0 1px rgba(0,0,0,0.9)",
                }}
              >
                {productTitle}
              </p>
            </div>
          </div>
        </>
      ) : (
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
      )}
      {!isSubCategory && (
        <>
          {savingsBadgeAmount > 0 && (
            <span className="pointer-events-none absolute left-2 top-2 z-20 inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm">
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
      )}
    </div>
  </div>
);

const ProductInfo = ({
  isSubCategory,
  isMasonry,
  productTitle,
  productBadgeText,
  price,
  originalPrice,
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
      className={`text-left ${
        isSubCategory ? "min-h-[32px]" : "min-h-[44px]"
      } ${!isSubCategory && !isMasonry ? "flex flex-1 flex-col justify-between" : ""}`}
    >
      <div
        className={`${
          isSubCategory ? "" : "flex min-h-[28px] items-center justify-start"
        }`}
      >
        <h3
          className={`px-1 font-semibold text-[#102A43] ${
            isSubCategory
              ? "text-[0.72rem] sm:text-[0.82rem] line-clamp-2"
              : "text-[0.82rem] sm:text-[0.92rem] leading-tight line-clamp-2"
          }`}
        >
          {productTitle}
        </h3>
      </div>
      {!isSubCategory && productBadgeText && (
        <div className="mt-1 flex justify-start">
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
        <div className={`${productBadgeText ? "mt-[7px]" : "mt-0.5"} flex min-h-[24px] w-full flex-col items-start justify-center`}>
          <div className="flex h-[20px] w-full items-center justify-start">
            <div className="inline-flex items-center justify-start gap-2 sm:gap-3">
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
          className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-[5px] bg-slate-200 px-3 py-0 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm"
        >
          Out of stock
        </button>
      ) : currentQty === 0 ? (
        <button
          type="button"
          onClick={onAddToCart}
          className="da-add-cart-btn group h-9 w-full min-w-0 px-3 py-0 text-[10px]"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
            <img src={plusIcon} alt="" className="h-5 w-5" />
          </span>
          Add to cart
        </button>
      ) : (
        <div className="w-full min-w-0">
          <div
            className="inline-flex h-9 w-full items-center justify-between rounded-full bg-gradient-to-r from-slate-50 to-slate-100 px-2 shadow-sm"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
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
  const [pendingRemove, setPendingRemove] = useState(false);

  const productTitle = isSubCategory
    ? product?.subcategoryName || product?.name || product?.title || "Category"
    : product?.name || product?.title || "Product";

  const productSubtitle = product?.subtitle || "";
  const productImage = isSubCategory
    ? product?.image || product?.product_images?.[0]?.url || product?.image
    : product?.product_images?.[0]?.url || product?.image;
  const productBadgeTextRaw =
    product?.badge || product?.label || product?.tag || product?.badgeText || "";
  const productBadgeTextValue = typeof productBadgeTextRaw === "string"
    ? productBadgeTextRaw.trim()
    : "";
  const productBadgeText = !isSubCategory
    ? productBadgeTextValue || "Top Pick"
    : productBadgeTextValue;

  const availabilityText = String(
    product?.availability || product?.status || ""
  ).toLowerCase();
  const currentPrice = Number(product?.price ?? 0);
  const derivedOriginalPrice = Number(
    product?.original_price ?? product?.mrp ?? Math.round(currentPrice * 1.15)
  );
  const priceForDisplay = Number.isFinite(derivedOriginalPrice) && derivedOriginalPrice > 0
    ? derivedOriginalPrice
    : Math.round(currentPrice * 1.15);
  const savingsBadgeAmount = Math.max(0, Math.round(priceForDisplay - currentPrice));
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

  return (
    <article
      className={`group relative rounded-[6px] bg-white shadow-sm transition-shadow duration-300 ${
        isSubCategory ? "overflow-hidden" : "overflow-visible"
      } ${
        whiteCard
          ? isSubCategory
            ? "cursor-pointer aspect-[25/27] bg-white opacity-95 scale-[0.985] shadow-[0_8px_18px_rgba(15,23,42,0.10)] hover:opacity-100 hover:scale-100 hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(15,23,42,0.18)]"
            : "flex h-full flex-col bg-white shadow-[0_8px_18px_rgba(15,23,42,0.10)] hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)]"
          : isSubCategory
            ? "cursor-pointer aspect-[25/27] bg-white opacity-95 scale-[0.985] shadow-[0_8px_18px_rgba(146,117,34,0.12)] hover:opacity-100 hover:scale-100 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(146,117,34,0.20)]"
            : "flex h-full flex-col bg-gradient-to-b from-[#FFF8DC] via-[#FFF3C4] to-[#FFFDF2] shadow-[0_8px_18px_rgba(146,117,34,0.12)] hover:shadow-[0_10px_22px_rgba(146,117,34,0.16)]"
      } ${
        itemDetailGoldenBorder && !isSubCategory
          ? "border-[0.5px] border-amber-300/90"
          : borderless
            ? "border-0"
            : "border border-slate-300"
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
            productTitle={productTitle}
            productBadgeText={productBadgeText}
            price={product?.price}
            originalPrice={priceForDisplay}
          />
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
          <span className="whitespace-nowrap rounded-md bg-rose-400 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-white shadow-md shadow-rose-100 sm:px-2.5 sm:text-[10px] sm:tracking-wide">
            {favoriteToastMessage}
          </span>
        </div>
      )}
    </article>
  );
};

export default CategoryCard;

