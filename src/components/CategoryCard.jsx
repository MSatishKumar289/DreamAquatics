import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getImageWithFallback } from "../assets";
import plusIcon from "../assets/Icons/plus.png";
import incPlusIcon from "../assets/Icons/iplus.png";
import incMinusIcon from "../assets/Icons/iminus.png";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CategoryCard = ({
  categoryName,
  product,
  isSubCategory = false,
  onAddToCart,
  showStockBadge,
  isMasonry = false
}) => {
  const EXPLORE_STYLE = "corner-badge";
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQty, removeItem } = useCart();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showViewHint, setShowViewHint] = useState(false);
  const [showExpandHint, setShowExpandHint] = useState(false);
  const [showAddedHint, setShowAddedHint] = useState(false);
  const [pendingRemove, setPendingRemove] = useState(false);

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

  const currentQty =
    cartItems?.find((item) => item.id === product?.id)?.qty || 0;

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
      className={`group relative overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 ${
        isSubCategory ? "cursor-pointer pb-6 sm:pb-8 hover:shadow-lg" : "hover:shadow-md"
      }`}
      tabIndex={isSubCategory ? "0" : undefined}
      role={isSubCategory ? "button" : "group"}
      aria-label={
        isSubCategory ? `View ${productTitle} subcategory` : productTitle
      }
      onClick={handleClick}
    >
      <div className="relative w-full overflow-hidden rounded-b-none bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="relative aspect-[4/3] sm:aspect-[4/3] w-full border-b border-slate-200/60">
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
            className="h-full w-full object-contain bg-white transition-transform duration-300 group-hover:scale-105"
            onClick={(event) => {
              if (isSubCategory) return;
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

      <div
        className={`p-2 sm:p-3 ${
          isSubCategory
            ? "flex flex-col gap-2 pb-5 sm:gap-3 sm:pb-6"
            : isMasonry
              ? "flex flex-col gap-1 sm:gap-1.5"
              : "flex min-h-[160px] flex-col gap-1 sm:min-h-[185px] sm:gap-1.5"
        }`}
      >
        {!isSubCategory && shouldShowStockBadge && (
          <div className="flex justify-center mb-2">
            <div
              className={`relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-md ${
                isSoldOut ? "border-rose-200 bg-rose-500" : "border-emerald-200 bg-emerald-600"
              }`}
            >
              <span
                className="absolute left-1/2 -bottom-1.5 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border border-transparent"
                style={{
                  borderLeftColor: isSoldOut ? "#f43f5e" : "#059669",
                  borderBottomColor: isSoldOut ? "#f43f5e" : "#059669",
                  backgroundColor: isSoldOut ? "#f43f5e" : "#059669"
                }}
                aria-hidden="true"
              />
              <span className="h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden="true" />
              {isSoldOut ? "Sold Out" : "In Stock"}
            </div>
          </div>
        )}
        <div
          className={`text-center min-h-[38px] ${
            !isSubCategory && !isMasonry ? "flex flex-1 flex-col" : ""
          }`}
        >
          <h3 className="px-1 text-sm sm:text-base font-semibold text-slate-900 line-clamp-3">
            {productTitle}
          </h3>
          {!isSubCategory && productSubtitle && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">
              {productSubtitle}
            </p>
          )}
          {!isSubCategory && (
            <div className="mt-0.5 flex items-center justify-center">
              <p className="text-sm font-semibold text-slate-900">
                {"\u20B9"}
                {Number(product?.price ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          )}
          {/* Label strip for subcategory cards */}
        </div>

        {!isSubCategory && (
          <>
            <div className="relative mt-auto pt-1">
              {currentQty === 0 ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className="group inline-flex h-9 w-full max-w-[180px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-0 text-[10px] font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                      <img src={plusIcon} alt="" className="h-5 w-5" />
                    </span>
                    Add to cart
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-full max-w-[180px]">
                    <div className="inline-flex h-9 w-full items-center justify-between rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2 shadow-sm">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (currentQty <= 1) {
                              setPendingRemove(true);
                              return;
                            }
                            updateQty?.(product?.id, currentQty - 1);
                          }}
                          disabled={isSoldOut}
                          className="h-7 w-7 rounded-full bg-white text-sm font-semibold text-blue-700 shadow disabled:cursor-not-allowed disabled:text-blue-300"
                          aria-label={`Decrease quantity for ${productTitle}`}
                        >
                          <img src={incMinusIcon} alt="" className="h-7 w-7" />
                        </button>
                      <span className="text-sm font-semibold text-blue-700">
                        {currentQty}
                      </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            updateQty?.(product?.id, currentQty + 1);
                          }}
                          disabled={isSoldOut}
                          className="h-7 w-7 rounded-full bg-white text-sm font-semibold text-blue-700 shadow disabled:cursor-not-allowed disabled:text-blue-300"
                          aria-label={`Increase quantity for ${productTitle}`}
                        >
                          <img src={incPlusIcon} alt="" className="h-7 w-7" />
                        </button>
                    </div>
                  </div>
                </div>
              )}
              {showAddedHint && !isPreviewOpen && (
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-200">
                  Added 1 item
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {isSubCategory && (
        (() => {
          const count = Number.isFinite(product?.itemCount) ? product.itemCount : null;
          const commonProps = {
            type: "button",
            onClick: (event) => {
              event.stopPropagation();
              handleClick();
            },
          };

          if (EXPLORE_STYLE === "underline") {
            return (
              <button
                {...commonProps}
                className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(37,99,235,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                <span>Explore</span>
                {count !== null && (
                  <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-white">
                    {count}
                  </span>
                )}
                <span className="absolute inset-x-8 -bottom-1 h-[2px] rounded-full bg-blue-500/60" aria-hidden="true" />
              </button>
            );
          }

          if (EXPLORE_STYLE === "outline") {
            return (
              <button
                {...commonProps}
                className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full border border-blue-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(37,99,235,0.18)] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                <span>Explore</span>
                {count !== null && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-2 text-[10px] font-semibold tracking-[0.12em] text-white shadow-sm">
                    {count}
                  </span>
                )}
              </button>
            );
          }

          if (EXPLORE_STYLE === "corner-badge") {
            return (
              <button
                {...commonProps}
                className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                <span>Explore</span>
                {count !== null && (
                  <span className="absolute -right-2 -top-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-blue-700 shadow ring-2 ring-blue-400">
                    {count}
                  </span>
                )}
              </button>
            );
          }

          if (EXPLORE_STYLE === "stacked") {
            return (
              <button
                {...commonProps}
                className="absolute inset-x-3 bottom-3 flex flex-col items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                <span>Explore</span>
                {count !== null && (
                  <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-white ring-1 ring-white/30">
                    {count}
                  </span>
                )}
              </button>
            );
          }

          // split pill (default)
          return (
            <button
              {...commonProps}
              className="absolute inset-x-3 bottom-3 inline-flex items-center justify-between rounded-full bg-blue-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                    <path d="M5 12h14M12 5v14" />
                  </svg>
                </span>
                <span>Explore</span>
              </span>
              {count !== null && (
                <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-blue-700 ring-2 ring-blue-400">
                  {count}
                </span>
              )}
            </button>
          );
        })()
      )}

      {isPreviewOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setIsPreviewOpen(false);
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
              {showAddedHint && (
                <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-md bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-200">
                  Added 1 item
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute right-4 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                aria-label="Close image preview"
              >
                X
              </button>
              <div className="flex max-h-[calc(90vh-3rem)] flex-col gap-6 p-6 md:flex-row md:items-start">
                <div className="w-full md:w-1/2">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={productTitle}
                      className="h-full w-full object-contain bg-white"
                    />
                  </div>
                  <div className="mt-4 flex flex-col items-center text-center gap-3">
                    <div className="pt-1">
                      {currentQty === 0 ? (
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          disabled={isSoldOut}
                          className="group mx-auto inline-flex h-11 w-full max-w-[220px] min-w-[220px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-0 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                            <img src={plusIcon} alt="" className="h-6 w-6" />
                          </span>
                          Add to cart
                        </button>
                      ) : (
                        <div className="mx-auto inline-flex h-11 w-full max-w-[220px] min-w-[220px] items-center justify-between rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2 shadow-sm">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (currentQty <= 1) {
                                setPendingRemove(true);
                                return;
                              }
                              updateQty?.(product?.id, currentQty - 1);
                            }}
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
                            onClick={(event) => {
                              event.stopPropagation();
                              updateQty?.(product?.id, currentQty + 1);
                            }}
                            disabled={isSoldOut}
                            className="h-9 w-9 rounded-full bg-white text-base font-semibold text-blue-700 shadow hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-blue-300"
                            aria-label={`Increase quantity for ${productTitle}`}
                          >
                            <img src={incPlusIcon} alt="" className="h-9 w-9" />
                          </button>
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {productTitle}
                    </h2>
                    <p className="text-lg font-semibold text-slate-900">
                      {"\u20B9"}
                      {Number(product?.price ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-1 min-h-0 flex-col gap-3 md:w-1/2">
                  <div className="flex-1 overflow-y-auto pr-1 md:mt-1 md:max-h-none md:pr-0 md:overflow-visible">
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
          </div>,
          document.body
        )}

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
                Remove {productTitle} from your cart?
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
                    removeItem?.(product?.id);
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
    </article>
  );
};

export default CategoryCard;
