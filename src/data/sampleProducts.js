// Sample product data for Phase 1
export const sampleProducts = [
  // Fishes
  {
    id: 'fish-1',
     category: 'fishes',
    title: 'Betta Fish',
    subtitle: 'Colorful ornamental fish',
    price: 350,
    image: 'Images/Betta-Fish.jpg',
    description: 'Stunning betta fish with vibrant colors'
   
  },
  {
    id: 'fish-2',
    category: 'fishes',
    title: 'Neon Tetra',
    subtitle: 'Small schooling fish',
    price: 120,
    image: 'Images/tetra.jpg',
    description: 'Beautiful small schooling fish perfect for community tanks'
  },
  {
    id: 'fish-3',
    category: 'fishes',
    title: 'Goldfish',
    subtitle: 'Classic aquarium favorite',
    price: 250,
    image: 'Images/go.jpg',
    description: 'Traditional goldfish, great for beginners'
  },
  {
    id: 'fish-4',
    category: 'fishes',
    title: 'Angelfish',
    subtitle: 'Elegant and graceful',
    price: 450,
    image:  'Images/angel.jpg',
    description: 'Beautiful angelfish with distinctive fins'
  },
  // Live Plants
  {
    id: 'plant-1',
    category: 'live-plants',
    title: 'Java Fern',
    subtitle: 'Low-maintenance aquatic plant',
    price: 180,
    image: 'java-fern.jpg',
    description: 'Hardy fern perfect for beginner aquarists'
  },
  {
    id: 'plant-2',
    category: 'live-plants',
    title: 'Anubias',
    subtitle: 'Dark green foliage',
    price: 220,
    image: 'anubias.jpg',
    description: 'Slow-growing plant with broad leaves'
  },
  {
    id: 'plant-3',
    category: 'live-plants',
    title: 'Amazon Sword',
    subtitle: 'Tall background plant',
    price: 200,
    image: 'amazon-sword.jpg',
    description: 'Popular tall plant for aquascaping'
  },
  {
    id: 'plant-4',
    category: 'live-plants',
    title: 'Dwarf Hairgrass',
    subtitle: 'Carpeting plant',
    price: 300,
    image: 'dwarf-hairgrass.jpg',
    description: 'Perfect for creating a lush carpet effect'
  },
  // Accessories
  {
    id: 'acc-1',
    category: 'accessories',
    title: 'LED Aquarium Light',
    subtitle: 'Full spectrum lighting',
    price: 2500,
    image: 'led-light.jpg',
    description: 'Energy-efficient LED light for plant growth'
  },
  {
    id: 'acc-2',
    category: 'accessories',
    title: 'Filter System',
    subtitle: '3-stage filtration',
    price: 3500,
    image: 'filter.jpg',
    description: 'Advanced filtration system for clean water'
  },
  {
    id: 'acc-3',
    category: 'accessories',
    title: 'Heater',
    subtitle: 'Adjustable temperature',
    price: 1200,
    image: 'heater.jpg',
    description: 'Reliable aquarium heater with thermostat'
  },
  {
    id: 'acc-4',
    category: 'accessories',
    title: 'Air Pump',
    subtitle: 'Quiet operation',
    price: 800,
    image: 'air-pump.jpg',
    description: 'Efficient air pump for oxygen circulation'
  },
  // Tanks
  {
    id: 'tank-1',
    category: 'tank',
    title: 'Glass Aquarium 20L',
    subtitle: 'Perfect starter tank',
    price: 3500,
    image: 'tank-20l.jpg',
    description: '20-liter glass aquarium ideal for small fish'
  },
  {
    id: 'tank-2',
    category: 'tank',
    title: 'Glass Aquarium 50L',
    subtitle: 'Medium size option',
    price: 5500,
    image: 'tank-50l.jpg',
    description: '50-liter tank with premium glass construction'
  },
  {
    id: 'tank-3',
    category: 'tank',
    title: 'Glass Aquarium 100L',
    subtitle: 'Large capacity',
    price: 8500,
    image: 'tank-100l.jpg',
    description: 'Spacious 100-liter aquarium for diverse setups'
  },
  {
    id: 'tank-4',
    category: 'tank',
    title: 'Premium Reef Tank',
    subtitle: 'Advanced setup',
    price: 15000,
    image: 'reef-tank.jpg',
    description: 'Professional-grade reef tank with all features'
  }
];

// Helper function to get products by category
export const getProductsByCategory = (category) => {
  return sampleProducts.filter(product => product.category === category);
};
