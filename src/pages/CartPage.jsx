import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';

const CartPage = () => {
  const { cartItems, removeItem, itemCount, subtotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const emptyState = cartItems.length === 0;

  const cartContainerClasses =
    'flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8';

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-500">Dream Aquatics</p>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {emptyState ? (
          <section className="rounded-lg bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">
              Your cart is empty
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Explore our collections and add items to your cart.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Continue shopping
            </Link>
          </section>
        ) : (
          <div className={cartContainerClasses}>
            <section
              className="order-2 max-h-[520px] space-y-4 overflow-y-auto pr-1 lg:order-1 lg:max-h-[640px]"
              role="list"
              aria-label="Items in your cart"
            >
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </section>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
              <OrderSummary
                itemCount={itemCount}
                subtotal={subtotal}
                onCheckout={handleCheckout}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;
