import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const CartPage = () => {
  const { cartItems, removeItem, updateQty, itemCount, subtotal } = useCart();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleCheckout = () => {
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const emptyState = cartItems.length === 0;

  const FREE_DELIVERY_THRESHOLD = 499;
  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - subtotal
  );

  const perks = [
    { label: 'Free Delivery', note: 'above \u20B91,499' },
    { label: 'Free Seed', note: 'worth \u20B9199' },
    { label: 'Free Neem Oil', note: 'worth \u20B91,199' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl justify-end px-4 sm:px-6 lg:px-8">
        <section className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-6rem)]">
          <header className="flex flex-none items-center justify-between border-b border-emerald-100 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Dream Aquatics
              </p>
              <h1 className="mt-1 text-lg font-semibold text-slate-900">
                Cart
              </h1>
            </div>
          </header>

          <div className="px-6 pt-4">
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
              {perks.map((perk) => (
                <div key={perk.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                    *
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">
                    {perk.label}
                  </div>
                  <div className="text-[10px] text-slate-500">{perk.note}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {remainingForFreeDelivery > 0 ? (
                <>
                  Add {'\u20B9'}{remainingForFreeDelivery.toLocaleString('en-IN')} more
                  for Free Delivery
                </>
              ) : (
                <>You unlocked Free Delivery</>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 px-6 py-4">
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
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <footer className="order-1 flex-none rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 md:order-2 md:rounded-none md:border-0 md:border-t">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Shipping calculated at checkout</span>
                    <span className="font-semibold text-emerald-700">
                      {'\u20B9'}10 saved
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
                  >
                    Checkout {'\u20B9'}{subtotal.toLocaleString('en-IN')}
                  </button>
                  <p className="mt-2 text-center text-xs text-slate-500">
                    {itemCount} item{itemCount === 1 ? '' : 's'} in cart
                  </p>
                </footer>

                <section
                  className="order-2 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 md:order-1"
                  role="list"
                  aria-label="Items in your cart"
                >
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={() => setPendingDelete(item)}
                      onIncrement={() => updateQty(item.id, item.qty + 1)}
                      onDecrement={() => {
                        if (item.qty <= 1) {
                          setPendingDelete(item);
                          return;
                        }
                        updateQty(item.id, item.qty - 1);
                      }}
                    />
                  ))}
                </section>
              </div>
            )}
          </div>
        </section>
      </div>

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
    </main>
  );
};

export default CartPage;
