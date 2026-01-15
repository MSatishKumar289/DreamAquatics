import { useState } from "react";
import { getImageWithFallback } from "../assets";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({
  categoryName,
  product,
  isSubCategory = false,
  onAddToCart
}) => {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const productTitle = isSubCategory
    ? product?.subcategoryName || product?.name || product?.title || "Category"
    : product?.name || product?.title || "Product";

  const productSubtitle = product?.subtitle || "";

  const productImage = isSubCategory
    ? product?.image || product?.product_images?.[0]?.url || product?.image
    : product?.product_images?.[0]?.url || product?.image;

  const handleClick = () => {
    if (!isSubCategory) return;
    if (product?.subcategorySlug) {
      navigate(`/category/${categoryName}/${product.subcategorySlug}`);
    }
  };

  const availabilityText = String(
    product?.availability || product?.status || ""
  ).toLowerCase();
  const parsedStockCount = Number.isFinite(Number(product?.stock_count))
    ? Number(product?.stock_count)
    : null;
  const isSoldOut = parsedStockCount !== null
    ? parsedStockCount <= 0
    : /out|sold/.test(availabilityText);

  const handleAddToCart = (event) => {
    event?.stopPropagation();
    if (isSoldOut) return;
    if (onAddToCart) {
      onAddToCart(product, qty);
    }
  };

  const imageSrc =
    typeof productImage === "string" && productImage.startsWith("http")
      ? productImage
      : getImageWithFallback(productImage, productTitle);

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
      <div className="relative w-full overflow-hidden rounded-b-none bg-slate-100">
        {!isSubCategory && !isSoldOut && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
              ✓
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              In Stock
            </span>
          </div>
        )}
        {!isSubCategory && isSoldOut && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-red-200 bg-white/90 px-2.5 py-1 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
              x
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-red-700">
              Out of Stock
            </span>
          </div>
        )}
        <div className="aspect-[4/3] w-full">
          <img
            src={imageSrc}
            alt={`${productTitle}${productSubtitle ? ` - ${productSubtitle}` : ""}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E" +
                encodeURIComponent(productTitle) +
                "%3C/text%3E%3C/svg%3E";
            }}
          />
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
              <div className="inline-flex items-center overflow-hidden rounded-full border border-blue-100 bg-blue-50">
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

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Add to cart
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
};

export default CategoryCard;
