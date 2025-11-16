import { getProductsByCategory } from '../data/sampleProducts';
import CategorySection from '../components/CategorySection';
import BgImage from '../assets/Images/barca.png';
import MobileBgImage from '../assets/Images/mbarca.png';

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
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/45 to-black/35" aria-hidden />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-5 text-white md:px-8">
          <div className="space-y-3 md:space-y-3">
            <h1 className="text-center text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Exclusive and Exotics
            </h1>
            <p className="text-left text-base text-sky-50/90 md:text-lg">
              Welcome to the wonderful world of fish keeping.Your trusted source for exotic aquarium fishes with expert advice and nation wide shipping.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 md:gap-8">
            <div className="space-y-2 border-l-4 border-sky-300/80 pl-4">
              <p className="text-lg font-semibold md:text-xl">Custom-built aquariums</p>
              <p className="text-sm text-sky-50/90 md:text-base">
                Designed for your space with the right tech to keep vibrant fish like neon tetras healthy and active.
              </p>
            </div>
            <div className="space-y-2 border-l-4 border-sky-300/80 pl-4">
              <p className="text-lg font-semibold md:text-xl">Professional maintenance</p>
              <p className="text-sm text-sky-50/90 md:text-base">
                Scheduled care, water checks, and quick cleanups to keep your aquarium crystal clear and stress-free.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <a
              href="tel:0000000"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold uppercase tracking-wide text-sky-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50 md:text-base"
            >
              Call us
            </a>
            <a
              href="https://wa.me/0000000"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10 md:text-base"
            >
              WhatsApp
            </a>
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
