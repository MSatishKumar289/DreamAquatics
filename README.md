# Dream Aquatics

A modern React e-commerce application for aquarium products, built with Vite and Tailwind CSS.

## Features

- Responsive design optimized for desktop, tablet, and mobile
- Four product categories: Fishes, Live Plants, Accessories, and Tanks
- Accessible UI with semantic HTML and keyboard navigation
- Modular component architecture

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Project Structure

```
src/
  ├── components/
  │   ├── Header.jsx          # Navigation header with cart
  │   ├── CategorySection.jsx # Section displaying category products
  │   └── CategoryCard.jsx    # Individual product card
  ├── pages/
  │   └── Home.jsx            # Home page with all categories
  ├── data/
  │   └── sampleProducts.js   # Sample product data
  ├── App.jsx                 # Main app component
  └── main.jsx               # Application entry point
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Phase 1 Status

This is Phase 1 of the project, featuring:
- ✅ Static product data from local JSON
- ✅ Responsive layout (4 cards on desktop, 2 on mobile)
- ✅ Accessible components with keyboard navigation
- ✅ No backend integration (static data only)
- ✅ No navigation functionality (visual only)

## Future Phases

- Phase 2: Supabase integration for products and images
- Phase 3: Shopping cart with localStorage persistence
- Phase 4: Admin panel for product management
