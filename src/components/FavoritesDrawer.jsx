import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';

const FavoritesDrawer = ({ isOpen, onClose }) => {
  const { favoriteItems, removeFavorite, favoriteCount } = useFavorites();
  const { addToCart, cartItems, updateQty, removeItem } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [favoriteToast, setFavoriteToast] = useState('');
  const [favoriteToastType, setFavoriteToastType] = useState('success');
  const [pendingCartRemovalItem, setPendingCartRemovalItem] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsVisible(false);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    if (shouldRender) {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!favoriteToast) return;
    const timer = setTimeout(() => {
      setFavoriteToast('');
    }, 1800);
    return () => clearTimeout(timer);
  }, [favoriteToast]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        className={`da-drawer-panel ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="da-drawer-header">
          <div>
            <p className="da-drawer-brand">
              <span className="skew-x-[10deg]">DreamAquatics</span>
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Favorites
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="da-drawer-close"
            aria-label="Close favorites"
          >
            Close
          </button>
        </header>

        <div className="flex flex-1 min-h-0 flex-col px-6 py-4">
          {favoriteItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No favorites yet
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Tap the heart icon on any product to save it here.
              </p>
              <Link
                to="/"
                onClick={onClose}
                className="da-cta-amber da-cta-amber-pill mt-4 px-4 text-xs tracking-wide"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <section
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1"
              role="list"
              aria-label="Favorite items"
            >
              {favoriteItems.map((item) => (
                (() => {
                  const cartEntry = cartItems.find((cartItem) => cartItem.id === item.id);
                  const currentQty = cartEntry?.qty || 0;
                  const availabilityText = String(item?.availability || item?.status || '').toLowerCase();
                  const parsedStockCount = Number.isFinite(Number(item?.stock_count))
                    ? Number(item?.stock_count)
                    : null;
                  const isSoldOut = parsedStockCount !== null
                    ? parsedStockCount <= 0
                    : /out|sold/.test(availabilityText);

                  return (
                <article
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      INR {Number(item.price || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {currentQty > 0 ? (
                      <div
                        className="inline-flex h-8 items-center justify-between rounded-full border border-blue-200 bg-blue-50 px-1.5"
                        role="group"
                        aria-label={`Quantity control for ${item.title}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (currentQty <= 1) {
                              setPendingCartRemovalItem(item);
                              return;
                            }
                            updateQty(item.id, currentQty - 1);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold text-blue-700 hover:bg-blue-100"
                          aria-label={`Decrease quantity for ${item.title}`}
                        >
                          -
                        </button>
                        <span className="min-w-[24px] text-center text-xs font-semibold text-blue-700">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, currentQty + 1)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-semibold text-blue-700 hover:bg-blue-100"
                          aria-label={`Increase quantity for ${item.title}`}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSoldOut) return;
                          addToCart(item, 1);
                        }}
                        disabled={isSoldOut}
                        className="da-add-cart-btn rounded-[5px] px-3 py-1.5 text-xs"
                        aria-label={`Add ${item.title} to cart`}
                      >
                        Add to Cart
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await removeFavorite(item.id);
                        if (error) {
                          setFavoriteToastType('error');
                          setFavoriteToast('Some error occurred, try again later');
                          return;
                        }
                        setFavoriteToastType('success');
                        setFavoriteToast(`${item.title} removed from favorites`);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center self-end rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                      aria-label={`Remove ${item.title} from favorites`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 21s-7-4.35-9.5-8.4C.8 9.6 2.2 5.8 5.8 5c2.2-.5 4.2.4 5.2 2.1 1-1.7 3-2.6 5.2-2.1 3.6.8 5 4.6 3.3 7.6C19 16.65 12 21 12 21Z" />
                      </svg>
                    </button>
                  </div>
                </article>
                  );
                })()
              ))}
            </section>
          )}
        </div>

        {favoriteItems.length > 0 && (
          <footer className="da-drawer-footer">
            <p className="text-center text-xs text-slate-600">
              {favoriteCount} item{favoriteCount === 1 ? '' : 's'} saved
            </p>
          </footer>
        )}

        {favoriteToast && (
          <div className="pointer-events-none absolute inset-x-4 bottom-16 z-10 flex justify-center">
            <div className={favoriteToastType === 'error' ? 'da-toast-error' : 'da-toast-info'}>
              {favoriteToast}
            </div>
          </div>
        )}

        {pendingCartRemovalItem && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setPendingCartRemovalItem(null);
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">
                Remove item?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Remove {pendingCartRemovalItem.title} from your cart?
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingCartRemovalItem(null)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(pendingCartRemovalItem.id);
                    setPendingCartRemovalItem(null);
                  }}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default FavoritesDrawer;
