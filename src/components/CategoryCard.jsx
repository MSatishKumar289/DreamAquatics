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
  const [qty, setQty] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const productTitle = isSubCategory
    ? product?.subcategoryName || product?.name || product?.title || "Category"
    : product?.name || product?.title || "Product";

  const productSubtitle = product?.subtitle || "";

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

  const handleAddToCart = (event) => {
    event?.stopPropagation();
    if (isSoldOut) return;
    runFlyToCartAnimation();
    if (onAddToCart) {
      onAddToCart(product, qty);
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

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 ${
        isSubCategory ? "cursor-pointer hover:shadow-lg" : "hover:shadow-md"
      } ${!isSubCategory && isSoldOut ? "cursor-not-allowed opacity-60 grayscale" : ""}`}
      tabIndex={isSubCategory ? "0" : undefined}
      role={isSubCategory ? "button" : "group"}
      aria-label={
        isSubCategory ? `View ${productTitle} subcategory` : productTitle
      }
      onClick={handleClick}
    >
      <div className="relative w-full overflow-hidden rounded-b-none bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {shouldShowStockBadge && !isSoldOut && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
              <svg
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 10l3 3 7-7" />
              </svg>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              In Stock
            </span>
          </div>
        )}
        {shouldShowStockBadge && isSoldOut && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-red-200 bg-white/90 px-2.5 py-1 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
              x
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-red-700">
              Out of Stock
            </span>
          </div>
        )}
        <div className="relative aspect-[4/3] w-full border-b border-slate-200/60">
          <img
            src={imageSrc}
            alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
            {productTitle}
          </h3>
          {!isSubCategory && productSubtitle && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">
              {productSubtitle}
            </p>
          )}
          {isSubCategory && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClick();
                }}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                View Product
              </button>
            </div>
          )}
        </div>

        {!isSubCategory && (
          <>
            <div className="flex items-center justify-center">
              <p className="text-lg font-semibold text-slate-900">
                {"\u20B9"}
                {Number(product?.price ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="inline-flex w-full items-center justify-between overflow-hidden rounded-full border border-blue-100 bg-blue-50">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setQty((prev) => Math.max(1, prev - 1));
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
                  className="px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-blue-300"
                  aria-label={`Increase quantity for ${productTitle}`}
                >
                  +
                </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Add to cart
              </button>
            </div>
          </>
        )}
      </div>

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
              className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow hover:text-slate-900"
              aria-label="Close image preview"
            >
              x
            </button>
            <img
              src={imageSrc}
              alt={productTitle}
              className="max-h-[80vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </article>
  );
};

export default CategoryCard;
