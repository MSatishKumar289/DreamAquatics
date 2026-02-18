import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllProductsWithCategories } from '../lib/catalogApi';
import CategorySection from '../components/CategorySection';
import CategoryCard from '../components/CategoryCard';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import BgImage from '../assets/Images/homebgnew.png';
import quickPickNewArrivals from '../assets/QuickPicks/new-arrivals-card.svg';
import quickPickUnder100 from '../assets/QuickPicks/under-100-card.svg';
import quickPickTrending from '../assets/QuickPicks/trending-card.svg';
import quickPickEssentials from '../assets/QuickPicks/essentials-card.svg';
import CallIcon from '../assets/Icons/phone.png';
import WhatsIcon from '../assets/Icons/whatsapp.png';
import HighlightOne from '../assets/Images/go.jpg';
import HighlightTwo from '../assets/Images/prey.jpg';
import HighlightThree from '../assets/Images/ram.jpg';
import HighlightVideo from '../assets/Videos/video.mp4';
import closeIcon from '../assets/Icons/close_one.png';
import plusIcon from '../assets/Icons/plus.png';
import incPlusIcon from '../assets/Icons/iplus.png';
import incMinusIcon from '../assets/Icons/iminus.png';
import mapIcon from '../assets/Icons/map.png';
import arrowIcon from '../assets/Icons/arrow.png';
import bestSellerIcon from '../assets/Icons/BestSeller.png';
import { fetchHomeMedia } from '../lib/homeMediaApi';
import fishCategoryVisual from '../assets/Images/Home/fish.png';
import accessoriesCategoryVisual from '../assets/Images/Home/Accessories.png';
import plantCategoryVisual from '../assets/Images/Home/plant.png';
import tankCategoryVisual from '../assets/Images/Home/tank.png';

