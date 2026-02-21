const DEFAULT_NON_DISCOUNT_MULTIPLIER = 1.15;

const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getProductPricing = (product) => {
  const currentPrice = Math.max(0, toFiniteNumber(product?.price) ?? 0);
  const fallbackNonDiscountPrice = Math.round(
    currentPrice * DEFAULT_NON_DISCOUNT_MULTIPLIER
  );
  const providedNonDiscountPrice = toFiniteNumber(product?.non_discount_price);
  const nonDiscountPrice =
    providedNonDiscountPrice !== null && providedNonDiscountPrice > 0
      ? providedNonDiscountPrice
      : fallbackNonDiscountPrice;
  const resolvedNonDiscountPrice =
    nonDiscountPrice > currentPrice ? nonDiscountPrice : fallbackNonDiscountPrice;
  const savingsAmount = Math.max(0, resolvedNonDiscountPrice - currentPrice);
  const discountPercent =
    resolvedNonDiscountPrice > 0
      ? Math.round((savingsAmount / resolvedNonDiscountPrice) * 100)
      : 0;

  return {
    currentPrice,
    nonDiscountPrice: resolvedNonDiscountPrice,
    savingsAmount,
    discountPercent,
  };
};
