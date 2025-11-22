import { getProductsByCategory } from '../data/sampleProducts';
import CategorySection from '../components/CategorySection';
import BgImage from '../assets/Images/barca.png';
import MobileBgImage from '../assets/Images/mbarca.png';
import CallIcon from '../assets/Images/call.png';
import WhatsIcon from '../assets/Images/whatsapp.jpeg';
import HighlightOne from '../assets/Images/go.jpg';
import HighlightTwo from '../assets/Images/koi.jpg';
import HighlightThree from '../assets/Images/de.jpg';
import HighlightVideo from '../assets/Videos/video.mp4';

const Home = () => {
  const categories = ['fishes', 'live-plants', 'accessories', 'tank'];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
      <section className="relative overflow-hidden py-6 md:py-8">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 hidden scale-105 bg-cover bg-center blur-[2px] md:block"
            style={{ backgroundImage: `url(${BgImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px] md:hidden"
            style={{ backgroundImage: `url(${MobileBgImage})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/45 to-black/35" aria-hidden />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-6 px-5 text-white md:grid-cols-[1.2fr_0.8fr] md:px-10">
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

            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <a
                href="tel:0000000"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sky-900 shadow-lg transition hover:-translate-y-0.5 md:text-base"
              >
                <img src={CallIcon} alt="" className="h-5 w-5 object-contain" aria-hidden />
                Call us
              </a>
              <a
                href="https://wa.me/0000000"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/80 bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 md:text-base"
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
              <div className="h-32 overflow-hidden rounded-2xl border border-white/10">
                <img src={HighlightTwo} alt="Highlight koi" className="h-full w-full object-cover" />
              </div>
              <div className="h-32 overflow-hidden rounded-2xl border border-white/10">
                <img src={HighlightThree} alt="Highlight detail" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm uppercase tracking-[0.3em] text-sky-100/80">
              <span className="flex flex-col">
                <strong className="text-3xl text-white">18</strong>
                aquascapes
              </span>
              <span className="flex flex-col">
                <strong className="text-3xl text-white">12</strong>
                rare arrivals
              </span>
              <span className="flex flex-col">
                <strong className="text-3xl text-white">5</strong>
                shipped today
              </span>
            </div>
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category);
        return (
          <CategorySection
            key={category}
            categoryName={category}
            products={categoryProducts}
          />
        );
      })}
    </main>
  );
};

export default Home;
