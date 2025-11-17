export const subcategoryData = {
  "Neon Tetra": [
    { id: "neon-1", title: "Standard Neon Tetra", price: 120 },
    { id: "neon-2", title: "Cardinal Tetra", price: 150 },
    { id: "neon-3", title: "Green Neon Tetra", price: 160 }
  ],

  "Betta Fish": [
    { id: "betta-1", title: "Halfmoon Betta", price: 450 },
    { id: "betta-2", title: "Crowntail Betta", price: 400 },
    { id: "betta-3", title: "Plakat Betta", price: 500 },
    { id: "betta-4", title: "Dumbo Ear Betta", price: 700 },
    { id: "betta-5", title: "Koi Galaxy Betta", price: 900 }
  ],

  "Goldfish": [
    { id: "gold-1", title: "Common Goldfish", price: 200 },
    { id: "gold-2", title: "Comet Goldfish", price: 250 },
    { id: "gold-3", title: "Fantail Goldfish", price: 450 },
    { id: "gold-4", title: "Oranda Goldfish", price: 700 },
    { id: "gold-5", title: "Ranchu Goldfish", price: 850 }
  ],

  "Angelfish": [
    { id: "angel-1", title: "Silver Angelfish", price: 450 },
    { id: "angel-2", title: "Marble Angelfish", price: 500 },
    { id: "angel-3", title: "Koi Angelfish", price: 650 },
    { id: "angel-4", title: "Veil Tail Angelfish", price: 700 }
  ],

  "Java Fern": [
    { id: "jfern-1", title: "Standard Java Fern", price: 180 },
    { id: "jfern-2", title: "Windelov Java Fern", price: 220 },
    { id: "jfern-3", title: "Narrow Leaf Java Fern", price: 250 },
    { id: "jfern-4", title: "Trident Java Fern", price: 300 }
  ],

  "Anubias": [
    { id: "anub-1", title: "Anubias Barteri", price: 220 },
    { id: "anub-2", title: "Anubias Nana Petite", price: 300 },
    { id: "anub-3", title: "Anubias Coffeefolia", price: 280 }
  ],

  "Amazon Sword": [
    { id: "asword-1", title: "Standard Amazon Sword", price: 200 },
    { id: "asword-2", title: "Red Flame Sword", price: 250 },
    { id: "asword-3", title: "Compact Amazon Sword", price: 270 }
  ],

  "Dwarf Hairgrass": [
    { id: "dhg-1", title: "Eleocharis Parvula", price: 300 },
    { id: "dhg-2", title: "Eleocharis Belem", price: 350 }
  ],

  "LED Aquarium Light": [
    { id: "led-1", title: "Full Spectrum", price: 2500 },
    { id: "led-2", title: "RGB White Mix", price: 3000 },
    { id: "led-3", title: "Plant Growth Enhanced", price: 3500 }
  ],

  "Filter System": [
    { id: "filter-1", title: "Internal Filter", price: 1500 },
    { id: "filter-2", title: "Hang-on-Back Filter", price: 2000 },
    { id: "filter-3", title: "Canister Filter", price: 4000 },
    { id: "filter-4", title: "Sponge Filter", price: 500 }
  ],

  "Heater": [
    { id: "heater-1", title: "50W", price: 800 },
    { id: "heater-2", title: "100W", price: 1000 },
    { id: "heater-3", title: "150W", price: 1200 },
    { id: "heater-4", title: "200W", price: 1500 }
  ],

  "Air Pump": [
    { id: "air-1", title: "Single Outlet", price: 600 },
    { id: "air-2", title: "Double Outlet", price: 800 },
    { id: "air-3", title: "Silent Pump", price: 1200 }
  ],

  "Glass Aquarium 20L": [
    { id: "tank20-1", title: "With Lid", price: 3800 },
    { id: "tank20-2", title: "Without Lid", price: 3500 },
    { id: "tank20-3", title: "With Background Print", price: 4200 }
  ],

  "Glass Aquarium 50L": [
    { id: "tank50-1", title: "Standard Clear Glass", price: 5500 },
    { id: "tank50-2", title: "Low Iron Glass", price: 6500 }
  ],

  "Glass Aquarium 100L": [
    { id: "tank100-1", title: "Standard Glass", price: 8500 },
    { id: "tank100-2", title: "Low Iron Premium", price: 9500 }
  ],

  "Premium Reef Tank": [
    { id: "reef-1", title: "Starter Reef Setup", price: 15000 },
    { id: "reef-2", title: "Full Coral Ready Setup", price: 22000 }
  ]
};

export const getSubItems = (title) => subcategoryData[title] || [];
