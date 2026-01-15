import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getImageWithFallback } from '../assets';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Checkout = ({ user, onRequestLogin }) => {
  const { cartItems, subtotal, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    landmark: '',
    pincode: '',
    mobile: '',
  });
  const [errors, setErrors] = useState({});

  const isLoggedIn = !!user?.email;
  const submitLabel = 'Place your order';

  useEffect(() => {
    if (!isLoggedIn) return;
    setForm((prev) => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
    }));
  }, [isLoggedIn, user?.name, user?.email]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDigitsOnly = (field, maxLength) => (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, maxLength);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validationErrors = useMemo(() => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.email.trim()) {
      next.email = 'Email is required.';
    } else if (!emailRegex.test(form.email)) {
      next.email = 'Enter a valid email.';
    }
    if (!form.addressLine1.trim()) next.addressLine1 = 'Address is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.pincode.trim()) {
      next.pincode = 'Pincode is required.';
    } else if (form.pincode.length !== 6) {
      next.pincode = 'Pincode must be 6 digits.';
    }
    if (!form.mobile.trim()) {
      next.mobile = 'Mobile number is required.';
    } else if (form.mobile.length !== 10) {
      next.mobile = 'Mobile number must be 10 digits.';
    }
    return next;
  }, [form]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    console.info('Checkout details:', form);
    setOrderPlaced(true);
    clearCart();
  };

  const formattedAddress = useMemo(() => {
    const line2 = form.addressLine2.trim();
    const landmark = form.landmark.trim();
    const parts = [
      form.addressLine1.trim(),
      line2 ? line2 : null,
      landmark ? `Landmark: ${landmark}` : null,
      `${form.city.trim()} - ${form.pincode.trim()}`,
    ].filter(Boolean);

    return parts;
  }, [form]);

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Your order has been placed successfully.
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No items found in the cart.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      let imageSrc = item.image;
                      if (typeof item.image === 'string') {
                        if (!item.image.startsWith('http')) {
                          imageSrc = getImageWithFallback(item.image, item.title);
                        }
                      }
                      if (!imageSrc) {
                        imageSrc = getImageWithFallback('', item.title);
                      }

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3"
                        >
                          <img
                            src={imageSrc}
                            alt={item.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty {item.qty}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delivery Address
                  </h2>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">{form.name}</p>
                    <p>{form.email}</p>
                    <p>{form.mobile}</p>
                    {formattedAddress.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-500">Checkout</p>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Address</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          {!isLoggedIn && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              You are checking out as a guest. Your order updates will be sent to
              the email and mobile number below.
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">
                Name *
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {errors.name && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.name}
                  </span>
                )}
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Email *
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {errors.email && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.email}
                  </span>
                )}
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-700">
              Address Line 1 *
              <input
                type="text"
                value={form.addressLine1}
                onChange={handleChange('addressLine1')}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              {errors.addressLine1 && (
                <span className="mt-1 block text-xs text-red-600">
                  {errors.addressLine1}
                </span>
              )}
            </label>

            <label className="block text-sm font-semibold text-gray-700">
              Address Line 2
              <input
                type="text"
                value={form.addressLine2}
                onChange={handleChange('addressLine2')}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-semibold text-gray-700">
                City *
                <input
                  type="text"
                  value={form.city}
                  onChange={handleChange('city')}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {errors.city && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.city}
                  </span>
                )}
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Pincode *
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={form.pincode}
                  onChange={handleDigitsOnly('pincode', 6)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {errors.pincode && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.pincode}
                  </span>
                )}
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Mobile *
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={form.mobile}
                  onChange={handleDigitsOnly('mobile', 10)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {errors.mobile && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.mobile}
                  </span>
                )}
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-700">
              Landmark
              <input
                type="text"
                value={form.landmark}
                onChange={handleChange('landmark')}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                className="w-full max-w-xs rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                {submitLabel}
              </button>

              {!isLoggedIn && (
                <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 px-5 py-4 text-center text-sm text-gray-700">
                  <span>Already have an account? Log in to prefill details.</span>
                  <button
                    type="button"
                    onClick={onRequestLogin}
                    className="w-full max-w-xs rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Checkout;
