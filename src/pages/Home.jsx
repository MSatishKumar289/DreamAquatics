import { sampleProducts, getProductsByCategory } from '../data/sampleProducts';
import CategorySection from '../components/CategorySection';

const Home = () => {
  const categories = ['fishes', 'live-plants', 'accessories', 'tank'];

  return (
    <main className="min-h-screen">
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
