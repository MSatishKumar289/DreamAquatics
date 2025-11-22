import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import cart_ic from '../assets/Icons/cart_ic.svg';
import mobile_cart_ic from '../assets/Icons/mobile_cart_ic.svg';
import close_ic from '../assets/Icons/close_ic.svg';
import hamburger_menu_ic from '../assets/Icons/hamburger_menu_ic.svg';
import RayBrand from '../assets/Images/top.png';


const Header = () => {
  const { cartItems } = useCart();
  const cartCount = cartItems.length;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    { label: 'Fishes', value: 'fishes' },
    { label: 'Live Plants', value: 'live-plants' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Tank', value: 'tank' }
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Title */}
          <Link
            to="/"
            className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Dream Aquatics home"
          >
            <div className="flex items-baseline leading-none">
              <span className="text-[1.5rem] sm:text-5xl md:text-6xl font-extrabold">D</span>
              <span className="text-[1.2rem] sm:text-[2.6rem] md:text-4xl font-semibold tracking-wide">REAM</span>
              <span className="ml-2 text-[1.5rem] sm:text-5xl md:text-6xl font-extrabold">A</span>
              <span className="text-[1.2rem] sm:text-[2.6rem] md:text-4xl font-semibold tracking-wide">QUATICS</span>
            </div>
            <img src={RayBrand} alt="" className="h-10 w-auto translate-y-1 opacity-90 sm:h-12 sm:translate-y-1.5 md:h-14" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 lg:space-x-8">
            {categories.map((category) => (
              <Link
                key={category.value}
                to={`/category/${category.value}`}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                aria-label={`View ${category.label} category`}
              >
                {category.label}
              </Link>
            ))}
            
            {/* Cart Icon */}
            <Link
              to={`/cart`}
              className={`relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${cartCount > 0 ? 'motion-safe:animate-pulse' : ''}`}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <img src={cart_ic} alt="Cart" />
              {cartCount > 0 && (
                <span
                  className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex lg:hidden items-center space-x-4">
            {/* Mobile Cart Icon */}
            <Link
              to={`/cart`}
              className={`relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${cartCount > 0 ? 'motion-safe:animate-pulse' : ''}`}
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <img src={mobile_cart_ic} alt="Cart" />
              {cartCount > 0 && (
                <span
                  className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger Menu Button */}
            <button
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <img src={close_ic} />
              ) : (
                <img src={hamburger_menu_ic} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {categories.map((category) => (
              <button
                key={category.value}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View ${category.label} category`}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
