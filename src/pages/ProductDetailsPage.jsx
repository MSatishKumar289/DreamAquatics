import { useMemo, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { getImageWithFallback } from "../assets";
import incPlusIcon from "../assets/Icons/iplus.png";
import incMinusIcon from "../assets/Icons/iminus.png";
import arrowIcon from "../assets/Icons/arrow.png";
import { renderFormattedDescription } from "../utils/formatDescription";
import { useEffect, useState } from "react";
import { fetchProductById } from "../lib/catalogApi";
import { getProductPricing } from "../lib/pricing";

const ProductDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId } = useParams();
  const { cartItems, addToCart, updateQty, removeItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [showAddedHint, setShowAddedHint] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isResolvingProduct, setIsResolvingProduct] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const relatedTrackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const stateProduct = location.state?.product || null;
  const [resolvedProduct, setResolvedProduct] = useState(stateProduct);
  const product = resolvedProduct || null;

  useEffect(() => {
    if (stateProduct) {
      setResolvedProduct(stateProduct);
      setResolveError("");
      setIsResolvingProduct(false);
      return;
    }

    if (!productId) {
      setResolvedProduct(null);
      setResolveError("Missing product id.");
      setIsResolvingProduct(false);
      return;
    }

    let active = true;
    setIsResolvingProduct(true);
    setResolveError("");

    (async () => {
      const { data, error } = await fetchProductById(productId);
      if (!active) return;

      if (error || !data) {
        setResolvedProduct(null);
        setResolveError("Product not found.");
      } else {
        setResolvedProduct(data);
      }
      setIsResolvingProduct(false);
    })();

    return () => {
      active = false;
    };
  }, [stateProduct, productId]);
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const source = Array.isArray(location.state?.relatedProducts) ? location.state.relatedProducts : [];
    const bySubcategory = source.filter(
      (item) => item?.subcategory?.id && item?.subcategory?.id === product?.subcategory?.id
    );
    const unique = [];
    const seen = new Set();
    bySubcategory.forEach((item) => {
      const id = item?.id;
      if (!id || seen.has(id) || id === product?.id) return;
      seen.add(id);
      unique.push(item);
    });
    return unique;
  }, [location.state?.relatedProducts, product]);

  const title = product?.name || product?.title || "Product";
  const rawCategorySlug = product?.subcategory?.category?.slug || "fishes";
  const categorySlug = rawCategorySlug === "tanks" ? "tank" : rawCategorySlug;
  const subCategorySlug = product?.subcategory?.slug || "";
  const categoryDisplayNameMap = {
    accessories: "Tanks & Accessories",
    tanks: "Fish Food & Medicines",
  };
  const categoryDisplayName =
    categoryDisplayNameMap[rawCategorySlug] ||
    (product?.subcategory?.category?.name || "Category");
  const imageFromDb = product?.product_images?.[0]?.url || product?.image || "";
  const imageSrc = useMemo(() => {
    if (!imageFromDb) return getImageWithFallback("", title);
    if (typeof imageFromDb === "string" && imageFromDb.startsWith("http")) return imageFromDb;
    return getImageWithFallback(imageFromDb, title);
  }, [imageFromDb, title]);

  const { currentPrice, nonDiscountPrice: originalPrice, savingsAmount: savings } =
    getProductPricing(product);
  const currentQty = cartItems?.find((item) => item.id === product?.id)?.qty || 0;
  const favoriteSelected = isFavorite(product?.id);
  const availabilityText = String(product?.availability || product?.status || "").toLowerCase();
  const parsedStockCount = Number.isFinite(Number(product?.stock_count))
    ? Number(product?.stock_count)
    : null;
  const isSoldOut = parsedStockCount !== null ? parsedStockCount <= 0 : /out|sold/.test(availabilityText);

  useEffect(() => {
    if (!showAddedHint) return;
    const timer = setTimeout(() => setShowAddedHint(false), 1600);
    return () => clearTimeout(timer);
  }, [showAddedHint]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [product?.id]);

  useEffect(() => {
    const node = relatedTrackRef.current;
    if (!node) return;
    const updateState = () => {
      const maxLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      setCanScrollLeft(node.scrollLeft > 4);
      setCanScrollRight(maxLeft - node.scrollLeft > 4);
    };
    updateState();
    node.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      node.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [relatedProducts.length]);

  const scrollRelated = (direction) => {
    const node = relatedTrackRef.current;
    if (!node) return;
    const amount = Math.max(220, Math.floor(node.clientWidth * 0.45));
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (isResolvingProduct) {
    return (
      <main className="min-h-screen bg-transparent py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-[8px] bg-white px-6 py-10 text-center shadow-lg">
            <p className="text-lg font-semibold text-slate-900">Loading product details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-transparent py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="rounded-[8px] bg-white px-6 py-10 text-center shadow-lg">
            <p className="text-lg font-semibold text-slate-900">Product not available.</p>
            <p className="mt-2 text-sm text-slate-600">
              {resolveError || "This product may be inactive or removed."}
            </p>
            <Link to="/" className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
          <Link to="/" className="text-slate-600 hover:text-blue-700">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${categorySlug}`} className="text-slate-600 hover:text-blue-700">
            {categoryDisplayName}
          </Link>
          {subCategorySlug ? (
            <>
              <span className="mx-2">/</span>
              <Link to={`/category/${categorySlug}/${subCategorySlug}`} className="text-slate-600 hover:text-blue-700">
                {product?.subcategory?.name || "Products"}
              </Link>
            </>
          ) : null}
        </div>

        <section key={`product-view-${product?.id || "default"}`} className="rounded-[8px] bg-transparent p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,440px)_1fr] lg:items-start lg:gap-8">
            <div
              className="mx-auto w-full max-w-[440px] self-start overflow-hidden rounded-[8px] bg-transparent da-card-reveal lg:mx-0"
              style={{ "--da-stagger": "40ms" }}
            >
              <div className="w-full lg:aspect-[4/5]">
                <img
                  src={imageSrc}
                  alt={title}
                  className="w-full h-auto object-top lg:h-full lg:w-full lg:object-contain"
                />
              </div>
            </div>

            <div
              className="relative rounded-[8px] border-0 bg-transparent p-2 text-left da-card-reveal sm:p-3 md:p-4"
              style={{ "--da-stagger": "130ms" }}
            >
              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                className={`absolute -right-[10px] -top-[17px] sm:right-3 inline-flex h-10 w-10 min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-full border border-[6px] p-0 shadow transition ${
                  favoriteSelected
                    ? "border-pink-300 bg-rose-50 text-rose-600"
                    : "border-pink-200 bg-white/95 text-slate-600 hover:text-rose-600"
                }`}
                aria-label={favoriteSelected ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill={favoriteSelected ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 21s-7-4.35-9.5-8.4C.8 9.6 2.2 5.8 5.8 5c2.2-.5 4.2.4 5.2 2.1 1-1.7 3-2.6 5.2-2.1 3.6.8 5 4.6 3.3 7.6C19 16.65 12 21 12 21Z" />
                </svg>
              </button>
              <h1 className="text-[1.68rem] font-semibold text-[#102A43] sm:text-[2.25rem]">{title}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-start gap-3">
                {originalPrice > currentPrice && (
                  <p className="text-2xl font-medium text-slate-400 line-through">
                    {"\u20B9"}{originalPrice.toLocaleString("en-IN")}
                  </p>
                )}
                <p className="text-4xl font-semibold text-[#1D3A8A] sm:text-5xl">
                  {"\u20B9"}{currentPrice.toLocaleString("en-IN")}
                </p>
              </div>
              {savings > 0 && (
                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  You Save {"\u20B9"}{savings.toLocaleString("en-IN")}
                </p>
              )}
              {isSoldOut && (
                <p className="mt-2 inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
                  Back Soon !
                </p>
              )}

              <div className="mt-5 flex w-full max-w-[410px] items-start gap-3">
                <div className="relative w-[48%] min-w-0">
                  {showAddedHint && (
                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-200">
                      Added 1 item
                    </span>
                  )}
                  {isSoldOut ? null : currentQty > 0 ? (
                    <div className="inline-flex h-11 w-full items-center justify-between rounded-full bg-gradient-to-r from-blue-50 to-blue-100 px-2 shadow-sm">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentQty <= 1) {
                            setShowRemoveConfirm(true);
                            return;
                          }
                          updateQty?.(product?.id, currentQty - 1);
                        }}
                        className="h-9 w-9 rounded-full bg-white text-base font-semibold text-blue-700 shadow"
                        aria-label="Decrease quantity"
                      >
                        <img src={incMinusIcon} alt="" className="h-9 w-9" />
                      </button>
                      <span className="px-3 text-base font-semibold text-blue-700">{currentQty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty?.(product?.id, currentQty + 1)}
                        className="h-9 w-9 rounded-full bg-white text-base font-semibold text-blue-700 shadow"
                        aria-label="Increase quantity"
                      >
                        <img src={incPlusIcon} alt="" className="h-9 w-9" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addToCart?.(product, 1);
                        setShowAddedHint(true);
                      }}
                      className="da-add-cart-btn h-11 w-full px-4 text-sm"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
                {!isSoldOut && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/checkout", {
                        state: {
                          buyNowProduct: {
                            ...product,
                            qty: currentQty > 0 ? currentQty : 1,
                          },
                        },
                      });
                    }}
                    className="inline-flex h-11 w-[48%] min-w-0 items-center justify-center rounded-lg border border-[#d97706] bg-[#f59e0b] px-4 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-[#d97706]"
                  >
                    Buy Now
                  </button>
                )}
              </div>

              <div className="mt-5 bg-transparent p-0 da-card-reveal" style={{ "--da-stagger": "220ms" }}>
                <h2 className="text-xl font-semibold text-[#102A43] sm:text-2xl">Product Description</h2>
                <div className="mt-3 text-base leading-relaxed text-slate-700">
                  {product?.description ? (
                    renderFormattedDescription(product.description)
                  ) : (
                    <p>Product details will be available soon.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-5 rounded-[8px] border border-amber-200/80 bg-white/55 p-4 sm:p-5 da-card-reveal" style={{ "--da-stagger": "280ms" }}>
              <h2 className="text-xl font-semibold text-[#102A43] sm:text-2xl">Other Products</h2>
              <div className="relative mt-4">
                <button
                  type="button"
                  onClick={() => scrollRelated("left")}
                  disabled={!canScrollLeft}
                  className="absolute -left-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Scroll related products left"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollRelated("right")}
                  disabled={!canScrollRight}
                  className="absolute -right-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Scroll related products right"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
                <div ref={relatedTrackRef} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-14 pb-2">
                {relatedProducts.map((item, index) => {
                  const itemTitle = item?.name || item?.title || "Product";
                  const itemImageRaw = item?.product_images?.[0]?.url || item?.image || "";
                  const itemImageSrc =
                    typeof itemImageRaw === "string" && itemImageRaw.startsWith("http")
                      ? itemImageRaw
                      : getImageWithFallback(itemImageRaw, itemTitle);
                  const itemPrice = Number(item?.price || 0);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        navigate(`/product/${item.id}`, {
                          state: { product: item, relatedProducts: relatedProducts.concat(product) },
                        })
                      }
                      className="relative snap-start min-w-[150px] rounded-[8px] border border-amber-200/80 bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA] p-2 text-left shadow-sm transition hover:shadow-md da-card-reveal"
                      style={{ "--da-stagger": `${320 + Math.min(index, 8) * 60}ms` }}
                    >
                      <p className="line-clamp-3 min-h-[3rem] px-1 text-xs font-semibold tracking-wide text-[#102A43]">
                        {itemTitle}
                      </p>
                      <div className="h-28 overflow-hidden rounded-[8px] bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]">
                        <img src={itemImageSrc} alt={itemTitle} className="h-full w-full object-cover object-center" />
                      </div>
                      <div className="relative mt-2 w-full">
                        <p className="text-center text-lg font-semibold text-[#1D3A8A]">
                          {"\u20B9"}{itemPrice.toLocaleString("en-IN")}
                        </p>
                        <span className="absolute right-[2px] top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-amber-300/90">
                          <img src={arrowIcon} alt="" className="h-4 w-4 object-contain" />
                        </span>
                      </div>
                    </button>
                  );
                })}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      {showRemoveConfirm && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowRemoveConfirm(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-[8px] bg-white p-5 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Remove item?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Remove {title} from your cart?
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeItem?.(product?.id);
                  setShowRemoveConfirm(false);
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductDetailsPage;
