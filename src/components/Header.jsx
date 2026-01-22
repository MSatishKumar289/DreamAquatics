import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdminOrders } from '../context/AdminOrdersContext';
import cart_ic from '../assets/Icons/cart_ic.svg';
import mobile_cart_ic from '../assets/Icons/mobile_cart_ic.svg';
import close_ic from '../assets/Icons/close_ic.svg';
import hamburger_menu_ic from '../assets/Icons/hamburger_menu_ic.svg';


const Header = ({
  user,
  onLogout,
  onRequestLogin,
  onCartOpen,
  onAdminOrdersOpen,
  isRoleResolved
}) => {
  const { itemCount } = useCart();
  const { newOrdersCount } = useAdminOrders();
  const cartCount = itemCount;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [showProfileHint, setShowProfileHint] = useState(false);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const categories = [
    { label: 'Fishes', value: 'fishes' },
    { label: 'Live Plants', value: 'live-plants' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Tank', value: 'tank' }
  ];

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (event) => {
      const inMenu = event.target.closest('[data-profile-menu]');
      const inButton = event.target.closest('[data-profile-button]');
      if (inMenu || inButton) return;
      setIsProfileOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (event) => {
      const inMenu = event.target.closest('[data-mobile-menu]');
      const inButton = event.target.closest('[data-mobile-menu-button]');
      if (inMenu || inButton) return;
      setIsMobileMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!user) return;
    const seen = localStorage.getItem('da_profile_hint_seen');
    if (seen) return;
    setShowProfileHint(true);
    const timer = setTimeout(() => {
      setShowProfileHint(false);
      localStorage.setItem('da_profile_hint_seen', '1');
    }, 3000);
    return () => clearTimeout(timer);
  }, [user]);

  const dismissProfileHint = () => {
    if (!showProfileHint) return;
    setShowProfileHint(false);
    localStorage.setItem('da_profile_hint_seen', '1');
  };

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-3 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between gap-2 h-16 md:h-20">
          {/* Brand Title */}
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-700 transition-colors focus:outline-none rounded"
            aria-label="Dream Aquatics home"
          >
            <div className="flex items-baseline leading-none">
              <span className="text-[1.5rem] sm:text-[rem] md:text-[3rem] font-extrabold tracking-[0.04em]">D</span>
              <span className="-ml-0.5 sm:-ml-1 text-[1.0rem] sm:text-[2.4rem] md:text-3xl font-semibold tracking-[0.04em]">REAM</span>
              <span className="ml-0.5 sm:ml-1 text-[1.5rem] sm:text-[2rem] md:text-[3rem] font-extrabold tracking-[0.04em]">A</span>
              <span className="-ml-0.5 sm:-ml-1 text-[1.0rem] sm:text-[2.4rem] md:text-3xl font-semibold tracking-[0.04em]">QUATICS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-6 xl:space-x-8">
            {categories.map((category) => (
              <Link
                key={category.value}
                to={`/category/${category.value}`}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none rounded px-2 py-1"
                aria-label={`View ${category.label} category`}
              >
                {category.label}
              </Link>
            ))}

            {/* Profile / Login */}
            <div className="relative flex items-center gap-2">
              {user && isAdmin ? null : user ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      dismissProfileHint();
                      setIsProfileOpen((prev) => !prev);
                    }}
                    data-profile-button
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-blue-300 bg-white shadow-[0_0_0_6px_rgba(37,99,235,0.08)] transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-[0_0_0_8px_rgba(37,99,235,0.12)] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                    aria-label="Account menu"
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-50 via-white to-blue-50 opacity-90" aria-hidden />
                    <span className="absolute inset-[6px] rounded-full bg-white shadow-inner" aria-hidden />
                    <span className="relative text-sm font-semibold text-slate-700">
                      {(user?.name || "U")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </button>
                  {showProfileHint && (
                    <div className="absolute right-0 top-12 z-50 hidden w-60 rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg xl:block">
                      <span className="absolute -top-2 right-4 h-3 w-3 rotate-45 border-l border-t border-blue-100 bg-white" aria-hidden />
                      Access your profile here.
                    </div>
                  )}
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
              {user && !isAdmin && isProfileOpen && (
                  <div
                    data-profile-menu
                    className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur"
                  >
                  <p className="text-sm font-semibold text-slate-800">Signed in</p>
                  <p className="text-base font-bold text-sky-800">{user.name}</p>
                  {user.email && <p className="text-xs text-slate-600 break-words">{user.email}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  >
                    Profile
                  </button>
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
                      setIsProfileOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
            
            {/* Cart / Notifications */}
            {!isRoleResolved ? null : isAdmin ? (
              <button
                type="button"
                onClick={() => onAdminOrdersOpen?.()}
                className={`relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none rounded ${newOrdersCount > 0 ? 'motion-safe:animate-pulse' : ''}`}
                aria-label={`Admin notifications with ${newOrdersCount} new orders`}
                data-orders-target="orders"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
                  <path d="M9.5 20a2.5 2.5 0 0 0 5 0" />
                </svg>
                {newOrdersCount > 0 && (
                  <span
                    className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    aria-label={`${newOrdersCount} new orders`}
                  >
                    {newOrdersCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onCartOpen?.()}
                className={`relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none rounded ${cartCount > 0 ? 'motion-safe:animate-pulse' : ''}`}
                aria-label={`Shopping cart with ${cartCount} items`}
                data-cart-target="cart"
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
              </button>
            )}
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex xl:hidden items-center space-x-2.5 flex-shrink-0">
            <div className="relative flex items-center gap-1.5">
              {user && isAdmin ? null : user ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      dismissProfileHint();
                      setIsProfileOpen((prev) => !prev);
                    }}
                    data-profile-button
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-300 bg-white shadow-[0_0_0_5px_rgba(37,99,235,0.08)] transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-[0_0_0_7px_rgba(37,99,235,0.12)] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                    aria-label="Account menu"
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-50 via-white to-blue-50 opacity-90" aria-hidden />
                    <span className="absolute inset-[4px] rounded-full bg-white shadow-inner" aria-hidden />
                    <span className="relative text-[11px] font-semibold text-slate-700">
                      {(user?.name || "U")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </button>
                  {showProfileHint && (
                    <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-blue-100 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-lg xl:hidden">
                      <span className="absolute -top-2 right-4 h-3 w-3 rotate-45 border-l border-t border-blue-100 bg-white" aria-hidden />
                      Access your profile here.
                    </div>
                  )}
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
              {user && !isAdmin && isProfileOpen && (
                <div
                  data-profile-menu
                  className="absolute right-0 top-11 z-40 w-60 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur"
                >
                  <p className="text-sm font-semibold text-slate-800">Signed in</p>
                  <p className="text-base font-bold text-sky-800">{user.name}</p>
                  {user.email && <p className="text-xs text-slate-600 break-words">{user.email}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  >
                    Profile
                  </button>
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
                      setIsProfileOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
            {/* Mobile Cart / Notifications */}
            {!isRoleResolved ? null : isAdmin ? (
              <button
                type="button"
                onClick={() => onAdminOrdersOpen?.()}
                className={`relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none rounded ${newOrdersCount > 0 ? 'motion-safe:animate-pulse' : ''}`}
                aria-label={`Admin notifications with ${newOrdersCount} new orders`}
                data-orders-target="orders"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
                  <path d="M9.5 20a2.5 2.5 0 0 0 5 0" />
                </svg>
                {newOrdersCount > 0 && (
                  <span
                    className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    aria-label={`${newOrdersCount} new orders`}
                  >
                    {newOrdersCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onCartOpen?.()}
                className={`relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none rounded ${cartCount > 0 ? 'motion-safe:animate-pulse' : ''}`}
                aria-label={`Shopping cart with ${cartCount} items`}
                data-cart-target="cart"
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
              </button>
            )}

            {/* Hamburger Menu Button */}
            <button
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none rounded"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              data-mobile-menu-button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <img src={close_ic} />
              ) : (
                <img src={hamburger_menu_ic} />
              )}
            </button>
          </div>

          {logoutConfirmOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
              onClick={(event) => {
                if (event.target === event.currentTarget) setLogoutConfirmOpen(false);
              }}
            >
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
                <h3 className="text-lg font-semibold text-slate-900">
                  Confirm logout
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Are you sure you want to log out?
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoutConfirmOpen(false)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setLogoutConfirmOpen(false);
                      await onLogout();
                      navigate('/');
                    }}
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden pb-4 space-y-2" data-mobile-menu>
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  navigate(`/category/${category.value}`);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded transition-colors focus:outline-none"
                aria-label={`View ${category.label} category`}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
    <div className="h-16 md:h-20" aria-hidden />
    </>
  );
};

export default Header;
