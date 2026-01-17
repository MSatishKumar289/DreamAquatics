import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchAllProductsWithCategories } from '../lib/catalogApi';
import CategorySection from '../components/CategorySection';
import Spinner from '../components/Spinner';
import BgImage from '../assets/Images/homebgnew.png';
import MobileBgImage from '../assets/Images/mbarca.png';
import CallIcon from '../assets/Images/call.png';
import WhatsIcon from '../assets/Images/whatsapp.jpeg';
import HighlightOne from '../assets/Images/go.jpg';
import HighlightTwo from '../assets/Images/prey.jpg';
import HighlightThree from '../assets/Images/ram.jpg';
import HighlightVideo from '../assets/Videos/video.mp4';

const Home = ({ profile }) => {
  const categories = ['fishes', 'live-plants', 'accessories', 'tank'];
  const CATEGORY_SLUG_MAP = {
    fishes: 'fishes',
    'live-plants': 'plants',
    accessories: 'accessories',
    tank: 'tanks',
  };
  const instagramUrl = 'https://www.instagram.com/dreamaquatics23/?hl=en';
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeHighlight, setActiveHighlight] = useState(null);

  useEffect(() => {
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

        const mapped = categories.reduce((acc, categoryKey) => {
          const subcategoryGroups = Object.values(groupedBySubcategory[categoryKey] || {});

          const subcategoryCards = subcategoryGroups
            .map((group) => {
              if (!group.length) return null;

              const latestProduct = group.reduce((latest, current) => {
                if (!latest) return current;
                return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
              }, null);

              const subcategory = latestProduct?.subcategory;
              if (!subcategory?.id) return null;

              return {
                subcategoryId: subcategory.id,
                subcategoryName: subcategory.name,
                subcategorySlug: subcategory.slug,
                latestProductDate: latestProduct?.created_at || '',
                image: latestProduct?.product_images?.[0]?.url || '',
              };
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b.latestProductDate) - new Date(a.latestProductDate))
            .slice(0, 4);

          acc[categoryKey] = subcategoryCards;
          return acc;
        }, {});

        setProductsByCategory(mapped);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white pb-12">
      <section className="relative overflow-hidden py-6 md:py-8">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 hidden scale-105 bg-cover bg-center blur-[2px] md:block"
            style={{ backgroundImage: `url(${BgImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0 left-1/2 w-screen -translate-x-1/2 scale-105 bg-cover bg-center blur-[2px] md:hidden"
            style={{ backgroundImage: `url(${MobileBgImage})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/45 to-black/35" aria-hidden />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-6 px-5 text-white lg:grid-cols-[1.2fr_0.8fr] md:px-10">
          <div className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.45)] backdrop-blur lg:px-10">
            <div className="space-y-3 text-center md:text-left">
              <h1 className="text-[1.5rem] font-light leading-tight whitespace-nowrap sm:text-[2.2rem] md:text-[2.6rem]">
                Exclusive and <span className="font-semibold text-sky-200">Exotics</span>
              </h1>
              <p className="text-base text-sky-50/90 md:text-lg">
                Welcome to the wonderful world of fish keeping. Your trusted source for exotic aquarium fishes with expert advice and nationwide shipping.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-inner shadow-sky-900/30 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-200">Custom-built aquariums</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Designed for your space with the right tech to keep vibrant fish like neon tetras healthy and active.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-inner shadow-sky-900/30 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-sky-200">Professional maintenance</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Scheduled care, water checks, and quick cleanups to keep your aquarium crystal clear and stress-free.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-center">
              <a
                href="tel:+918667419965"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sky-900 shadow-lg transition hover:-translate-y-0.5 md:text-base"
              >
                <img src={CallIcon} alt="" className="h-5 w-5 object-contain" aria-hidden />
                Call us
              </a>
              <a
                href="https://wa.me/918667419965"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/80 bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 md:text-base"
              >
                <img src={WhatsIcon} alt="" className="h-5 w-5 rounded-full object-contain" aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[32px] border border-white/15 bg-white/10 p-6 text-center shadow-[0_25px_80px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-sky-200">Store highlights</p>
              <p className="text-xl font-semibold text-white">This week at the studio</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 h-40 overflow-hidden rounded-2xl border border-white/10">
                <video
                  src={HighlightVideo}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  poster={HighlightOne}
                />
              </div>
              <button
                type="button"
                className="relative h-32 overflow-hidden rounded-2xl border border-white/10 focus:outline-none"
                onClick={() => setActiveHighlight(HighlightTwo)}
                aria-label="Enlarge highlight image"
              >
                <img src={HighlightTwo} alt="Highlight koi" className="h-full w-full object-cover" />
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
                onClick={() => setActiveHighlight(HighlightThree)}
                aria-label="Enlarge highlight image"
              >
                <img src={HighlightThree} alt="Highlight detail" className="h-full w-full object-cover" />
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
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_12px_40px_rgba(236,72,153,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 focus:ring-offset-white"
              >
                <span className="absolute inset-0 bg-white/15 opacity-0 transition duration-300 hover:opacity-100" aria-hidden />
                Follow us on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <Spinner />
      ) : (
        categories.map((category) => (
          <CategorySection
            key={category}
            categoryName={category}
            products={productsByCategory[category] || []}
          />
        ))
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
              className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow hover:text-slate-900"
              aria-label="Close image preview"
            >
              ×
            </button>
            <img
              src={activeHighlight}
              alt="Highlight preview"
              className="max-h-[80vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
