import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const CartPage = () => {
  const { cartItems, removeItem, updateQty, itemCount, subtotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const emptyState = cartItems.length === 0;

  const FREE_DELIVERY_THRESHOLD = 499;
  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - subtotal
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl justify-end px-4 sm:px-6 lg:px-8">
        <section className="flex w-full max-w-md flex-col rounded-3xl border border-emerald-100 bg-white shadow-xl">
          <header className="flex items-center justify-between border-b border-emerald-100 px-6 py-4">
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
              {[
                { label: 'Free Delivery', note: 'above ₹499' },
                { label: 'Free Seed', note: 'worth ₹99' },
                { label: 'Free Neem Oil', note: 'worth ₹199' },
              ].map((perk) => (
                <div key={perk.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                    ✓
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
                  Add ₹{remainingForFreeDelivery.toLocaleString('en-IN')} more
                  for Free Delivery
                </>
              ) : (
                <>You unlocked Free Delivery</>
              )}
            </div>
          </div>

          <div className="flex-1 px-6 py-4">
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
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <section
                className="max-h-[420px] space-y-3 overflow-y-auto pr-1"
                role="list"
                aria-label="Items in your cart"
              >
                {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onIncrement={() => updateQty(item.id, item.qty + 1)}
                  onDecrement={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                />
                ))}
              </section>
            )}
          </div>

          {!emptyState && (
            <footer className="border-t border-emerald-100 bg-emerald-50 px-6 py-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Shipping calculated at checkout</span>
                <span className="font-semibold text-emerald-700">
                  ₹0 saved
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
              >
                Checkout — ₹{subtotal.toLocaleString('en-IN')}
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">
                {itemCount} item{itemCount === 1 ? '' : 's'} in cart
              </p>
            </footer>
          )}
        </section>
      </div>
    </main>
  );
};

export default CartPage;
