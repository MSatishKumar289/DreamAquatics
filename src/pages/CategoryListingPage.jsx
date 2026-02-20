import { useParams, Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import WhatsIcon from "../assets/Icons/whatsapp.png";
import closeIcon from "../assets/Icons/close_one.png";
import { useState, useEffect, useMemo, useRef } from "react";
import { useCart } from "../context/CartContext";
import { fetchAllProductsWithCategories } from "../lib/catalogApi";
import { renderFormattedDescription } from "../utils/formatDescription";

const CategoryListingPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const { addToCart } = useCart();

  // DB state
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [hasSearchOpened, setHasSearchOpened] = useState(false);
  const [showSearchHint, setShowSearchHint] = useState(false);
  const [showWhatsAppHint, setShowWhatsAppHint] = useState(false);
  const [hasLongDescription, setHasLongDescription] = useState(false);
  const [showCustomTankRequestModal, setShowCustomTankRequestModal] = useState(false);
  const [showSubcategoryEnquiryModal, setShowSubcategoryEnquiryModal] = useState(false);
  const [customTankRequest, setCustomTankRequest] = useState("");
  const [subcategoryEnquiry, setSubcategoryEnquiry] = useState("");
  const [priceSortOrder, setPriceSortOrder] = useState("default");
  const isSearching = searchQuery.trim().length > 0;
  const searchInputRef = useRef(null);
  const descriptionRef = useRef(null);
  const openingSearchRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    const updateView = () => setIsMobileView(window.innerWidth < 640);
    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, []);

  useEffect(() => {
    if (!isMobileView) {
      setShowSearchHint(false);
      return;
    }
    if (hasSearchOpened) return;
    setShowSearchHint(true);
    const timer = setTimeout(() => setShowSearchHint(false), 4000);
    return () => clearTimeout(timer);
  }, [hasSearchOpened, isMobileView]);

  useEffect(() => {
    if (!isMobileView || isSearching) {
      setShowWhatsAppHint(false);
      return;
    }
    setShowWhatsAppHint(true);
    const timer = setTimeout(() => setShowWhatsAppHint(false), 4200);
    return () => clearTimeout(timer);
  }, [isMobileView, isSearching, categorySlug, subCategorySlug]);

  useEffect(() => {
    setSearchQuery("");
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    setPriceSortOrder("default");
  }, [categorySlug, subCategorySlug]);

  useEffect(() => {
    const onScroll = () => {
      if (openingSearchRef.current) return;
      const atTop = window.scrollY <= 0;
      if (isSearchFocused) {
        if (!atTop) {
          searchInputRef.current?.blur();
          setIsSearchFocused(false);
          setIsSearchCollapsed(true);
        }
        return;
      }
      if (!atTop) {
        setIsSearchCollapsed(true);
        return;
      }
      setIsSearchCollapsed(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isSearchFocused]);

  // Map category slug to human-readable title
  const categoryLabel = {
    fishes: "Fishes",
    "live-plants": "Live Plants",
    accessories: "Tanks & Accessories",
    tank: "Fish Food & Medicines",
    plants: "Live Plants",
    tanks: "Fish Food & Medicines",
  };

  const slugToTitle = (slug) => {
    if (!slug) return "";
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const renderCategoryIcon = (value) => {
    switch (value) {
      case "fishes":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 12c2.5-3 7-5 12-4l4 4-4 4c-5 1-9.5-1-12-4Z" />
            <circle cx="10" cy="12" r="1" fill="currentColor" />
          </svg>
        );
      case "live-plants":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 20V6" />
            <path d="M12 12c-3-1-4-3-4-6 3 1 4 3 4 6Z" />
            <path d="M12 14c3-1 4-3 4-6-3 1-4 3-4 6Z" />
          </svg>
        );
      case "accessories":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M14 6l4 4-8 8H6v-4l8-8Z" />
            <path d="M13 7l4 4" />
          </svg>
        );
      case "tank":
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="7" width="18" height="10" rx="2" />
            <path d="M7 17c1 2 9 2 10 0" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="8" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        );
    }
  };

  const subCategoryTitle = subCategorySlug ? slugToTitle(subCategorySlug) : null;

  const titleOfListingPage =
    subCategoryTitle ||
    categoryLabel[categorySlug] ||
    slugToTitle(categorySlug);
  const parentCategoryDisplayName =
    categoryLabel[categorySlug] || slugToTitle(categorySlug);

  const categoryIconKey = useMemo(() => {
    if (categorySlug === "plants") return "live-plants";
    if (categorySlug === "tanks") return "tank";
    return categorySlug;
  }, [categorySlug]);

  // ✅ FIX: normalize route slug -> DB slug
  const normalizedCategorySlug = useMemo(() => {
    if (categorySlug === "live-plants") return "plants";
    if (categorySlug === "tank") return "tanks";
    return categorySlug;
  }, [categorySlug]);

  /* =========================
      FETCH ALL PRODUCTS (DB)
  ========================= */
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await fetchAllProductsWithCategories();

      if (error) {
        console.error("Error fetching products:", error);
        setDbProducts([]);
        setLoading(false);
        return;
      }

      setDbProducts(data || []);
      setLoading(false);
    })();
  }, []);

  /* =========================================================
     MODE A: Category View (/category/:categorySlug)
     → show SUBCATEGORIES (cards)
  ========================================================= */
  const subcategoryCards = useMemo(() => {
    if (!dbProducts?.length) return [];

    const filtered = dbProducts.filter((p) => {
      const pCatSlug = p?.subcategory?.category?.slug;
      return pCatSlug === normalizedCategorySlug;
    });

    // group by subcategory.id
    const map = new Map();

    filtered.forEach((p) => {
      const sub = p?.subcategory;
      if (!sub?.id) return;

      if (!map.has(sub.id)) map.set(sub.id, []);
      map.get(sub.id).push(p);
    });

    // build card model (use latest product as cover image)
    const cards = Array.from(map.values()).map((group) => {
      const latestProduct = group.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.created_at) > new Date(latest.created_at)
          ? current
          : latest;
      }, null);

      const minPrice = group.reduce((min, current) => {
        const priceValue = Number(current?.price);
        if (!Number.isFinite(priceValue)) return min;
        if (min === null) return priceValue;
        return priceValue < min ? priceValue : min;
      }, null);

      const sub = latestProduct?.subcategory;
      if (!sub?.id) return null;

      return {
        id: sub.id,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
        subcategorySlug: sub.slug,
        subcategoryDescription: sub.description || "",
        latestProductDate: latestProduct?.created_at || "",
        image: latestProduct?.product_images?.[0]?.url || "",
        itemCount: group.length,
        startFromPrice: minPrice,
      };
    });

    return cards
      .filter(Boolean)
      .sort((a, b) => new Date(b.latestProductDate) - new Date(a.latestProductDate));
  }, [dbProducts, normalizedCategorySlug]);

  /* =========================================================
     MODE B: Subcategory View (/category/:categorySlug/:subCategorySlug)
     → show PRODUCTS
  ========================================================= */
  const productsForIteration = useMemo(() => {
    if (!dbProducts?.length) return [];

    if (!subCategorySlug) return [];

    const filtered = dbProducts.filter((p) => {
      const pCatSlug = p?.subcategory?.category?.slug;
      const pSubSlug = p?.subcategory?.slug;

      return pCatSlug === normalizedCategorySlug && pSubSlug === subCategorySlug;
    });
    const getStockFlag = (item) => {
      const count = Number(item?.stock_count);
      if (Number.isFinite(count)) return count > 0;
      const status = String(item?.availability || item?.status || "").toLowerCase();
      if (!status) return true;
      return !/out|sold/.test(status);
    };
    return filtered.sort((a, b) => {
      const aInStock = getStockFlag(a);
      const bInStock = getStockFlag(b);
      if (aInStock === bInStock) return 0;
      return aInStock ? -1 : 1;
    });
  }, [dbProducts, normalizedCategorySlug, subCategorySlug]);

  // ✅ decide which list to render
  const isSubcategoryMode = !!subCategorySlug;
  const listForGrid = isSubcategoryMode ? productsForIteration : subcategoryCards;
  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return listForGrid;
    return listForGrid.filter((item) => {
      const title = isSubcategoryMode
        ? (item?.name || item?.title || "")
        : (item?.subcategoryName || item?.name || item?.title || "");
      return title.toLowerCase().includes(query);
    });
  }, [isSubcategoryMode, listForGrid, searchQuery]);
  const sortedFilteredList = useMemo(() => {
    if (!isSubcategoryMode) return filteredList;
    if (priceSortOrder === "default") return filteredList;

    const toSortablePrice = (item) => {
      const value = Number(item?.price);
      if (Number.isFinite(value)) return value;
      return priceSortOrder === "low_to_high" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    };

    return [...filteredList].sort((a, b) => {
      if (priceSortOrder === "low_to_high") {
        return toSortablePrice(a) - toSortablePrice(b);
      }
      return toSortablePrice(b) - toSortablePrice(a);
    });
  }, [filteredList, isSubcategoryMode, priceSortOrder]);
  const subcategoryDescription = useMemo(() => {
    if (!isSubcategoryMode) return "";
    const firstWithDescription = productsForIteration.find(
      (item) => item?.subcategory?.description
    );
    if (firstWithDescription?.subcategory?.description) {
      return firstWithDescription.subcategory.description;
    }
    const fallback = dbProducts.find(
      (item) =>
        item?.subcategory?.slug === subCategorySlug &&
        item?.subcategory?.category?.slug === normalizedCategorySlug &&
        item?.subcategory?.description
    );
    return fallback?.subcategory?.description || "";
  }, [
    isSubcategoryMode,
    productsForIteration,
    dbProducts,
    subCategorySlug,
    normalizedCategorySlug
  ]);
  const descriptionText = subcategoryDescription
    ? subcategoryDescription
    : normalizedCategorySlug === "tanks"
      ? "Explore trusted fish foods and medicines curated to keep your aquarium healthy, balanced, and stress-free."
      : normalizedCategorySlug === "accessories"
        ? "Explore essential aquarium accessories and reach out for custom setup guidance tailored to your space."
        : "Explore carefully curated aquatic species ready to ship nationwide. Add items straight from the cards.";
  const showCustomTankRequestCta =
    !isSearching &&
    !isSubcategoryMode &&
    normalizedCategorySlug === "accessories";
  // Keep enquiry CTA only for accessories flows; fishes/plants/fish-food use floating WhatsApp.
  const showSubcategoryEnquiryCta =
    !isSearching &&
    !isSubcategoryMode &&
    !showCustomTankRequestCta &&
    normalizedCategorySlug === "accessories";
  const useBlueEnquiryTheme = normalizedCategorySlug === "accessories";
  const enquiryCtaButtonClass = useBlueEnquiryTheme
    ? "inline-flex items-center justify-center rounded-[5px] bg-blue-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 sm:px-3.5"
    : "da-cta-amber focus:ring-amber-300";
  const useTankTwoCardFeaturedLayout =
    !isSearching &&
    !isSubcategoryMode &&
    normalizedCategorySlug === "tanks" &&
    listForGrid.length === 2;
  const listingHeaderTheme = useMemo(() => {
    const toneMap = {
      fishes: {
        panel: "from-[#3D86D9] via-[#5A9EE6] to-[#77B6F2]",
        ribbon: "from-[#1E5CB7] via-[#1B4F9D] to-[#163F7C]",
        ribbonText: "text-white",
        accent: "bg-[#1E40AF]/75",
        dot: "bg-[#EAF6FF]",
      },
      plants: {
        panel: "from-[#3BBC73] via-[#53C786] to-[#69D299]",
        ribbon: "from-[#00A84F] via-[#009748] to-[#00843F]",
        ribbonText: "text-white",
        accent: "bg-[#58C138]/80",
        dot: "bg-[#F5F5F5]",
      },
      accessories: {
        panel: "from-[#3D86D9] via-[#5A9EE6] to-[#77B6F2]",
        ribbon: "from-[#1E5CB7] via-[#1B4F9D] to-[#163F7C]",
        ribbonText: "text-white",
        accent: "bg-[#1E40AF]/75",
        dot: "bg-[#EAF6FF]",
      },
      tanks: {
        panel: "from-[#FFE066] via-[#FFD43B] to-[#FFC107]",
        ribbon: "from-[#F59E0B] via-[#D97706] to-[#B45309]",
        ribbonText: "text-white",
        accent: "bg-[#FDE047]/85",
        dot: "bg-[#FFF5C2]",
      },
      default: {
        panel: "from-[#4C8FE2] via-[#62A0EB] to-[#7BB3F5]",
        ribbon: "from-[#1E5CB7] via-[#1B4F9D] to-[#163F7C]",
        ribbonText: "text-white",
        accent: "bg-[#00D5FF]/70",
        dot: "bg-[#FFFFFF]",
      },
    };
    return toneMap[normalizedCategorySlug] || toneMap.default;
  }, [normalizedCategorySlug]);

  useEffect(() => {
    const measureDescriptionOverflow = () => {
      const descriptionNode = descriptionRef.current;
      if (!descriptionNode) {
        setHasLongDescription(false);
        return;
      }
      setHasLongDescription(descriptionNode.scrollHeight > descriptionNode.clientHeight + 1);
    };

    const rafId = window.requestAnimationFrame(measureDescriptionOverflow);
    window.addEventListener("resize", measureDescriptionOverflow);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measureDescriptionOverflow);
    };
  }, [descriptionText, isMobileView, isSearching]);

  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
  };

  const handleSendCustomTankRequest = () => {
    const message = customTankRequest.trim()
      ? `Hi Dream Aquatics, I need a custom aquarium tank.\n\nMy requirement:\n${customTankRequest.trim()}`
      : "Hi Dream Aquatics, I need a custom aquarium tank. Please contact me for consultation.";
    window.open(`https://wa.me/918667418965?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setShowCustomTankRequestModal(false);
  };

  const handleSendSubcategoryEnquiry = () => {
    const baseMessage = `Hi Dream Aquatics, I am interested in ${titleOfListingPage}. Please share expert recommendations and custom options.`;
    const message = subcategoryEnquiry.trim()
      ? `${baseMessage}\n\nMy requirement:\n${subcategoryEnquiry.trim()}`
      : baseMessage;
    window.open(`https://wa.me/918667418965?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setShowSubcategoryEnquiryModal(false);
  };

  const searchBar = (
    <div className="container mx-auto flex justify-center">
      <div
        onClick={() => {
          if (!isSearchCollapsed) return;
          openingSearchRef.current = true;
          setIsSearchFocused(true);
          setIsSearchCollapsed(false);
          window.scrollTo({ top: 0, behavior: "auto" });
          setTimeout(() => {
            openingSearchRef.current = false;
            searchInputRef.current?.focus();
          }, 80);
        }}
        className={`relative mt-[3px] mb-[6px] w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex sm:items-center sm:justify-between sm:gap-4 ${
          isSearchCollapsed
            ? "translate-x-2 rounded-full bg-transparent px-0 py-0 shadow-none ring-0 cursor-pointer"
            : "translate-x-0 h-[56px] rounded-xl border border-slate-200 bg-white/95 px-2 py-2 shadow-sm ring-1 ring-slate-100 sm:h-auto sm:px-4 sm:py-3"
        }`}
      >
        <div
          className={`flex w-full items-center gap-2 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isSearchCollapsed
              ? "pointer-events-none -translate-y-3 scale-[0.98] opacity-0"
              : "translate-y-0 scale-100 opacity-100"
          }`}
        >
          <div className="relative flex h-9 w-10 shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white sm:h-10 sm:w-14 sm:rounded-xl">
            <span className="pointer-events-none text-slate-600">
              {renderCategoryIcon(categoryIconKey)}
            </span>
          </div>
          <div className="relative flex h-9 flex-1 min-w-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 sm:h-auto sm:rounded-xl sm:py-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={
                  isSubcategoryMode
                    ? "Search in this category"
                    : "Search subcategories"
                }
                ref={searchInputRef}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            {searchQuery.trim() ? (
              <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                    aria-label="Clear search"
                  >
                    <img src={closeIcon} alt="" className="h-4 w-4" aria-hidden="true" />
                  </button>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" />
              </svg>
            )}
          </div>
        </div>
        <div
          className={`absolute right-3 top-1/2 flex -translate-y-1/2 items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:right-4 ${
            isSearchCollapsed
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-3 scale-[0.98] opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setHasSearchOpened(true);
              setShowSearchHint(false);
              setIsSearchCollapsed(false);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Open search"
          >
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
          </button>
          {isSearchCollapsed && showSearchHint && (
            <div className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-md bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
              <span className="absolute -top-1 right-4 h-2 w-2 rotate-45 bg-blue-600/90" aria-hidden="true" />
              Tap to search
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-transparent pb-12">
      <section className="fixed inset-x-0 top-16 z-40 px-4 pt-0 sm:px-6 md:top-20">
        {searchBar}
      </section>
      <div className="h-[66px] md:h-[72px]" aria-hidden="true" />
      <div className="container mx-auto px-1 pt-3 sm:px-6 lg:px-8">
        {!isSearching && (
          <section
            className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/25 sm:p-7"
          >
          <div className="pointer-events-none absolute -left-8 bottom-0 h-20 w-28 -skew-x-[26deg] bg-slate-100/80" />
          <div className={`pointer-events-none absolute -right-10 -top-8 h-28 w-28 rotate-12 rounded-2xl ${listingHeaderTheme.accent}`} />
          <div className="pointer-events-none absolute right-0 bottom-0 h-24 w-40 -skew-x-[28deg] bg-slate-100/80" />
          <div className={`pointer-events-none absolute left-4 top-[11px] h-2.5 w-2.5 rounded-full ${listingHeaderTheme.accent}`} />
          <div className={`pointer-events-none absolute left-8 top-[19px] h-1.5 w-1.5 rounded-full ${listingHeaderTheme.accent}`} />
          <nav
            className="relative z-10 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600"
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="rounded px-1 text-slate-600 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            >
              Home
            </Link>
            <span className="mx-2 text-slate-400">/</span>

            {!subCategorySlug && <span className="text-slate-900">{parentCategoryDisplayName}</span>}

            {subCategorySlug && (
              <>
                <Link
                  to={`/category/${categorySlug}`}
                  className="rounded px-1 text-slate-600 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                >
                  {parentCategoryDisplayName}
                </Link>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-900">{subCategoryTitle}</span>
              </>
            )}
          </nav>

          <div className="relative z-10 mt-4 flex flex-col gap-4">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="min-w-0 flex-1 pl-[10px]">
                <p className="text-xs uppercase tracking-[0.35em] text-white">
                  <span className="inline-block -skew-x-[10deg] rounded-[4px] bg-white/95 px-3 py-0.5 shadow-sm">
                    <span className="inline-block skew-x-[10deg] text-[#0D2F5A]">Collection</span>
                  </span>
                </p>
                <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-4xl">
                  <span
                    className={`inline-block -skew-x-[10deg] rounded-[5px] bg-gradient-to-r ${listingHeaderTheme.ribbon} px-4 py-1 shadow-[0_10px_25px_rgba(15,23,42,0.2)]`}
                  >
                    <span
                      className={`inline-block skew-x-[10deg] ${listingHeaderTheme.ribbonText || ""}`}
                      style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                    >
                      {titleOfListingPage}
                    </span>
                  </span>
                </h1>
              </div>

              <div className="flex flex-none flex-col items-end gap-2">
                <div className="rounded-[8px] border border-white/70 bg-gradient-to-b from-white to-[#F2F7FF] px-3 py-2 text-center shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                  <p className="inline-block -skew-x-[10deg] rounded-[4px] bg-[#0D2F5A] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-white">
                    <span className="inline-block skew-x-[10deg]">Listings</span>
                  </p>
                  <p className="mt-1 text-3xl font-semibold leading-none text-[#0D2F5A]">
                    {loading ? "-" : (isSubcategoryMode ? filteredList.length : listForGrid.length)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div
                ref={descriptionRef}
                className="max-w-none max-h-[4.8em] overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-base leading-[1.6] text-slate-700"
              >
                {renderFormattedDescription(descriptionText)}
              </div>
              {hasLongDescription && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDescriptionModal(true)}
                    className="rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-blue-600 shadow-sm hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    View more
                  </button>
                </div>
              )}
              <div className="mt-2 flex justify-center">
                <p className="rounded-md bg-white px-3 py-1 text-center text-xs text-sky-700/90 shadow-sm">
                  * Images are for reference. Actual product appearance may vary. *
                </p>
              </div>
            </div>
          </div>
          </section>
        )}

        {showCustomTankRequestCta && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowCustomTankRequestModal(true)}
              className={`${enquiryCtaButtonClass} gap-2`}
              aria-label="Open custom tank request form"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                <img src={WhatsIcon} alt="" className="h-4 w-4 object-contain" aria-hidden />
              </span>
              <span>Tap here to Build Your Dream Tank</span>
            </button>
          </div>
        )}

        {showSubcategoryEnquiryCta && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowSubcategoryEnquiryModal(true)}
              className={`${enquiryCtaButtonClass} gap-2`}
              aria-label="Open product enquiry form"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                <img src={WhatsIcon} alt="" className="h-4 w-4 object-contain" aria-hidden />
              </span>
              <span>Expert Product Enquiry</span>
            </button>
          </div>
        )}

        <section
          className={`${isSearching ? "mt-4" : "mt-8"} rounded-none border-0 bg-transparent p-0 shadow-none`}
        >
          {isSubcategoryMode && !loading && (
            <div className="mb-3 flex justify-end">
              <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                Sort by
                <select
                  value={priceSortOrder}
                  onChange={(event) => setPriceSortOrder(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold normal-case tracking-normal text-slate-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="default">Default</option>
                  <option value="low_to_high">Price: Low to High</option>
                  <option value="high_to_low">Price: High to Low</option>
                </select>
              </label>
            </div>
          )}
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">Loading...</p>
            </div>
          ) : sortedFilteredList.length > 0 ? (
            <div
              className={`${
                isSearching
                  ? "bg-white/80 px-4 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:px-6 lg:px-10"
                  : ""
              } ${!isSearching ? "px-2 sm:px-0" : ""}`}
            >
              {isSearching && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                      Search results
                    </p>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {sortedFilteredList.length} items found
                    </h2>
                    <p className="mt-2 text-center text-xs text-sky-600/80">
                      * Images are for reference. Actual product appearance may vary. *
                    </p>
                  </div>
                </div>
              )}
              {isSearching ? (
                <div
                  className={`grid ${isSubcategoryMode ? "grid-cols-2" : "grid-cols-3"} max-h-[70vh] overflow-y-auto overflow-x-hidden pb-24 sm:max-h-none sm:overflow-visible sm:pb-0 sm:grid-cols-3 ${
                    isSubcategoryMode ? "lg:grid-cols-4" : "lg:grid-cols-6"
                  } ${
                    isSubcategoryMode ? "gap-2" : "gap-2"
                  }`}
                  onScroll={() => searchInputRef.current?.blur()}
                >
                  {sortedFilteredList.map((item) => (
                    <div key={item.id} className="h-full">
                      <CategoryCard
                        categoryName={categorySlug}
                        product={item}
                        relatedProducts={isSubcategoryMode ? productsForIteration : []}
                        isSubCategory={!isSubcategoryMode}
                        onAddToCart={handleAddToCart}
                        showStockBadge={isSubcategoryMode}
                        borderless
                        itemDetailGoldenBorder={isSubcategoryMode}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`grid ${
                    useTankTwoCardFeaturedLayout
                      ? "mx-auto max-w-[760px] grid-cols-2 gap-2 sm:gap-3"
                      : `${isSubcategoryMode ? "grid-cols-2" : "grid-cols-3"} gap-2 sm:grid-cols-2 ${isSubcategoryMode ? "lg:grid-cols-4" : "lg:grid-cols-6"}`
                  }`}
                >
                  {sortedFilteredList.map((item) => (
                    <CategoryCard
                      key={item.id}
                      categoryName={categorySlug}
                      product={item}
                      relatedProducts={isSubcategoryMode ? productsForIteration : []}
                      isSubCategory={!isSubcategoryMode}
                      onAddToCart={handleAddToCart}
                      showStockBadge={isSubcategoryMode}
                      borderless
                      itemDetailGoldenBorder={isSubcategoryMode}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : isSearching ? (
            <div className="rounded-3xl bg-white/80 px-4 py-6 text-center text-sm text-slate-600 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:px-6 lg:px-10">
              <p className="text-sm font-semibold text-slate-700">
                Didn’t find what you were looking for?
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Tell us what you need and we will help you find it.
              </p>
              <a
                href={`https://wa.me/918667418965?text=${encodeURIComponent(
                  `Hi, I'm looking for ${searchQuery.trim() || "a product"} — please share the details.`
                )}`}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/80 bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
              >
                <img src={WhatsIcon} alt="" className="h-4 w-4 rounded-full object-contain" aria-hidden />
                WhatsApp us
              </a>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">
                No products found in this category.
              </p>
            </div>
          )}
        </section>
      </div>

      {showCustomTankRequestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowCustomTankRequestModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Curious?</p>
                <h2 className="text-lg font-semibold text-slate-900">Let Us Design Your Dream Tank</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomTankRequestModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                aria-label="Close custom tank form"
              >
                <img src={closeIcon} alt="" className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="mb-2 text-sm text-slate-600">
                Share your idea and we will suggest the best size, setup, and budget options.
              </p>
              <textarea
                value={customTankRequest}
                onChange={(event) => setCustomTankRequest(event.target.value)}
                rows={5}
                placeholder="Example: 4ft planted tank with cabinet, low maintenance setup, budget under Rs.35,000"
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={handleSendCustomTankRequest}
                className={`${enquiryCtaButtonClass} mt-3 h-10 w-full gap-2 px-4 text-sm`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                  <img src={WhatsIcon} alt="" className="h-4 w-4 object-contain" aria-hidden />
                </span>
                Get My Custom Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubcategoryEnquiryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowSubcategoryEnquiryModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Need Guidance?</p>
                <h2 className="text-lg font-semibold text-slate-900">Discover Tailored Options</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSubcategoryEnquiryModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                aria-label="Close enquiry form"
              >
                <img src={closeIcon} alt="" className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="mb-2 text-sm text-slate-600">
                Tell us what you are looking for in <span className="font-semibold text-slate-800">{titleOfListingPage}</span>, and we will suggest suitable products and custom possibilities.
              </p>
              <textarea
                value={subcategoryEnquiry}
                onChange={(event) => setSubcategoryEnquiry(event.target.value)}
                rows={5}
                placeholder="Share your use case, preferred size/specs, and budget range."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={handleSendSubcategoryEnquiry}
                className={`${enquiryCtaButtonClass} mt-3 h-10 w-full gap-2 px-4 text-sm`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                  <img src={WhatsIcon} alt="" className="h-4 w-4 object-contain" aria-hidden />
                </span>
                Request Expert Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {showDescriptionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowDescriptionModal(false);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Collection
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {titleOfListingPage}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDescriptionModal(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                aria-label="Close description"
              >
                <img src={closeIcon} alt="" className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-base text-slate-600">
              {renderFormattedDescription(descriptionText)}
            </div>
          </div>
        </div>
      )}

      {!isSearching && (
        <div className="fixed bottom-5 right-5 z-40">
          <a
            href={`https://wa.me/918667418965?text=${encodeURIComponent(
              `Hi Dream Aquatics, I am interested in ${titleOfListingPage}. Please share details and recommendations.`
            )}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => setShowWhatsAppHint(false)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/80 bg-transparent p-1.5 shadow-lg shadow-emerald-500/35 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Chat on WhatsApp"
          >
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <img src={WhatsIcon} alt="" className="h-full w-full object-contain" aria-hidden="true" />
          </a>
          {showWhatsAppHint && (
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-emerald-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
              <span className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-emerald-600/90" aria-hidden="true" />
              Tap to enquire
            </div>
          )}
        </div>
      )}

    </main>
  );
};

export default CategoryListingPage;

