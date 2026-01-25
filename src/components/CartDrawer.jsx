import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeItem, updateQty, itemCount, subtotal } = useCart();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

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
      if (event.key === 'Escape') onClose();
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

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const emptyState = cartItems.length === 0;

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex flex-none items-center justify-between border-b border-blue-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              DreamAquatics
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Cart</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            aria-label="Close cart"
          >
            Close
          </button>
        </header>

        <div className="flex flex-1 min-h-0 flex-col px-6 py-4">
          {emptyState ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-800">
                Your cart is empty
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Explore our collections and add items to your cart.
              </p>
              <Link
                to="/"
                onClick={onClose}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <section
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1"
              role="list"
              aria-label="Items in your cart"
            >
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => setPendingDelete(item)}
                  onIncrement={() => updateQty(item.id, item.qty + 1)}
                  onDecrement={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                />
              ))}
            </section>
          )}
        </div>

        {!emptyState && (
          <footer className="flex-none border-t border-blue-100 bg-blue-50 px-6 py-4">
            <div className="text-center text-xs text-slate-600">
              <span>Shipping calculated at checkout</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              Checkout -- INR {subtotal.toLocaleString('en-IN')}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">
              {itemCount} item{itemCount === 1 ? '' : 's'} in cart
            </p>
          </footer>
        )}

        {pendingDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) setPendingDelete(null);
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">
                Remove item?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Remove {pendingDelete.title} from your cart?
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeItem(pendingDelete.id);
                    setPendingDelete(null);
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

export default CartDrawer;
