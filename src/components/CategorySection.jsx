import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';

const CategorySection = ({ categoryName, products, subcategoryCount = 0 }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const categoryLabel = {
    'fishes': '🐠 Fishes',
    'live-plants': '🌿 Live Plants',
    'accessories': '🧰 Accessories',
    'tank': '🫧 Tank'
  };

  const displayName = categoryLabel[categoryName] || categoryName;

  const handleViewAll = () => {
    navigate(`/category/${categoryName}`);
  };

  const displayProducts = products;
  const productCount = subcategoryCount;
  const showingCount = displayProducts.length;
  // console.log(displayProducts);

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const maxLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(maxLeft - node.scrollLeft > 4);

    const centerX = node.scrollLeft + node.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveIndex(nearestIndex);
  }, []);

  useEffect(() => {
    updateScrollState();
    const node = scrollRef.current;
    if (!node) return undefined;
    const onScroll = () => updateScrollState();
    node.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      node.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [displayProducts.length, updateScrollState]);

  useEffect(() => {
    setActiveIndex(0);
  }, [displayProducts.length]);

  const centerCardByIndex = (index, behavior = 'smooth') => {
    const node = scrollRef.current;
    const card = cardRefs.current[index];
    if (!node || !card) return;
    const maxLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    const targetLeft = card.offsetLeft - (node.clientWidth - card.offsetWidth) / 2;
    const clampedLeft = Math.min(maxLeft, Math.max(0, targetLeft));
    node.scrollTo({ left: clampedLeft, behavior });
    card.focus({ preventScroll: true });
  };

  const scrollByCard = (direction) => {
    if (!displayProducts.length) return;
    const nextIndex =
      direction === 'right'
        ? Math.min(displayProducts.length - 1, activeIndex + 1)
        : Math.max(0, activeIndex - 1);
    setActiveIndex(nextIndex);
    centerCardByIndex(nextIndex, 'smooth');
  };

  return (
    <section className="px-4 pt-3 sm:px-6 container mx-auto" aria-labelledby={`category-${categoryName}`}>
      {categoryName !== 'fishes' && (
        <div className="mx-auto mb-3 h-[2px] w-[72%] bg-slate-400/90" aria-hidden="true" />
      )}
      <div className="w-full px-0">
        <div className="px-0 py-4 sm:px-2">
          {/* Section Header */}
          <div className="mb-4 flex flex-nowrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2
                id={`category-${categoryName}`}
                className="truncate text-xl font-bold text-gray-900 sm:text-2xl"
              >
                {displayName}
              </h2>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Showing {showingCount} of {productCount}
              </p>
            </div>
            <button
              className="group relative inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-200 hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] focus:outline-none sm:px-4 sm:text-xs sm:tracking-[0.3em]"
              aria-label={`View all ${displayName.toLowerCase()}`}
              onClick={handleViewAll}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="6" height="6" rx="1" />
                  <rect x="14" y="4" width="6" height="6" rx="1" />
                  <rect x="4" y="14" width="6" height="6" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
              </span>
              <span>View All</span>
              <span className="absolute -right-2 -top-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-white shadow ring-2 ring-blue-300">
                {productCount}
              </span>
            </button>
          </div>

          {/* Single-row horizontal scroll for all breakpoints */}
          <div ref={scrollRef} className="-mx-2 overflow-x-auto px-2 pb-2 premium-flat-scrollbar">
            <div className="grid w-max snap-x snap-mandatory grid-flow-col grid-rows-1 gap-2 auto-cols-[230px] sm:auto-cols-[250px] lg:auto-cols-[270px]">
              {displayProducts.map((product, index) => (
                <div
                  key={product.subcategoryId || product.id}
                  className="snap-start"
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  tabIndex={-1}
                >
                  <CategoryCard
                    categoryName={categoryName}
                    product={product}
                    isSubCategory
                    showStockBadge={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center">
            <div className="flex items-start gap-5">
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollByCard('left')}
                  disabled={!canScrollLeft}
                  aria-label={`Scroll ${displayName.toLowerCase()} left`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Prev</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollByCard('right')}
                  disabled={!canScrollRight}
                  aria-label={`Scroll ${displayName.toLowerCase()} right`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-blue-700 shadow-sm transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Next</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;

