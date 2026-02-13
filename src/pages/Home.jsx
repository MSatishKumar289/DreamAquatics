import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllProductsWithCategories } from '../lib/catalogApi';
import CategorySection from '../components/CategorySection';
import CategoryCard from '../components/CategoryCard';
import Spinner from '../components/Spinner';
import ProductModal from '../components/ProductModal';
import { useCart } from '../context/CartContext';
import BgImage from '../assets/Images/homebgnew.png';
import CallIcon from '../assets/Images/call.png';
import WhatsIcon from '../assets/Images/whatsapp.jpeg';
import HighlightOne from '../assets/Images/go.jpg';
import HighlightTwo from '../assets/Images/prey.jpg';
import HighlightThree from '../assets/Images/ram.jpg';
import HighlightVideo from '../assets/Videos/video.mp4';
import closeIcon from '../assets/Icons/close_one.png';
import { fetchHomeMedia } from '../lib/homeMediaApi';

const Home = ({ profile }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const categories = ['fishes', 'live-plants', 'accessories', 'tank'];
  const CATEGORY_SLUG_MAP = {
    fishes: 'fishes',
    'live-plants': 'plants',
    accessories: 'accessories',
    tank: 'tanks',
  };
  const instagramUrl = 'https://www.instagram.com/dreamaquatics23/?hl=en';
  const [productsByCategory, setProductsByCategory] = useState({});
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [hasSearchOpened, setHasSearchOpened] = useState(false);
  const [showSearchHint, setShowSearchHint] = useState(false);
  const [homeMedia, setHomeMedia] = useState({
    videoUrl: '',
    imageOneUrl: '',
    imageTwoUrl: ''
  });
  const searchInputRef = useRef(null);

  const categoryOptions = [
    { value: 'all', label: 'All categories' },
    { value: 'fishes', label: 'Fishes' },
    { value: 'live-plants', label: 'Live Plants' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'tank', label: 'Tank' }
  ];

  const renderCategoryIcon = (value) => {
    switch (value) {
      case 'fishes':
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 12c2.5-3 7-5 12-4l4 4-4 4c-5 1-9.5-1-12-4Z" />
            <circle cx="10" cy="12" r="1" fill="currentColor" />
          </svg>
        );
      case 'live-plants':
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 20V6" />
            <path d="M12 12c-3-1-4-3-4-6 3 1 4 3 4 6Z" />
            <path d="M12 14c3-1 4-3 4-6-3 1-4 3-4 6Z" />
          </svg>
        );
      case 'accessories':
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M14 6l4 4-8 8H6v-4l8-8Z" />
            <path d="M13 7l4 4" />
          </svg>
        );
      case 'tank':
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

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allProducts.filter((product) => {
      const title = (product.name || product.title || '').toLowerCase();
      const subcategory = (product.subcategory?.name || '').toLowerCase();
      const matchCategory =
        searchCategory === 'all'
          ? true
          : CATEGORY_SLUG_MAP[searchCategory] === product.subcategory?.category?.slug;
      return matchCategory && (title.includes(query) || subcategory.includes(query));
    });
  }, [allProducts, searchCategory, searchQuery, CATEGORY_SLUG_MAP]);

  useEffect(() => {
    let active = true;
    const loadHomeMedia = async () => {
      const { data, error } = await fetchHomeMedia();
      if (!active) return;
      if (error) {
        console.error('Failed to load home media settings', error);
        return;
      }
      setHomeMedia({
        videoUrl: data?.video_url || '',
        imageOneUrl: data?.image_one_url || '',
        imageTwoUrl: data?.image_two_url || ''
      });
    };

    loadHomeMedia();

    async function loadProducts() {
      try {
        const { data, error } = await fetchAllProductsWithCategories();
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        const groupedBySubcategory = {
          fishes: {},
          'live-plants': {},
          accessories: {},
          tank: {},
        };

        // console.log("data: ", data);
        if (data?.length) {
          data.forEach((product) => {
            const dbCategorySlug = product.subcategory?.category?.slug;
            const subcategoryId = product.subcategory?.id;
            const subcategoryName = product.subcategory?.name; 
            
            const uiCategoryKey = Object.keys(CATEGORY_SLUG_MAP).find(
              (key) => CATEGORY_SLUG_MAP[key] === dbCategorySlug
            );

            if (!uiCategoryKey || !subcategoryId) return;

            if (!groupedBySubcategory[uiCategoryKey][subcategoryId]) {
              groupedBySubcategory[uiCategoryKey][subcategoryId] = [];
            }

            groupedBySubcategory[uiCategoryKey][subcategoryId].push(product);
          });
        }

        const counts = categories.reduce((acc, categoryKey) => {
          acc[categoryKey] = Object.keys(groupedBySubcategory[categoryKey] || {}).length;
          return acc;
        }, {});

        const mapped = categories.reduce((acc, categoryKey) => {
          const subcategoryGroups = Object.values(groupedBySubcategory[categoryKey] || {});

          const subcategoryCards = subcategoryGroups
            .map((group) => {
              if (!group.length) return null;

              const latestProduct = group.reduce((latest, current) => {
                if (!latest) return current;
                return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
              }, null);

              const minPrice = group.reduce((min, current) => {
                const priceValue = Number(current?.price);
                if (!Number.isFinite(priceValue)) return min;
                if (min === null) return priceValue;
                return priceValue < min ? priceValue : min;
              }, null);

              const subcategory = latestProduct?.subcategory;
              if (!subcategory?.id) return null;

              return {
                subcategoryId: subcategory.id,
                subcategoryName: subcategory.name,
                subcategorySlug: subcategory.slug,
                latestProductDate: latestProduct?.created_at || '',
                image: latestProduct?.product_images?.[0]?.url || '',
                itemCount: group.length,
                startFromPrice: minPrice
              };
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b.latestProductDate) - new Date(a.latestProductDate))
            .slice(0, 4);

          acc[categoryKey] = subcategoryCards;
          return acc;
        }, {});

        setProductsByCategory(mapped);
        setSubcategoryCounts(counts);
        setAllProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleHomeMediaUpdated = (event) => {
      const detail = event.detail || {};
      setHomeMedia({
        videoUrl: detail.videoUrl || '',
        imageOneUrl: detail.imageOneUrl || '',
        imageTwoUrl: detail.imageTwoUrl || ''
      });
    };

    window.addEventListener('dreamAquaticsHomeMediaUpdated', handleHomeMediaUpdated);
    return () => window.removeEventListener('dreamAquaticsHomeMediaUpdated', handleHomeMediaUpdated);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    setIsSearchCollapsed(true);
    setHasSearchOpened(false);
    setShowSearchHint(!isDesktop);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const isDesktop = window.innerWidth >= 768;
      if (isSearching) return;
      if (window.scrollY > 0) {
        searchInputRef.current?.blur();
        setIsSearchCollapsed(true);
        return;
      }
      if (!isDesktop) {
        setIsSearchCollapsed(true);
        return;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasSearchOpened, searchQuery, isSearching]);

  useEffect(() => {
    if (hasSearchOpened) return;
    setShowSearchHint(true);
    const timer = setTimeout(() => setShowSearchHint(false), 4000);
    return () => clearTimeout(timer);
  }, [hasSearchOpened]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (searchInputRef.current === document.activeElement) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery]);

  const highlightVideoSrc = homeMedia.videoUrl || HighlightVideo;
  const highlightImageOne = homeMedia.imageOneUrl || HighlightTwo;
  const highlightImageTwo = homeMedia.imageTwoUrl || HighlightThree;
  const highlightPoster = homeMedia.imageOneUrl || HighlightOne;

  return (
    <main className="min-h-screen bg-transparent pb-12">
      <section className="fixed inset-x-0 top-16 z-40 px-4 pt-0 sm:px-6 md:top-20">
        <div className="container mx-auto flex justify-center md:justify-start">
          <div
            className={`relative mt-[5px] mb-[10px] w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:flex sm:items-center sm:justify-between sm:gap-4 ${
              isSearchCollapsed
                ? "translate-x-2 rounded-full bg-transparent px-0 py-0 shadow-none ring-0"
                : "translate-x-0 h-[65px] rounded-2xl border border-slate-200 bg-white/95 px-3 pt-2 pb-0 shadow-sm ring-1 ring-slate-100 sm:h-auto sm:px-4 sm:py-3"
            }`}
          >
            <div
              className={`flex w-full max-w-4xl items-center gap-2 mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isSearchCollapsed
                  ? "pointer-events-none -translate-y-3 scale-[0.98] opacity-0"
                  : "translate-y-0 scale-100 opacity-100"
              }`}
            >
              <div className="relative flex h-9 w-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white sm:h-10 sm:w-14">
                <span className="pointer-events-none text-slate-600">
                  {renderCategoryIcon(searchCategory)}
                </span>
                <span className="pointer-events-none text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <select
                  value={searchCategory}
                  onChange={(event) => setSearchCategory(event.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer bg-transparent text-transparent focus:outline-none"
                  aria-label="Search category"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-slate-700">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:py-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for products"
                  ref={searchInputRef}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full bg-transparent pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
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
                    className="pointer-events-none absolute right-3 h-6 w-6 text-slate-400"
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
              className={`absolute top-1/2 flex -translate-y-1/2 items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isSearchCollapsed
                  ? "right-3 -translate-y-3 scale-100 opacity-100"
                  : "pointer-events-none translate-y-3 scale-[0.98] opacity-0"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setHasSearchOpened(true);
                  setShowSearchHint(false);
                  navigate("/search");
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Open search"
              >
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
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
                <div className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                  <span className="absolute left-full top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-blue-600/90" aria-hidden="true" />
                  Tap to search
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div
        className={`${isSearchCollapsed ? "h-0" : "h-[78px]"} md:h-0`}
        aria-hidden="true"
      />

      {!isSearching && (
      <section className="relative overflow-hidden pt-4 pb-6 md:pb-8">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 hidden scale-105 bg-cover bg-center blur-[2px] md:block"
            style={{ backgroundImage: `url(${BgImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0 left-1/2 w-screen -translate-x-1/2 scale-105 bg-cover bg-center blur-[2px] md:hidden"
            style={{ backgroundImage: `url(${BgImage})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/45 to-black/35" aria-hidden />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-6 px-3 text-white sm:px-4 md:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.45)] backdrop-blur lg:px-10">
            <div className="space-y-3 text-center">
              <h1 className="text-[1.5rem] font-semibold leading-tight whitespace-nowrap sm:text-[2.2rem] md:text-[2.6rem] text-blue-600">
                <span className="font-semibold text-blue-600">Exclusive and Exotics</span>
              </h1>
              <p className="text-base font-semibold text-white">
                Welcome to the wonderful world of fish keeping. Your trusted source for exotic aquarium fishes with expert advice and nationwide shipping.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center shadow-inner shadow-sky-900/30 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] line-clamp-2">
                  Custom-built aquariums
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                 An elegant custom aquarium with a timeless aesthetic, tailored to your space and style, creating a stunning aquatic centerpiece. 
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center shadow-inner shadow-sky-900/30 backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] line-clamp-2">
                  Professional maintenance
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Scheduled care, water checks, and quick cleanups to keep your aquarium crystal clear and stress-free.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-center">
              <a
                href="tel:+918667418965"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sky-900 shadow-lg transition hover:-translate-y-0.5 md:text-base"
              >
                <img src={CallIcon} alt="" className="h-5 w-5 object-contain" aria-hidden />
                Call us
              </a>
              <a
                href="https://wa.me/918667418965"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/80 bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 md:text-base"
              >
                <img src={WhatsIcon} alt="" className="h-5 w-5 rounded-full object-contain" aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[32px] border border-white/15 bg-white/10 p-6 text-center shadow-[0_25px_80px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
                Store highlights
              </p>
              <p className="text-xl font-semibold text-white">This week at the studio</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 h-40 overflow-hidden rounded-2xl border border-white/10">
                <video
                  src={highlightVideoSrc}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  poster={highlightPoster}
                />
              </div>
              <button
                type="button"
                className="relative h-32 overflow-hidden rounded-2xl border border-white/10 focus:outline-none"
                onClick={() => setActiveHighlight(highlightImageOne)}
                aria-label="Enlarge highlight image"
              >
                <img src={highlightImageOne} alt="Highlight koi" className="h-full w-full object-cover" />
                <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow">
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
                </span>
              </button>
              <button
                type="button"
                className="relative h-32 overflow-hidden rounded-2xl border border-white/10 focus:outline-none"
                onClick={() => setActiveHighlight(highlightImageTwo)}
                aria-label="Enlarge highlight image"
              >
                <img src={highlightImageTwo} alt="Highlight detail" className="h-full w-full object-cover" />
                <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow">
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
                </span>
              </button>
            </div>
            <div className="mt-2 flex justify-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_12px_40px_rgba(236,72,153,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 focus:ring-offset-white"
                >
                  <span className="absolute inset-0 bg-white/15 opacity-0 transition duration-300 hover:opacity-100" aria-hidden />
                  Follow us on Instagram
                </a>
                <a
                  href="https://chat.whatsapp.com/DiUn2Tr4sP8LuKAUoq1xpx"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/80 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
                >
                  <img src={WhatsIcon} alt="" className="h-4 w-4 rounded-full object-contain" aria-hidden />
                  Join community
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {isSearching && (
        <section className="container mx-auto px-4 pt-24 sm:px-6 md:pt-28">
          <div className="rounded-3xl bg-white/80 px-4 py-6 shadow-inner ring-1 ring-sky-100/60 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Search results
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {searchResults.length} items found
                </h2>
              </div>
            </div>

            <div className="mt-5">
              {searchResults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  <p className="text-sm font-semibold text-slate-700">
                    Didn’t find what you were looking for?
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Tell us what you need and we will help you find it.
                  </p>
                  <a
                    href={`https://wa.me/918667418965?text=${encodeURIComponent(
                      `Hi, I'm looking for ${searchQuery.trim() || 'a product'} — please share the details.`
                    )}`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/80 bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
                  >
                    <img src={WhatsIcon} alt="" className="h-4 w-4 rounded-full object-contain" aria-hidden />
                    WhatsApp us
                  </a>
                </div>
              ) : (
                <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
                  {searchResults.map((product) => (
                    <div key={product.id} className="mb-4 break-inside-avoid">
                      <CategoryCard
                        categoryName={
                          Object.keys(CATEGORY_SLUG_MAP).find(
                            (key) => CATEGORY_SLUG_MAP[key] === product.subcategory?.category?.slug
                          ) || 'fishes'
                        }
                        product={product}
                        showStockBadge
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!isSearching && (loading ? (
        <Spinner />
      ) : (
        categories.map((category) => (
          <CategorySection
            key={category}
            categoryName={category}
            products={productsByCategory[category] || []}
            subcategoryCount={subcategoryCounts[category] || 0}
          />
        ))
      ))}
      {activeHighlight && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setActiveHighlight(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveHighlight(null)}
              className="absolute right-4 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              aria-label="Close image preview"
            >
              <img src={closeIcon} alt="" className="h-5 w-5" aria-hidden="true" />
            </button>
            <img
              src={activeHighlight}
              alt="Highlight preview"
              className="max-h-[80vh] w-full object-contain"
            />
          </div>
        </div>
      )}
      <ProductModal
        isOpen={isProductOpen}
        product={selectedProduct}
        onClose={() => setIsProductOpen(false)}
        onAddToCart={(product, qty) => addToCart(product, qty)}
      />
    </main>
  );
};

export default Home;


