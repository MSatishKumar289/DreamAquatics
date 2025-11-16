import { sampleProducts, getProductsByCategory } from '../data/sampleProducts';
import CategorySection from '../components/CategorySection';

const Home = () => {
  const categories = ['fishes', 'live-plants', 'accessories', 'tank'];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
      <section className="bg-gradient-to-r from-blue-50 via-blue-100 to-sky-50 py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl border-4 border-blue-600 bg-white/95 shadow-lg shadow-blue-200">
            <div className="pointer-events-none absolute inset-4 rounded-2xl border border-blue-200/80" />
            <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:gap-8 md:p-8">
              <div className="space-y-4">
                <p className="text-xl font-semibold leading-tight text-sky-900 md:text-2xl">
                  Customised aquariums & premium accessories
                </p>
                <p className="text-sm text-sky-700 md:text-base">
                  Custom tanks for your space with the right gear to keep fish healthy and your setup looking great.
                </p>
              </div>
              <div className="space-y-4 border-t border-sky-100 pt-4 md:border-t-0 md:border-l md:pl-6">
                <p className="text-xl font-semibold leading-tight text-sky-900 md:text-2xl">
                  Professional tank maintenance
                </p>
                <p className="text-sm text-sky-700 md:text-base">
                  Regular upkeep, water checks, and quick cleanups to keep your water clear and worry-free.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-white px-6 pt-4 pb-8 md:gap-4 md:px-8">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-800 md:text-sm">
                Let's build and care for your dream tank
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:0000000"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:translate-y-[-1px] hover:bg-blue-800 md:text-sm md:px-5"
                >
                  Call us
                </a>
                <a
                  href="https://wa.me/0000000"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-800 transition hover:border-blue-500 hover:bg-blue-50 md:text-sm md:px-5"
                >
                  WhatsApp
                </a>
              </div>
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