const Home = ({ profile }) => {
  const { cartItems, addToCart, updateQty, removeItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  const categories = ['fishes', 'live-plants', 'accessories', 'tank'];
  const CATEGORY_SLUG_MAP = {
    fishes: 'fishes',
    'live-plants': 'plants',
    accessories: 'accessories',
    tank: 'tanks',
  };
  const storeMapUrl = 'https://maps.app.goo.gl/FufcQNMgRY59zTPd6';
  const instagramUrl = 'https://www.instagram.com/dreamaquatics23/?hl=en';
  const [productsByCategory, setProductsByCategory] = useState({});
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true);
  const [hasSearchOpened, setHasSearchOpened] = useState(false);
  const [showSearchHint, setShowSearchHint] = useState(false);
  const [bestFishAddedHintIndex, setBestFishAddedHintIndex] = useState(null);
  const [bestSellerArrowHintSide, setBestSellerArrowHintSide] = useState(null);
  const [pendingBestFishRemove, setPendingBestFishRemove] = useState(null);
  const [bestSellerIndex, setBestSellerIndex] = useState(0);
  const [quickPickIndex, setQuickPickIndex] = useState(0);
  const [quickPickScrollProgress, setQuickPickScrollProgress] = useState(0);
  const [quickPickVisibleCount, setQuickPickVisibleCount] = useState(1);
  const [showFloatingWhatsApp, setShowFloatingWhatsApp] = useState(false);
  const [homeMedia, setHomeMedia] = useState({
    videoUrl: '',
    imageOneUrl: '',
    imageTwoUrl: ''
  });
  const searchInputRef = useRef(null);
  const bestSellerSlideRefs = useRef([]);
  const bestSellerTrackRef = useRef(null);
  const bestSellerScrollRafRef = useRef(null);
  const bestSellerProgrammaticUntilRef = useRef(0);
  const quickPickTrackRef = useRef(null);
  const quickPickItemRefs = useRef([]);
  const quickPickScrollRafRef = useRef(null);
  const quickPickInitRef = useRef(false);
  const newArrivalsSectionRef = useRef(null);
  const trendingSectionRef = useRef(null);
  const underHundredSectionRef = useRef(null);
  const essentialsSectionRef = useRef(null);
  const heroSectionRef = useRef(null);

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
    const loadingGuardTimer = window.setTimeout(() => {
      if (active) {
        setLoading(false);
      }
    }, 15000);
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
            .sort((a, b) => new Date(b.latestProductDate) - new Date(a.latestProductDate));

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
      window.clearTimeout(loadingGuardTimer);
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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const sections = Array.from(document.querySelectorAll("[data-home-reveal]"));
    if (!sections.length) return undefined;

    sections.forEach((section) => {
      section.classList.add("home-scroll-animate");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          if (entry.isIntersecting) {
            element.classList.remove("home-scroll-fade-in");
            void element.offsetWidth;
            element.classList.add("home-scroll-revealed", "home-scroll-fade-in");
            return;
          }
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
          const rect = entry.boundingClientRect;
          const isFullyOutOfView = rect.bottom <= 0 || rect.top >= viewportHeight;
          if (!isFullyOutOfView) return;
          element.classList.remove("home-scroll-fade-in");
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [allProducts.length]);

  useEffect(() => {
    if (bestFishAddedHintIndex === null) return;
    const timer = setTimeout(() => setBestFishAddedHintIndex(null), 1600);
    return () => clearTimeout(timer);
  }, [bestFishAddedHintIndex]);

  useEffect(() => {
    if (typeof window === "undefined" || isSearching) {
      setShowFloatingWhatsApp(false);
      return undefined;
    }
    const hero = heroSectionRef.current;
    if (!hero) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingWhatsApp(!entry.isIntersecting);
      },
      { threshold: 0.08 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isSearching]);

  const highlightVideoSrc = homeMedia.videoUrl || HighlightVideo;
  const highlightImageOne = homeMedia.imageOneUrl || HighlightTwo;
  const highlightImageTwo = homeMedia.imageTwoUrl || HighlightThree;
  const highlightPoster = homeMedia.imageOneUrl || HighlightOne;
  const categoryBySlug = useMemo(
    () =>
      Object.entries(CATEGORY_SLUG_MAP).reduce((acc, [uiKey, slug]) => {
        acc[slug] = uiKey;
        return acc;
      }, {}),
    [CATEGORY_SLUG_MAP]
  );

  const getRelatedProductsFor = (baseProduct) => {
    const subcategoryId = baseProduct?.subcategory?.id;
    if (!subcategoryId) return [];
    return allProducts.filter((item) => item?.subcategory?.id === subcategoryId);
  };

  const newArrivals = useMemo(() => {
    const sorted = [...allProducts].sort(
      (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    );

    const picks = [];
    const usedIds = new Set();

    // Prefer one latest item per category (up to 4).
    categories.forEach((categoryKey) => {
      const dbSlug = CATEGORY_SLUG_MAP[categoryKey];
      const match = sorted.find(
        (product) =>
          !usedIds.has(product?.id) &&
          product?.subcategory?.category?.slug === dbSlug
      );
      if (match) {
        picks.push(match);
        usedIds.add(match.id);
      }
    });

    // If fewer than 4, fill with next latest items from available categories.
    if (picks.length < 4) {
      for (const product of sorted) {
        if (picks.length >= 4) break;
        if (usedIds.has(product?.id)) continue;
        picks.push(product);
        usedIds.add(product.id);
      }
    }

    return picks.slice(0, 4);
  }, [allProducts, categories, CATEGORY_SLUG_MAP]);

  const bestSellerPicks = useMemo(() => {
    const sorted = [...allProducts].sort(
      (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    );
    const fishes = sorted
      .filter((product) => product?.subcategory?.category?.slug === CATEGORY_SLUG_MAP.fishes)
      .slice(0, 4);
    const accessories = sorted
      .filter((product) => product?.subcategory?.category?.slug === CATEGORY_SLUG_MAP.accessories)
      .slice(0, 4);

    const primary = [...fishes, ...accessories];
    const usedIds = new Set(primary.map((product) => product?.id));
    if (primary.length >= 8) return primary.slice(0, 8);

    const fallback = sorted.filter((product) => !usedIds.has(product?.id));
    return [...primary, ...fallback].slice(0, 8);
  }, [allProducts, CATEGORY_SLUG_MAP]);

  useEffect(() => {
    if (!bestSellerPicks.length) {
      setBestSellerIndex(0);
      return;
    }
    if (bestSellerIndex >= bestSellerPicks.length) {
      setBestSellerIndex(0);
    }
  }, [bestSellerPicks, bestSellerIndex]);

  const activeBestSeller = bestSellerPicks[bestSellerIndex] || null;
  const bestFishCurrentPrice = Number(activeBestSeller?.price) || 0;
  const bestFishOriginalPrice =
    Number(activeBestSeller?.original_price ?? activeBestSeller?.mrp ?? activeBestSeller?.price) || 0;
  const bestFishSavings = Math.max(0, bestFishOriginalPrice - bestFishCurrentPrice);
  const bestFishStockCount = Number.isFinite(Number(activeBestSeller?.stock_count))
    ? Number(activeBestSeller?.stock_count)
    : null;
  const bestFishAvailabilityText = String(activeBestSeller?.availability || activeBestSeller?.status || '').toLowerCase();
  const isBestFishSoldOut = bestFishStockCount !== null
    ? bestFishStockCount <= 0
    : /out|sold/.test(bestFishAvailabilityText);
  const bestFishQty =
    cartItems?.find((item) => item.id === activeBestSeller?.id)?.qty || 0;

  useEffect(() => {
    if (!activeBestSeller || typeof window === "undefined") return undefined;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop || bestSellerPicks.length <= 1) {
      setBestSellerArrowHintSide(null);
      return undefined;
    }

    if (bestSellerIndex === 0) {
      setBestSellerArrowHintSide("right");
    } else if (bestSellerIndex === bestSellerPicks.length - 1) {
      setBestSellerArrowHintSide("left");
    } else {
      setBestSellerArrowHintSide(null);
      return undefined;
    }

    const timer = window.setTimeout(() => setBestSellerArrowHintSide(null), 2000);
    return () => window.clearTimeout(timer);
  }, [activeBestSeller, bestSellerIndex, bestSellerPicks.length]);

  useEffect(() => {
    return () => {
      if (bestSellerScrollRafRef.current) {
        window.cancelAnimationFrame(bestSellerScrollRafRef.current);
      }
      if (quickPickScrollRafRef.current) {
        window.cancelAnimationFrame(quickPickScrollRafRef.current);
      }
    };
  }, []);

  const handleBestSellerTrackScroll = () => {
    if (Date.now() < bestSellerProgrammaticUntilRef.current) return;
    if (bestSellerScrollRafRef.current) return;
    bestSellerScrollRafRef.current = window.requestAnimationFrame(() => {
      bestSellerScrollRafRef.current = null;
      const track = bestSellerTrackRef.current;
      if (!track) return;
      const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      const currentScrollLeft = track.scrollLeft;
      const edgeTolerance = 2;

      if (currentScrollLeft <= edgeTolerance) {
        setBestSellerIndex((prev) => (prev === 0 ? prev : 0));
        return;
      }

      if (currentScrollLeft >= maxScrollLeft - edgeTolerance) {
        const lastIndex = Math.max(0, bestSellerPicks.length - 1);
        setBestSellerIndex((prev) => (prev === lastIndex ? prev : lastIndex));
        return;
      }

      const trackCenter = currentScrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      bestSellerSlideRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(cardCenter - trackCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setBestSellerIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    });
  };

  const goToBestSeller = (nextIndex) => {
    if (!bestSellerPicks.length) return;
    const clampedIndex = Math.max(0, Math.min(nextIndex, bestSellerPicks.length - 1));
    if (clampedIndex === bestSellerIndex) return;
    bestSellerProgrammaticUntilRef.current = Date.now() + 420;
    const track = bestSellerTrackRef.current;
    const target = bestSellerSlideRefs.current?.[clampedIndex];
    if (track && target) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    setBestSellerIndex(clampedIndex);
  };

  const handleQuickPickTrackScroll = () => {
    if (quickPickScrollRafRef.current) return;
    quickPickScrollRafRef.current = window.requestAnimationFrame(() => {
      quickPickScrollRafRef.current = null;
      const track = quickPickTrackRef.current;
      if (!track) return;
      const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
      const progress = Math.max(0, Math.min(1, track.scrollLeft / maxScroll));
      setQuickPickScrollProgress((prev) => (Math.abs(prev - progress) < 0.005 ? prev : progress));
      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      quickPickItemRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - trackCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setQuickPickIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    });
  };

  const purposeCollections = useMemo(() => {
    const picks = [
      {
        key: "beginner",
        title: "Beginner Friendly",
        matcher: (text) => /easy|beginner|starter|hardy|peaceful/i.test(text),
      },
      {
        key: "low-maintenance",
        title: "Low Maintenance",
        matcher: (text) => /low maintenance|easy care|hardy|peaceful/i.test(text),
      },
      {
        key: "colorful",
        title: "Colorful Picks",
        matcher: (text) => /guppy|tetra|betta|molly|koi|color/i.test(text),
      },
      {
        key: "planted",
        title: "Plant Lovers",
        matcher: (text) => /plant|moss|aquascape|fertilizer|co2/i.test(text),
      },
    ];

    return picks
      .map((pick) => ({
        ...pick,
        items: allProducts
          .filter((product) => {
            const text = `${product?.name || ""} ${product?.subtitle || ""} ${product?.description || ""}`;
            return pick.matcher(text);
          })
          .slice(0, 6),
      }))
      .filter((pick) => pick.items.length > 0);
  }, [allProducts]);

  const medicineAndFilterPicks = useMemo(() => {
    const accessories = allProducts.filter(
      (product) => product?.subcategory?.category?.slug === 'accessories'
    );
    const filterItems = accessories.filter((product) => {
      const text = `${product?.name || ''} ${product?.subcategory?.name || ''}`.toLowerCase();
      return text.includes('filter');
    });
    return (filterItems.length ? filterItems : accessories).slice(0, 4);
  }, [allProducts]);

  const smartSections = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const toNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };
    const textOf = (product) =>
      `${product?.name || ''} ${product?.subtitle || ''} ${product?.subcategory?.name || ''} ${product?.description || ''}`.toLowerCase();
    const isInStock = (product) => {
      const count = toNumber(product?.stock_count);
      const status = String(product?.availability || product?.status || '').toLowerCase();
      if (count !== null) return count > 0;
      return !/out|sold/.test(status);
    };
    const byNewest = (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0);

    const rules = [
      {
        key: 'under-100',
        title: 'Under \u20B9100',
        subtitle: 'Budget Friendly',
        filter: (p) => {
          const price = toNumber(p?.price);
          return price !== null && price <= 100;
        },
        sort: (a, b) => (toNumber(a?.price) ?? Number.MAX_SAFE_INTEGER) - (toNumber(b?.price) ?? Number.MAX_SAFE_INTEGER),
      },
      {
        key: 'trending',
        title: 'Trending Now',
        subtitle: 'Popular Picks',
        filter: (p) => isInStock(p),
        sort: byNewest,
      },
    ];

    return rules
      .map((rule) => ({
        ...rule,
        items: allProducts.filter(rule.filter).sort(rule.sort).slice(0, 4),
      }))
      .filter((section) => section.items.length > 0);
  }, [allProducts]);

  const careCollections = useMemo(() => {
    const detectCareLevel = (product) => {
      const text = `${product?.name || ""} ${product?.subtitle || ""} ${product?.description || ""}`.toLowerCase();
      if (/(advanced|expert|difficult|sensitive|delicate)/.test(text)) return "advanced";
      if (/(moderate|intermediate|semi)/.test(text)) return "moderate";
      if (/(easy|beginner|peaceful|hardy|low maintenance)/.test(text)) return "easy";
      const price = Number(product?.price);
      if (!Number.isFinite(price)) return "easy";
      if (price <= 150) return "easy";
      if (price <= 500) return "moderate";
      return "advanced";
    };

    const grouped = { easy: [], moderate: [], advanced: [] };
    allProducts.forEach((product) => {
      grouped[detectCareLevel(product)].push(product);
    });

    return [
      { key: "easy", title: "Easy Care", items: grouped.easy.slice(0, 6) },
      { key: "moderate", title: "Moderate Care", items: grouped.moderate.slice(0, 6) },
      { key: "advanced", title: "Advanced Care", items: grouped.advanced.slice(0, 6) },
    ].filter((group) => group.items.length > 0);
  }, [allProducts]);

  const categoryShowcaseCards = useMemo(() => {
    const tints = {
      fishes: 'from-[#0F3A69]/70 via-[#1B5D9E]/30 to-transparent',
      'live-plants': 'from-[#1A4A2D]/70 via-[#2F7D51]/30 to-transparent',
      accessories: 'from-[#5B4325]/70 via-[#8D6A3D]/30 to-transparent',
      tank: 'from-[#0D4A63]/70 via-[#157BA4]/30 to-transparent',
    };
    const titleMap = {
      fishes: 'Fishes',
      'live-plants': 'Live Plants',
      accessories: 'Accessories',
      tank: 'Tanks & Bowls',
    };
    const visualMap = {
      fishes: fishCategoryVisual,
      'live-plants': plantCategoryVisual,
      accessories: accessoriesCategoryVisual,
      tank: tankCategoryVisual,
    };

    return categories.map((categoryKey) => {
      const dbSlug = CATEGORY_SLUG_MAP[categoryKey];
      const productsForCategory = allProducts
        .filter((product) => product?.subcategory?.category?.slug === dbSlug)
        .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0));

      const images = productsForCategory
        .map((product) => product?.product_images?.[0]?.url || product?.image)
        .filter(Boolean)
        .slice(0, 3);
      const recentProduct = productsForCategory[0] || null;

      const minPrice = productsForCategory.reduce((min, product) => {
        const value = Number(product?.price);
        if (!Number.isFinite(value)) return min;
        if (min === null) return value;
        return value < min ? value : min;
      }, null);

      return {
        id: categoryKey,
        title: titleMap[categoryKey] || categoryKey,
        target: `/category/${categoryKey}`,
        images,
        recentImage: recentProduct?.product_images?.[0]?.url || recentProduct?.image || images[0] || '',
        recentName: recentProduct?.name || '',
        count: subcategoryCounts?.[categoryKey] || 0,
        startFrom: minPrice,
        tint: tints[categoryKey] || 'from-black/50 via-black/20 to-transparent',
        visualImage: visualMap[categoryKey] || recentProduct?.product_images?.[0]?.url || recentProduct?.image || images[0] || BgImage,
      };
    });
  }, [allProducts, categories, subcategoryCounts, CATEGORY_SLUG_MAP]);

  const homeShortcutCircles = useMemo(() => {
    return [
      {
        key: "new-arrivals",
        title: "New Arrivals",
        image: quickPickNewArrivals,
      },
      {
        key: "under-100",
        title: "Under \u20B9100",
        image: quickPickUnder100,
      },
      {
        key: "trending",
        title: "Trending",
        image: quickPickTrending,
      },
      {
        key: "essentials",
        title: "Essentials",
        image: quickPickEssentials,
      },
    ].filter((item) => Boolean(item.image));
  }, []);

  useEffect(() => {
    const measureQuickPickVisibleCount = () => {
      const track = quickPickTrackRef.current;
      const firstCard = quickPickItemRefs.current.find(Boolean);
      if (!track || !firstCard) {
        setQuickPickVisibleCount((prev) => (prev === 1 ? prev : 1));
        return;
      }
      const visible = Math.max(1, Math.round(track.clientWidth / firstCard.clientWidth));
      setQuickPickVisibleCount((prev) => (prev === visible ? prev : visible));
    };

    const raf = window.requestAnimationFrame(measureQuickPickVisibleCount);
    window.addEventListener('resize', measureQuickPickVisibleCount);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', measureQuickPickVisibleCount);
    };
  }, [homeShortcutCircles]);

  useEffect(() => {
    if (!homeShortcutCircles.length) {
      setQuickPickIndex(0);
      setQuickPickScrollProgress(0);
      quickPickInitRef.current = false;
      return;
    }
    const useCompactIndicatorMode =
      homeShortcutCircles.length >= 4 && quickPickVisibleCount >= 3 && quickPickVisibleCount <= 4;
    if (!quickPickInitRef.current) {
      setQuickPickIndex(useCompactIndicatorMode ? 1 : 0);
      quickPickInitRef.current = true;
      return;
    }
    if (quickPickIndex >= homeShortcutCircles.length) {
      setQuickPickIndex(useCompactIndicatorMode ? 1 : 0);
    }
  }, [homeShortcutCircles, quickPickIndex, quickPickVisibleCount]);

  const goToHomeShortcut = (key) => {
    const scrollWithOffset = (element) => {
      if (!element) return;
      const stickyOffset = window.innerWidth >= 768 ? 150 : 120;
      const top = element.getBoundingClientRect().top + window.scrollY - stickyOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };
    const targets = {
      "new-arrivals": newArrivalsSectionRef.current,
      "under-100": underHundredSectionRef.current,
      trending: trendingSectionRef.current,
      essentials: essentialsSectionRef.current,
    };
    scrollWithOffset(targets[key]);
  };

  const TopicTitleCard = ({ title, subtitle, className = "", variant = "sale-ribbon", tone = "default" }) => {
    const hexToRgb = (hex) => {
      const clean = String(hex || "").replace("#", "");
      if (clean.length !== 6) return { r: 10, g: 61, b: 108 };
      const value = parseInt(clean, 16);
      return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
      };
    };
    const toRgba = (hex, alpha) => {
      const { r, g, b } = hexToRgb(hex);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    // Keep strong color until ~20px after the yellow title box, then fade.
    const holdPx = Math.min(560, 24 + title.length * 20 + 20);
    const fadePx = holdPx + 110;

    if (variant === "minimal-stripe") {
      const toneMap = {
        "new-arrivals": {
          strong: "#FF005C",
          ribbon: "from-[#FFE600] via-[#FFDE00] to-[#FFD400]",
        },
        "under-100": {
          strong: "#00A84F",
          ribbon: "from-[#00A84F] via-[#009748] to-[#00843F]",
          text: "text-white",
        },
        trending: {
          strong: "#6B1DD2",
          ribbon: "from-[#FFB100] to-[#FFC62B]",
        },
        essentials: {
          strong: "#EF6A00",
          ribbon: "from-[#FFE35A] to-[#FFD74A]",
        },
        default: {
          strong: "#0A3D6C",
          ribbon: "from-[#FFD74D] via-[#FFCD38] to-[#FFB31A]",
        },
      };
      const selectedTone = toneMap[tone] || toneMap.default;
      return (
        <div
          className={`relative overflow-hidden rounded-2xl border-l-[8px] border-l-[#D4AF37] bg-gradient-to-r from-white via-[#FFFDF5] to-[#F4F8FF] px-3 py-1 text-left shadow-[0_8px_20px_rgba(15,23,42,0.08)] sm:px-4 sm:py-1.5 ${className}`}
        >
          <div className="pointer-events-none absolute -right-8 -top-7 h-24 w-24 rotate-12 bg-white/0" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-16 w-24 -skew-x-[24deg] bg-white/0" />
          <h2 className="relative text-lg font-semibold sm:text-xl">
            <span className={`inline-block -skew-x-[10deg] rounded-[3px] bg-gradient-to-r ${selectedTone.ribbon} px-3 py-0.5`}>
              <span
                className={`inline-block skew-x-[10deg] ${selectedTone.text || "text-[#0D2F5A]"}`}
                style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
              >
                {title}
              </span>
            </span>
          </h2>
          <span className="relative mt-0.5 block text-xs font-semibold uppercase tracking-[0.16em]">
            <span className="inline-block -skew-x-[10deg] rounded-[3px] bg-white px-2 py-0.5">
              <span
                className="inline-block skew-x-[10deg] text-[#0D2F5A]"
                style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
              >
                {subtitle}
              </span>
            </span>
          </span>
        </div>
      );
    }

    return (
      <div
        className={`relative overflow-hidden rounded-2xl border-l-[8px] border-l-[#D4AF37] bg-gradient-to-r from-white via-[#FFFDF5] to-[#F4F8FF] px-3 py-1 text-left shadow-[0_8px_20px_rgba(15,23,42,0.08)] sm:px-4 sm:py-1.5 ${className}`}
      >
        <div className="pointer-events-none absolute -right-12 -top-8 h-32 w-32 rotate-12 bg-fuchsia-300/0" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-16 w-24 -skew-x-[26deg] bg-cyan-300/0" />
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-transparent" />
        <h2 className="relative text-lg font-semibold sm:text-xl">
          <span className="inline-block -skew-x-[12deg] rounded-[3px] bg-gradient-to-r from-[#FFD74D] via-[#FFCD38] to-[#FFB31A] px-2 py-0.5">
            <span
              className="inline-block skew-x-[12deg] text-[#0D2F5A]"
              style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
            >
              {title}
            </span>
          </span>
        </h2>
        <span className="relative mt-0.5 block text-xs font-semibold uppercase tracking-[0.16em]">
          <span className="inline-block -skew-x-[12deg] rounded-[3px] bg-white px-2 py-0.5">
            <span
              className="inline-block skew-x-[12deg] text-[#0D2F5A]"
              style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
            >
              {subtitle}
            </span>
          </span>
        </span>
      </div>
    );
  };

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
                  ? "right-2 md:right-0 lg:-right-4 -translate-y-2 scale-100 opacity-100"
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
      <section ref={heroSectionRef} className="relative overflow-hidden pt-4 pb-6 md:pb-8">
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
          <div className="absolute inset-0 bg-gradient-to-tr from-[#021426]/76 via-[#062746]/58 to-[#0A3A66]/46" aria-hidden />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1600px] gap-4 px-2 text-white sm:px-3 lg:grid-cols-[1.15fr_0.85fr] lg:px-6">
          <div className="relative flex flex-col gap-6 overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-r from-[#04162E]/84 via-[#0B2E57]/78 to-[#0C3D73]/70 px-6 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.5)] backdrop-blur lg:px-10">
            <div className="pointer-events-none absolute -right-12 -top-8 h-36 w-36 rotate-12 rounded-2xl bg-sky-300/18" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-28 -skew-x-[24deg] bg-blue-300/12" />
            <div className="space-y-3 text-center">
              <h1 className="text-[1.5rem] font-semibold leading-tight sm:text-[2.2rem] md:text-[2.6rem]">
                <span className="inline-block -skew-x-[10deg] rounded-[7px] bg-gradient-to-r from-[#0B4FA1] via-[#0A66D9] to-[#3D8EFF] px-5 py-1 shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
                  <span className="inline-block skew-x-[10deg] text-white">Exclusive and Exotics</span>
                </span>
              </h1>
              <p className="mx-auto max-w-4xl rounded-xl bg-white/10 px-4 py-2 text-base font-semibold text-white shadow-inner shadow-sky-900/20">
                Welcome to the wonderful world of fish keeping. Your trusted source for exotic aquarium fishes with expert advice and nationwide shipping.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-[#0B2B4E]/35 to-[#114373]/25 p-4 text-center shadow-[0_10px_22px_rgba(15,23,42,0.24)] backdrop-blur">
                <p className="inline-block -skew-x-[10deg] rounded-[4px] bg-white/90 px-2 py-0.5 text-[16px] font-semibold uppercase tracking-[0.06em] text-[#0D2F5A] sm:px-3 sm:text-sm sm:tracking-[0.16em]">
                  <span className="inline-block skew-x-[10deg]">
                  Custom-built aquariums
                  </span>
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                 An elegant custom aquarium with a timeless aesthetic, tailored to your space and style, creating a stunning aquatic centerpiece. 
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-[#0B2B4E]/35 to-[#114373]/25 p-4 text-center shadow-[0_10px_22px_rgba(15,23,42,0.24)] backdrop-blur">
                <p className="inline-block -skew-x-[10deg] whitespace-nowrap rounded-[4px] bg-white/90 px-2 py-0.5 text-[16px] font-semibold uppercase tracking-[0.06em] text-[#0D2F5A] sm:px-3 sm:text-sm sm:tracking-[0.16em]">
                  <span className="inline-block skew-x-[10deg]">
                  Professional maintenance
                  </span>
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Scheduled care, water checks, and quick cleanups to keep your aquarium crystal clear and stress-free.
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-fit items-center justify-center gap-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-inner shadow-slate-900/30 md:justify-center">
              <a
                href="tel:+918667418965"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/60 bg-white/95 text-sky-900 shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:brightness-105 md:h-14 md:w-14"
                aria-label="Call us"
              >
                <img src={CallIcon} alt="Call us" className="h-6 w-6 object-contain md:h-7 md:w-7" />
              </a>
              <a
                href="https://wa.me/918667418965"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-300/80 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_12px_24px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 hover:brightness-105 md:h-14 md:w-14"
                aria-label="Open WhatsApp"
              >
                <img src={WhatsIcon} alt="WhatsApp" className="h-7 w-7 object-contain" />
              </a>
              <a
                href={storeMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/60 bg-white/95 text-sky-900 shadow-[0_10px_22px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:brightness-105 md:h-14 md:w-14"
                aria-label="Locate us on Google Maps"
              >
                <img src={mapIcon} alt="Locate us" className="h-6 w-6 object-contain" />
              </a>
            </div>
          </div>

          <div className="relative hidden flex-col gap-4 overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-tl from-[#061A35]/82 via-[#123B69]/74 to-[#1D4C82]/68 p-6 text-center shadow-[0_25px_80px_rgba(15,23,42,0.42)] backdrop-blur lg:flex">
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-32 -skew-x-[22deg] bg-blue-200/18" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-32 -skew-x-[24deg] bg-sky-200/14" />
            <div className="space-y-1">
              <p className="inline-block -skew-x-[10deg] rounded-[5px] bg-white px-3 py-0.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#0D2F5A]">
                <span className="inline-block skew-x-[10deg]">Store Highlights</span>
              </p>
              <p className="text-xl font-semibold text-white">
                <span className="inline-block -skew-x-[10deg] rounded-[5px] bg-gradient-to-r from-[#0B4FA1] via-[#0A66D9] to-[#3D8EFF] px-3 py-0.5 text-white">
                  <span className="inline-block skew-x-[10deg]">This Week At The Studio</span>
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 h-40 overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_22px_rgba(15,23,42,0.28)]">
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
                className="relative h-32 overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_18px_rgba(15,23,42,0.25)] focus:outline-none"
                onClick={() => setActiveHighlight(highlightImageOne)}
                aria-label="Enlarge highlight image"
              >
                <img src={highlightImageOne} alt="Highlight koi" className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                className="relative h-32 overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_18px_rgba(15,23,42,0.25)] focus:outline-none"
                onClick={() => setActiveHighlight(highlightImageTwo)}
                aria-label="Enlarge highlight image"
              >
                <img src={highlightImageTwo} alt="Highlight detail" className="h-full w-full object-cover" />
              </button>
            </div>
            <div className="mt-2 flex justify-center">
              <div className="flex w-full max-w-[560px] flex-nowrap items-center justify-center gap-2 sm:gap-3">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="relative inline-flex min-w-0 flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-xl px-2 py-2 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 focus:ring-offset-white sm:px-5"
                >
                  <span className="relative z-10 inline-flex -skew-x-[10deg] items-center gap-1.5 rounded-[4px] bg-gradient-to-r from-[#F56040] via-[#E1306C] to-[#833AB4] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white sm:text-sm">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 skew-x-[10deg]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.4" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
                    </svg>
                    <span className="inline-block skew-x-[10deg]">Follow Us</span>
                  </span>
                </a>
                <a
                  href="https://chat.whatsapp.com/DiUn2Tr4sP8LuKAUoq1xpx"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-2 py-2 transition hover:-translate-y-0.5 sm:px-5"
                >
                  <span className="inline-flex -skew-x-[10deg] items-center gap-1.5 rounded-[4px] bg-gradient-to-r from-[#25D366] to-[#128C7E] px-[18px] py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white sm:px-[22px] sm:text-sm">
                    <img src={WhatsIcon} alt="" className="h-4 w-4 skew-x-[10deg] object-contain" aria-hidden />
                    <span className="inline-block skew-x-[10deg]">Join Community</span>
                  </span>
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
                        relatedProducts={getRelatedProductsFor(product)}
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
        <>
          <section data-home-reveal className="container mx-auto px-4 pt-4 sm:px-6">
            <div className="mb-3 text-center sm:mb-4">
              <p className="inline-block rounded-[4px] bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E4D7A] sm:text-xs">
                Explore
              </p>
              <h2 className="mt-1">
                <span className="inline-block -skew-x-[10deg] rounded-[5px] bg-[#0A66D9] px-4 py-1">
                  <span
                    className="inline-block skew-x-[10deg] text-xl font-semibold text-white sm:text-2xl"
                    style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                  >
                    Shop by Category
                  </span>
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {categoryShowcaseCards.map((card) => {
                const startsFromText =
                  card.startFrom !== null
                    ? `Starts from \u20B9${card.startFrom.toLocaleString("en-IN")}`
                    : "Starts from \u20B9-";
                const visualStyle = "ticket-strip";

                return (
                  <article
                    key={card.id}
                    className="group relative h-[162px] cursor-pointer overflow-hidden rounded-2xl border border-white/35 shadow-[0_10px_24px_rgba(15,23,42,0.16)] sm:h-[130px] lg:h-auto lg:aspect-[3/4] lg:rounded-[24px]"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${card.title}`}
                    onClick={() => navigate(card.target)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(card.target);
                      }
                    }}
                  >
                    <img
                      src={card.visualImage}
                      alt={card.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[#06213D]/45" aria-hidden />
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#9DD8FF]/35 via-[#9DD8FF]/10 to-transparent" aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#031427]/90 via-[#0A2743]/52 to-transparent" aria-hidden />
                    <div className="pointer-events-none absolute -right-10 bottom-8 h-28 w-28 rounded-full bg-cyan-300/18 blur-[48px]" />

                    {visualStyle === "neon-bubble" && (
                      <div className="relative z-10 flex h-full items-center justify-center p-2.5 sm:p-3">
                        <span className="pointer-events-none absolute left-5 top-5 h-2 w-2 rounded-full bg-cyan-100/90" />
                        <span className="pointer-events-none absolute left-8 top-8 h-1.5 w-1.5 rounded-full bg-cyan-100/80" />
                        <div className="relative flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border-2 border-cyan-200/70 bg-[#00B2FF]/40 shadow-[0_0_22px_rgba(56,189,248,0.55)] sm:h-[98px] sm:w-[98px] lg:h-[132px] lg:w-[132px]">
                          <h3
                            className="px-2 text-center text-[0.68rem] font-semibold uppercase leading-tight text-white sm:text-[0.74rem] lg:text-[1.02rem]"
                            style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                          >
                            {card.title}
                          </h3>
                          <p className="mt-1 px-2 text-center text-[0.44rem] font-semibold uppercase tracking-[0.08em] text-cyan-50 sm:text-[0.49rem] lg:text-[0.65rem]">
                            {startsFromText}
                          </p>
                        </div>
                      </div>
                    )}

                    {visualStyle === "ticket-strip" && (
                      <div className="relative z-10 flex h-full items-center justify-center p-4 sm:p-3">
                        <div className="relative w-[92%] max-w-[230px]">
                          <div className="-skew-x-[11deg] rounded-md bg-[#18D26E]/92 px-3.5 py-2 shadow-[0_8px_18px_rgba(22,163,74,0.35)]">
                            <h3
                              className="skew-x-[11deg] text-center text-[0.96rem] font-semibold uppercase leading-tight text-white sm:text-[0.76rem] lg:text-[1.12rem]"
                              style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                            >
                              {card.title}
                            </h3>
                          </div>
                          <div className="mt-2 translate-x-2.5 -skew-x-[11deg] rounded-md bg-white/95 px-3 py-1.5 shadow-[0_8px_16px_rgba(15,23,42,0.28)]">
                            <p className="skew-x-[11deg] text-center text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-[#B8860B] sm:text-[0.5rem] lg:text-[0.66rem]">
                              {startsFromText}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {visualStyle === "glass-plaque" && (
                      <div className="relative z-10 flex h-full items-center justify-center p-2.5 sm:p-3">
                        <div className="w-[92%] max-w-[230px] rounded-xl border border-white/55 bg-white/20 px-3 py-2 backdrop-blur-md shadow-[0_12px_22px_rgba(15,23,42,0.32)]">
                          <h3
                            className="text-center text-[0.68rem] font-semibold uppercase leading-tight text-white sm:text-[0.74rem] lg:text-[1.02rem]"
                            style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                          >
                            {card.title}
                          </h3>
                          <p className="mt-1 text-center text-[0.44rem] font-semibold uppercase tracking-[0.08em] text-blue-50 sm:text-[0.49rem] lg:text-[0.65rem]">
                            {startsFromText}
                          </p>
                        </div>
                      </div>
                    )}

                    {visualStyle === "coral-tag" && (
                      <div className="relative z-10 flex h-full items-center justify-center p-2.5 sm:p-3">
                        <div className="relative flex min-h-[84px] w-[90%] max-w-[230px] flex-col items-center justify-center rounded-[24px] bg-[#FF7A1A]/92 px-3 py-2 shadow-[0_12px_22px_rgba(251,146,60,0.42)] sm:min-h-[92px] lg:min-h-[120px]">
                          <span className="pointer-events-none absolute -left-2 top-4 h-4 w-4 rounded-full bg-[#FF7A1A]/92" />
                          <span className="pointer-events-none absolute -right-2 bottom-5 h-4 w-4 rounded-full bg-[#FF7A1A]/92" />
                          <h3
                            className="text-center text-[0.68rem] font-semibold uppercase leading-tight text-white sm:text-[0.74rem] lg:text-[1.02rem]"
                            style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                          >
                            {card.title}
                          </h3>
                          <p className="mt-1 text-center text-[0.44rem] font-semibold uppercase tracking-[0.08em] text-orange-50 sm:text-[0.49rem] lg:text-[0.65rem]">
                            {startsFromText}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section data-home-reveal className="container mx-auto mt-4 px-4 sm:px-6 lg:hidden">
            <div className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] border border-white/20 bg-gradient-to-tl from-[#061A35]/82 via-[#123B69]/74 to-[#1D4C82]/68 p-4 text-center shadow-[0_16px_40px_rgba(15,23,42,0.34)] backdrop-blur">
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-32 -skew-x-[22deg] bg-blue-200/18" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-32 -skew-x-[24deg] bg-sky-200/14" />
              <div className="space-y-1">
                <p className="inline-block -skew-x-[10deg] rounded-[5px] bg-white px-3 py-0.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#0D2F5A]">
                  <span className="inline-block skew-x-[10deg]">Store Highlights</span>
                </p>
                <p className="text-xl font-semibold text-white">
                  <span className="inline-block -skew-x-[10deg] rounded-[5px] bg-gradient-to-r from-[#0B4FA1] via-[#0A66D9] to-[#3D8EFF] px-3 py-0.5 text-white">
                    <span className="inline-block skew-x-[10deg]">This Week At The Studio</span>
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 h-40 overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_22px_rgba(15,23,42,0.28)]">
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
                  className="relative h-32 overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_18px_rgba(15,23,42,0.25)] focus:outline-none"
                  onClick={() => setActiveHighlight(highlightImageOne)}
                  aria-label="Enlarge highlight image"
                >
                  <img src={highlightImageOne} alt="Highlight koi" className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  className="relative h-32 overflow-hidden rounded-2xl border border-white/20 shadow-[0_8px_18px_rgba(15,23,42,0.25)] focus:outline-none"
                  onClick={() => setActiveHighlight(highlightImageTwo)}
                  aria-label="Enlarge highlight image"
                >
                  <img src={highlightImageTwo} alt="Highlight detail" className="h-full w-full object-cover" />
                </button>
              </div>
              <div className="mt-2 flex justify-center">
                <div className="flex w-full max-w-[560px] flex-nowrap items-center justify-center gap-2 sm:gap-3">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative inline-flex min-w-0 flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-xl px-2 py-2 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 focus:ring-offset-white sm:px-5"
                  >
                    <span className="relative z-10 inline-flex -skew-x-[10deg] items-center gap-1.5 rounded-[4px] bg-gradient-to-r from-[#F56040] via-[#E1306C] to-[#833AB4] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white sm:text-sm">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 skew-x-[10deg]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.4" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
                      </svg>
                      <span className="inline-block skew-x-[10deg]">Follow Us</span>
                    </span>
                  </a>
                  <a
                    href="https://chat.whatsapp.com/DiUn2Tr4sP8LuKAUoq1xpx"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-2 py-2 transition hover:-translate-y-0.5 sm:px-5"
                  >
                    <span className="inline-flex -skew-x-[10deg] items-center gap-1.5 rounded-[4px] bg-gradient-to-r from-[#25D366] to-[#128C7E] px-[18px] py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white sm:px-[22px] sm:text-sm">
                      <img src={WhatsIcon} alt="" className="h-4 w-4 skew-x-[10deg] object-contain" aria-hidden />
                      <span className="inline-block skew-x-[10deg]">Join Community</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {homeShortcutCircles.length > 0 && (
            <section data-home-reveal className="container mx-auto mt-4 px-4 pt-1 sm:px-6">
              <div className="home-progress-line mx-0 mb-4 h-px bg-amber-300/90" />
              <div className="mb-2 text-center">
                <h2>
                  <span className="inline-block -skew-x-[10deg] rounded-[5px] bg-gradient-to-r from-[#0B3D6C] via-[#14558F] to-[#1B6CAA] px-4 py-1">
                    <span
                      className="inline-block skew-x-[10deg] text-xl font-semibold text-white sm:text-2xl"
                      style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                    >
                      Quick Picks
                    </span>
                  </span>
                </h2>
                <p className="mt-1 inline-block -skew-x-[10deg] rounded-[4px] bg-white/85 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  <span className="inline-block skew-x-[10deg]">Jump To Sections</span>
                </p>
              </div>
              <div
                ref={quickPickTrackRef}
                onScroll={handleQuickPickTrackScroll}
                className="no-scrollbar flex snap-x snap-mandatory items-start gap-2 overflow-x-auto pb-1 pt-1 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:pb-0"
              >
                {homeShortcutCircles.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => goToHomeShortcut(item.key)}
                    className="group snap-start shrink-0 basis-[70%] w-[70%] sm:w-auto sm:basis-[34%] lg:w-full lg:basis-auto"
                    aria-label={`Open ${item.title}`}
                    ref={(node) => {
                      quickPickItemRefs.current[homeShortcutCircles.findIndex((it) => it.key === item.key)] = node;
                    }}
                  >
                    <span className="relative mx-auto inline-flex h-[116px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-[120px] lg:h-[136px]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </span>
                  </button>
                ))}
              </div>
              {homeShortcutCircles.length > 1 && (
                <div className="mt-2 flex items-center justify-center gap-1.5 lg:hidden">
                  <span className="text-xs font-semibold text-slate-500" aria-hidden="true">&lt;</span>
                  <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-slate-300" aria-hidden="true">
                    <span
                      className="absolute top-0 h-1.5 w-6 rounded-full bg-slate-600 transition-all duration-300"
                      style={{
                        left: `${quickPickScrollProgress * (56 - 24)}px`,
                      }}
                    />
                  </span>
                  <span className="text-xs font-semibold text-slate-500" aria-hidden="true">&gt;</span>
                </div>
              )}
            </section>
          )}

          {activeBestSeller && (
            <section data-home-reveal className="container mx-auto mt-5 px-4 pt-3 sm:px-6">
              <div className="home-progress-line mx-2 mb-3 h-px bg-amber-300/70 sm:mx-0" />
              <TopicTitleCard
                className="mb-2"
                title="Best Seller Picks"
                subtitle="Most Loved This Week"
                variant="sale-ribbon"
              />
              <div className="relative mx-auto w-full">
                <div
                  ref={bestSellerTrackRef}
                  onScroll={handleBestSellerTrackScroll}
                  className="no-scrollbar flex snap-x snap-mandatory items-stretch gap-2.5 overflow-x-auto scroll-px-[19.5%] sm:scroll-px-[28%] md:scroll-px-[34.5%] lg:overflow-x-hidden lg:scroll-px-[40%]"
                >
                  {bestSellerPicks.map((product, index) => {
                    const isActive = index === bestSellerIndex;
                    const favoriteSelected = isFavorite(product?.id);
                    const currentPrice = Number(product?.price) || 0;
                    const originalPriceRaw =
                      Number(product?.original_price ?? product?.mrp ?? product?.price) || 0;
                    const originalPrice =
                      originalPriceRaw > currentPrice
                        ? originalPriceRaw
                        : Math.round(currentPrice * 1.15);
                    const savings = Math.max(0, originalPrice - currentPrice);
                    const productBadgeTextRaw =
                      product?.badge || product?.label || product?.tag || product?.badgeText || "";
                    const productBadgeText =
                      typeof productBadgeTextRaw === "string" && productBadgeTextRaw.trim()
                        ? productBadgeTextRaw.trim()
                        : "Top Pick";
                    const stockCount = Number.isFinite(Number(product?.stock_count))
                      ? Number(product?.stock_count)
                      : null;
                    const availabilityText = String(product?.availability || product?.status || "").toLowerCase();
                    const soldOut = stockCount !== null ? stockCount <= 0 : /out|sold/.test(availabilityText);
                    const qty = cartItems?.find((item) => item.id === product?.id)?.qty || 0;
                    const openProductDetails = () => {
                      navigate(`/product/${product?.id}`, {
                        state: {
                          product,
                          relatedProducts: getRelatedProductsFor(product),
                        },
                      });
                    };

                    return (
                      <article
                        key={`best-seller-${product.id}`}
                        ref={(node) => {
                          bestSellerSlideRefs.current[index] = node;
                        }}
                        onClick={openProductDetails}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openProductDetails();
                          }
                        }}
                        className={`relative h-[430px] snap-center snap-always shrink-0 basis-[61%] overflow-visible rounded-[20px] border border-amber-200/70 bg-gradient-to-b from-[#FFF8DC] via-[#FFF3C4] to-[#FFFDF2] shadow-[0_10px_22px_rgba(146,117,34,0.14)] transition-all duration-300 sm:basis-[44%] md:basis-[31%] lg:basis-[20%] ${
                          isActive ? "scale-100 opacity-100" : "scale-[0.9] opacity-100"
                        }`}
                      >
                        <div className="flex h-full flex-col">
                          <div className="relative aspect-[4/4.2] w-full overflow-hidden rounded-t-2xl border-b border-slate-200/60 bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA] sm:aspect-[4/4.3]">
                            {savings > 0 && (
                              <span className="pointer-events-none absolute left-2 top-2 z-20 inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-white shadow-sm">
                                Save {"\u20B9"}
                                {Math.round(savings).toLocaleString("en-IN")}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleFavorite(product);
                              }}
                              className={`absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border shadow transition ${
                                favoriteSelected
                                  ? "border-rose-200 bg-rose-50 text-rose-600"
                                  : "border-slate-200 bg-white/95 text-slate-600 hover:text-rose-600"
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
                            <img
                              src={product?.product_images?.[0]?.url || product?.image || BgImage}
                              alt={product?.name || "Best seller"}
                              className="h-full w-full object-cover bg-gradient-to-b from-[#FFF7D6] via-[#FFF3C7] to-[#FFFBEA]"
                            />
                          </div>
                          <div className="flex flex-1 flex-col px-3 py-3 text-left sm:px-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Best Seller Picks</p>
                            <h2 className="mt-1 text-[16px] font-semibold leading-tight text-[#102A43] sm:text-[20px]">
                              {product?.name || "Top Pick"}
                            </h2>
                            <div className="mt-2 flex justify-start">
                              <span className="inline-flex max-w-[88%] -skew-x-[10deg] items-center rounded-[4px] bg-[#FFE100] px-3 py-0.5 text-[#0D2F5A] shadow-sm">
                                <span
                                  className="truncate skew-x-[10deg] text-[10px] font-semibold tracking-[0.05em]"
                                  style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
                                >
                                  {productBadgeText}
                                </span>
                              </span>
                            </div>
                            <div className="relative mt-4">
                              <div className="flex items-end justify-start gap-3 text-left">
                                <p className="text-sm font-medium text-slate-400 line-through">
                                  {"\u20B9"}
                                  {originalPrice.toLocaleString("en-IN")}
                                </p>
                                <p className="text-2xl font-semibold text-[#1D3A8A]">
                                  {"\u20B9"}
                                  {currentPrice.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <img
                                src={bestSellerIcon}
                                alt="Best seller"
                                title="Best Seller"
                                className="pointer-events-none absolute -right-[10px] top-[calc(50%-10px)] h-[74px] w-[74px] -translate-y-1/2 rotate-[8deg] drop-shadow-[0_8px_12px_rgba(0,0,0,0.28)] sm:h-[86px] sm:w-[86px]"
                              />
                            </div>
                            <div className="relative mt-auto flex flex-col items-center gap-2 pt-4">
                              {bestFishAddedHintIndex === index && (
                                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-200">
                                  1 item added
                                </span>
                              )}
                              {soldOut ? (
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex min-w-[150px] items-center justify-center self-center whitespace-nowrap rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm sm:min-w-0 sm:w-fit sm:px-5 sm:text-sm"
                                >
                                  Out of Stock
                                </button>
                              ) : qty > 0 ? (
                                <div className="w-[160px] min-w-[160px]">
                                  <div className="inline-flex h-9 w-full items-center justify-between rounded-full bg-gradient-to-r from-slate-50 to-slate-100 px-2 shadow-sm">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        if (qty <= 1) {
                                          setPendingBestFishRemove(product);
                                          return;
                                        }
                                        updateQty?.(product?.id, qty - 1);
                                      }}
                                      className="h-7 w-7 rounded-full bg-white text-sm font-semibold text-[#1D3A8A] shadow disabled:cursor-not-allowed disabled:text-slate-300"
                                      aria-label="Decrease quantity"
                                    >
                                      <img src={incMinusIcon} alt="" className="h-7 w-7" />
                                    </button>
                                    <span className="text-sm font-semibold text-[#1D3A8A]">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        updateQty?.(product?.id, qty + 1);
                                      }}
                                      className="h-7 w-7 rounded-full bg-white text-sm font-semibold text-[#1D3A8A] shadow disabled:cursor-not-allowed disabled:text-slate-300"
                                      aria-label="Increase quantity"
                                    >
                                      <img src={incPlusIcon} alt="" className="h-7 w-7" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (soldOut) return;
                                    addToCart?.(product, 1);
                                    setBestFishAddedHintIndex(index);
                                  }}
                                  disabled={soldOut}
                                  className="inline-flex min-w-[150px] items-center justify-center gap-2 self-center whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-amber-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:from-amber-200 disabled:via-amber-200 disabled:to-amber-300 disabled:text-amber-700 sm:min-w-0 sm:w-fit sm:px-5 sm:text-sm"
                                >
                                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                                    <img src={plusIcon} alt="" className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {bestSellerPicks.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setBestSellerArrowHintSide(null);
                        goToBestSeller(bestSellerIndex - 1);
                      }}
                      disabled={bestSellerIndex === 0}
                      className={`absolute left-[6%] top-1/2 z-30 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow sm:h-9 sm:w-9 md:left-[5%] lg:-left-12 lg:h-11 lg:w-11 xl:-left-14 ${
                        bestSellerIndex === 0
                          ? "cursor-not-allowed bg-amber-100/75 text-amber-400"
                          : "bg-amber-400 text-amber-950"
                      }`}
                      aria-label="Previous best seller"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    {bestSellerArrowHintSide === "left" && (
                      <div className="pointer-events-none absolute left-[-118px] top-[calc(50%+42px)] z-30 hidden lg:block">
                        <div className="relative rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow">
                          Tap here
                          <span className="absolute -top-1 left-12 h-2 w-2 rotate-45 border-l border-t border-amber-300 bg-amber-50" aria-hidden="true" />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setBestSellerArrowHintSide(null);
                        goToBestSeller(bestSellerIndex + 1);
                      }}
                      disabled={bestSellerIndex === bestSellerPicks.length - 1}
                      className={`absolute right-[6%] top-1/2 z-30 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow sm:h-9 sm:w-9 md:right-[5%] lg:-right-12 lg:h-11 lg:w-11 xl:-right-14 ${
                        bestSellerIndex === bestSellerPicks.length - 1
                          ? "cursor-not-allowed bg-amber-100/75 text-amber-400"
                          : "bg-amber-400 text-amber-950"
                      }`}
                      aria-label="Next best seller"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                    {bestSellerArrowHintSide === "right" && (
                      <div className="pointer-events-none absolute right-[-118px] top-[calc(50%+42px)] z-30 hidden lg:block">
                        <div className="relative rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow">
                          Tap here
                          <span className="absolute -top-1 right-12 h-2 w-2 rotate-45 border-l border-t border-amber-300 bg-amber-50" aria-hidden="true" />
                        </div>
                      </div>
                    )}
                  </>
                )}
                {bestSellerPicks.length > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2.5">
                    {bestSellerPicks.map((_, index) => {
                      const active = index === bestSellerIndex;
                      return (
                        <button
                          key={`best-seller-dot-${index}`}
                          type="button"
                          onClick={() => goToBestSeller(index)}
                          className={`inline-flex items-center justify-center rounded-full transition ${
                            active
                              ? "h-4 w-4 bg-amber-500 ring-2 ring-amber-200"
                              : "h-3 w-3 bg-white/90 hover:bg-white"
                          }`}
                          aria-label={`Go to best seller ${index + 1}`}
                          aria-current={active ? "true" : "false"}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          <section data-home-reveal ref={newArrivalsSectionRef} className="container mx-auto mt-5 px-4 pt-3 sm:px-6">
            <div className="home-progress-line mx-2 mb-3 h-px bg-amber-300/70 sm:mx-0" />
            <TopicTitleCard
              className="mb-2"
              title="New Arrivals"
              subtitle="Latest Picks"
              variant="minimal-stripe"
              tone="new-arrivals"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {newArrivals.map((product) => {
                const categorySlug = product?.subcategory?.category?.slug;
                const categoryKey = categoryBySlug[categorySlug] || "fishes";
                return (
                  <CategoryCard
                    key={`new-${product.id}`}
                    categoryName={categoryKey}
                    product={product}
                    relatedProducts={getRelatedProductsFor(product)}
                        showStockBadge
                      />
                );
              })}
            </div>
          </section>

          {smartSections.map((section) => (
            <section
              data-home-reveal
              key={section.key}
              ref={section.key === "trending" ? trendingSectionRef : section.key === "under-100" ? underHundredSectionRef : null}
              className="container mx-auto mt-5 px-4 pt-3 sm:px-6"
            >
              <div className="home-progress-line mx-2 mb-3 h-px bg-amber-300/70 sm:mx-0" />
              <div className="relative mb-2">
                <TopicTitleCard
                  title={section.title}
                  subtitle={section.subtitle}
                  variant="minimal-stripe"
                  tone={section.key}
                />
                {section.key === "under-100" && (
                  <button
                    type="button"
                    onClick={() => navigate("/under-100")}
                    className="absolute right-0 top-1/2 inline-flex -translate-y-1/2 shrink-0 items-center gap-1.5 rounded-xl bg-transparent px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-amber-600 transition hover:text-amber-700 lg:text-[14px]"
                  >
                    View All
                    <img src={arrowIcon} alt="" className="h-[21px] w-[21px] object-contain" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {section.items.map((product) => {
                  const categorySlug = product?.subcategory?.category?.slug;
                  const categoryKey = categoryBySlug[categorySlug] || "fishes";
                  return (
                    <CategoryCard
                      key={`${section.key}-${product.id}`}
                      categoryName={categoryKey}
                      product={product}
                      relatedProducts={getRelatedProductsFor(product)}
                      showStockBadge
                    />
                  );
                })}
              </div>
            </section>
          ))}

          {medicineAndFilterPicks.length > 0 && (
            <section data-home-reveal ref={essentialsSectionRef} className="container mx-auto mt-5 px-4 pt-3 sm:px-6">
              <div className="home-progress-line mx-2 mb-3 h-px bg-amber-300/70 sm:mx-0" />
              <TopicTitleCard
                className="mb-2"
                title="Aquarium Essentials"
                subtitle="Everyday Must-Haves"
                variant="minimal-stripe"
                tone="essentials"
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {medicineAndFilterPicks.map((product) => (
                  <CategoryCard
                    key={`med-filter-${product.id}`}
                    categoryName="accessories"
                    product={product}
                    relatedProducts={getRelatedProductsFor(product)}
                    showStockBadge
                  />
                ))}
              </div>
            </section>
          )}

        </>
      ))}
      {pendingBestFishRemove && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPendingBestFishRemove(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Remove item?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Remove {pendingBestFishRemove?.name || "this item"} from your cart?
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingBestFishRemove(null)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeItem?.(pendingBestFishRemove?.id);
                  setPendingBestFishRemove(null);
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
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
      {showFloatingWhatsApp && !isSearching && (
        <a
          href="https://wa.me/918667418965"
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/80 bg-transparent p-1.5 shadow-lg shadow-emerald-500/35 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          aria-label="Chat on WhatsApp"
        >
          <img src={WhatsIcon} alt="" className="h-full w-full object-contain" aria-hidden="true" />
        </a>
      )}
    </main>
  );
};

export default Home;



