import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import cart_ic from '../assets/Icons/cart_ic.svg';
import mobile_cart_ic from '../assets/Icons/mobile_cart_ic.svg';
import close_ic from '../assets/Icons/close_ic.svg';
import hamburger_menu_ic from '../assets/Icons/hamburger_menu_ic.svg';


const Header = ({ user, onLogout, onRequestLogin }) => {
  const { itemCount } = useCart();
  const cartCount = itemCount;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const profileDesktopRef = useRef(null);
  const profileMobileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const categories = [
    { label: 'Fishes', value: 'fishes' },
    { label: 'Live Plants', value: 'live-plants' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Tank', value: 'tank' }
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isProfileOpen) {
        const inDesktop = profileDesktopRef.current?.contains(event.target);
        const inMobile = profileMobileRef.current?.contains(event.target);
        if (!inDesktop && !inMobile) {
          setIsProfileOpen(false);
        }
      }
      if (isMobileMenuOpen) {
        const inMenu = mobileMenuRef.current?.contains(event.target);
        if (!inMenu) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isProfileOpen, isMobileMenuOpen]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-3 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between gap-2 h-16 md:h-20">
          {/* Brand Title */}
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-700 transition-colors focus:outline-none"
            aria-label="Dream Aquatics home"
          >
            <div className="flex items-baseline leading-none">
              <span className="text-[1.35rem] sm:text-[2rem] md:text-[3rem] font-extrabold">D</span>
              <span className="text-[1.1rem] sm:text-[2.4rem] md:text-4xl font-semibold tracking-wide">REAM</span>
              <span className="ml-1 sm:ml-2 text-[1.35rem] sm:text-[2rem] md:text-[3rem] font-extrabold">A</span>
              <span className="text-[1.1rem] sm:text-[2.4rem] md:text-4xl font-semibold tracking-wide">QUATICS</span>
            </div>
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

            {/* Profile / Login */}
            <div ref={profileDesktopRef} className="relative flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                    aria-label="Account menu"
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-50 via-white to-blue-50 opacity-90" aria-hidden />
                    <span className="absolute inset-[6px] rounded-full bg-white shadow-inner" aria-hidden />
                    <svg
                      className="relative h-5 w-5 text-slate-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="8.5" r="3.25" />
                      <path d="M6.5 18.25c1.2-2 3.1-3.25 5.5-3.25s4.3 1.25 5.5 3.25" />
                    </svg>
                  </button>
                  {user.role === 'admin' && (
                    <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-md border border-sky-200">
                      Admin
                    </span>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestLogin?.()}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  aria-label="Login to your Dream Aquatics account"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-50 via-white to-blue-50 opacity-90" aria-hidden />
                  <span className="absolute inset-[6px] rounded-full bg-white shadow-inner" aria-hidden />
                  <svg
                    className="relative h-5 w-5 text-slate-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <circle cx="12" cy="8.5" r="3.25" />
                    <path d="M6.5 18.25c1.2-2 3.1-3.25 5.5-3.25s4.3 1.25 5.5 3.25" />
                  </svg>
                </button>
              )}
              {user && isProfileOpen && (
                <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
                  <p className="text-sm font-semibold text-slate-800">Signed in</p>
                  <p className="text-base font-bold text-sky-800">{user.name}</p>
                  {user.email && <p className="text-xs text-slate-600 break-words">{user.email}</p>}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/add-product');
                      }}
                      className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const confirmLogout = window.confirm('Are you sure you want to log out?');
                      if (!confirmLogout) return;
                      setIsProfileOpen(false);
                      onLogout?.();
                      navigate('/');
                    }}
                    className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
            
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
          <div ref={mobileMenuRef} className="relative lg:hidden">
            <div className="flex items-center space-x-2.5 flex-shrink-0">
              <div ref={profileMobileRef} className="relative flex items-center gap-1.5">
              {user ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                    aria-label="Account menu"
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-50 via-white to-blue-50 opacity-90" aria-hidden />
                    <span className="absolute inset-[4px] rounded-full bg-white shadow-inner" aria-hidden />
                    <svg
                      className="relative h-[16px] w-[16px] text-slate-700"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="8.5" r="3.25" />
                      <path d="M6.5 18.25c1.2-2 3.1-3.25 5.5-3.25s4.3 1.25 5.5 3.25" />
                    </svg>
                  </button>
                  {user.role === 'admin' && (
                    <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 whitespace-nowrap">
                      Admin
                    </span>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestLogin?.()}
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  aria-label="Login to your Dream Aquatics account"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-50 via-white to-blue-50 opacity-90" aria-hidden />
                  <span className="absolute inset-[4px] rounded-full bg-white shadow-inner" aria-hidden />
                  <svg
                    className="relative h-[16px] w-[16px] text-slate-700"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <circle cx="12" cy="8.5" r="3.25" />
                    <path d="M6.5 18.25c1.2-2 3.1-3.25 5.5-3.25s4.3 1.25 5.5 3.25" />
                  </svg>
                </button>
              )}
              {user && isProfileOpen && (
                <div className="absolute right-0 top-11 z-40 w-60 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
                  <p className="text-sm font-semibold text-slate-800">Signed in</p>
                  <p className="text-base font-bold text-sky-800">{user.name}</p>
                  {user.email && <p className="text-xs text-slate-600 break-words">{user.email}</p>}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/add-product');
                      }}
                      className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const confirmLogout = window.confirm('Are you sure you want to log out?');
                      if (!confirmLogout) return;
                      setIsProfileOpen(false);
                      onLogout?.();
                      navigate('/');
                    }}
                    className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
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

            {isMobileMenuOpen && (
              <div className="absolute left-0 right-0 top-full z-40 mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-lg">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        navigate(`/category/${category.value}`);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`View ${category.label} category`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
