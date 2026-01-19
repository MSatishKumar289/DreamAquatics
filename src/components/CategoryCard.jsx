import { useEffect, useState } from "react";
import { getImageWithFallback } from "../assets";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({
  categoryName,
  product,
  isSubCategory = false,
  onAddToCart,
  showStockBadge
}) => {
  const navigate = useNavigate();
  const [qty, setQty] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showQtyHint, setShowQtyHint] = useState(false);
  const [showViewHint, setShowViewHint] = useState(false);
  const [showExpandHint, setShowExpandHint] = useState(false);

  const productTitle = isSubCategory
    ? product?.subcategoryName || product?.name || product?.title || "Category"
    : product?.name || product?.title || "Product";

  const productSubtitle = product?.subtitle || "";
  const productDescription =
    product?.description || product?.details || product?.summary || "";

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

  useEffect(() => {
    if (!showQtyHint) return;
    const timer = setTimeout(() => setShowQtyHint(false), 2000);
    return () => clearTimeout(timer);
  }, [showQtyHint]);

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

  const handleAddToCart = (event) => {
    event?.stopPropagation();
    if (isSoldOut) return;
    if (qty < 1) return;
    runFlyToCartAnimation();
    if (onAddToCart) {
      onAddToCart(product, qty);
      setQty(0);
    }
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
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 ${
        isSubCategory ? "cursor-pointer pb-6 sm:pb-8 hover:shadow-lg" : "hover:shadow-md"
      } ${!isSubCategory && isSoldOut ? "cursor-not-allowed opacity-60 grayscale" : ""}`}
      tabIndex={isSubCategory ? "0" : undefined}
      role={isSubCategory ? "button" : "group"}
      aria-label={
        isSubCategory ? `View ${productTitle} subcategory` : productTitle
      }
      onClick={handleClick}
    >
      {!isSubCategory && shouldShowStockBadge && (
        <div className="absolute left-0 top-0 z-10">
          <div
            className={`h-8 w-8 ${
              isSoldOut ? "bg-red-600" : "bg-emerald-600"
            }`}
            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
            aria-hidden="true"
          />
          <div
            className={`absolute left-0 top-0 whitespace-nowrap rounded-br-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm ${
              isSoldOut ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {isSoldOut ? "Out Of Stock" : "In Stock"}
          </div>
        </div>
      )}
      <div className="relative w-full overflow-hidden rounded-b-none bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="relative aspect-[5/4] sm:aspect-[4/3] w-full border-b border-slate-200/60">
          {isSubCategory && (
            <>
              <span
                className="pointer-events-none absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <span
                className={`pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 sm:hidden ${
                  showViewHint ? "opacity-100" : ""
                }`}
              >
                Tap to view
              </span>
            </>
          )}
          <img
            src={imageSrc}
            alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
            className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${
              isSubCategory ? "object-cover" : "object-contain bg-white"
            }`}
            onClick={(event) => {
              if (isSubCategory) return;
              if (isSoldOut) return;
              event.stopPropagation();
              setIsPreviewOpen(true);
            }}
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E" +
                encodeURIComponent(productTitle) +
                "%3C/text%3E%3C/svg%3E";
            }}
          />
          {!isSubCategory && (
            <>
              <div className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
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

      <div className={`p-3 sm:p-4 ${isSubCategory ? "flex flex-col gap-2 sm:gap-3" : "flex min-h-[180px] flex-col gap-3 sm:min-h-[200px]"}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-3">
            {productTitle}
          </h3>
          {!isSubCategory && productSubtitle && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">
              {productSubtitle}
            </p>
          )}
          {!isSubCategory && (
            <div className="mt-3 flex items-center justify-center">
              <p className="text-lg font-semibold text-slate-900">
                {"\u20B9"}
                {Number(product?.price ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          )}
          {/* Label strip for subcategory cards */}
        </div>

        {!isSubCategory && (
          <>
            <div className="relative mt-auto flex items-center gap-2">
              <div className="flex-1">
                <div className="inline-flex w-full items-center justify-between overflow-hidden rounded-full border border-blue-100 bg-blue-50">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setQty((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={isSoldOut}
                  className="px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-blue-300"
                  aria-label={`Decrease quantity for ${productTitle}`}
                >
                  -
                </button>
                <span className="px-3 text-sm font-semibold text-blue-700">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setQty((prev) => prev + 1);
                  }}
                  disabled={isSoldOut}
                  className={`px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-blue-300 ${
                    qty === 0 && !isSoldOut ? "plus-bounce" : ""
                  }`}
                  aria-label={`Increase quantity for ${productTitle}`}
                >
                  +
                </button>
                </div>
              </div>

              <div
                className="flex-1"
                onPointerDown={() => {
                  if (qty === 0 && !isSoldOut) {
                    setShowQtyHint(true);
                  }
                }}
                onMouseLeave={() => setShowQtyHint(false)}
              >
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isSoldOut || qty < 1}
                  className="w-full whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300 sm:text-[11px]"
                >
                  Add to cart
                </button>
              </div>
              {qty === 0 && !isSoldOut && (
                <span
                  className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-blue-200 transition-opacity ${
                    showQtyHint ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Increase quantity first.
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {isSubCategory && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleClick();
          }}
          className="absolute inset-x-0 bottom-0 rounded-none bg-blue-600 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 sm:px-4 sm:py-2.5"
        >
          View Product
        </button>
      )}

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsPreviewOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
              aria-label="Close image preview"
            >
              X
            </button>
            <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
              <div className="w-full md:w-1/2">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img
                    src={imageSrc}
                    alt={productTitle}
                    className="h-full w-full object-contain bg-white"
                  />
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 pr-12 md:w-1/2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {productTitle}
                </h2>
                <p className="text-lg font-semibold text-slate-900">
                  {"\u20B9"}
                  {Number(product?.price ?? 0).toLocaleString("en-IN")}
                </p>
                {productDescription ? (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {productDescription}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Product details will be available soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default CategoryCard;
