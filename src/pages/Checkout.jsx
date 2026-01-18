import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getImageWithFallback } from '../assets';
import editIc from '../assets/Icons/edit_ic.png';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Checkout = ({ user, onRequestLogin }) => {
  const { cartItems, subtotal, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [confirmStep, setConfirmStep] = useState('summary');
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
  const submitLabel = 'Review your order';
  const STANDARD_SHIPPING = 100;

  useEffect(() => {
    if (!isLoggedIn) return;
    setForm((prev) => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
    }));
  }, [isLoggedIn, user?.name, user?.email]);

  useEffect(() => {
    if (!orderPlaced) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
    setConfirmStep('summary');
  }, [orderPlaced]);

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

  const placeOrder = () => {
    console.info('Checkout details:', form);
    setOrderSnapshot({
      items: cartItems,
      subtotal,
      address: form,
    });
    setOrderPlaced(true);
    clearCart();
  };

  const handleReview = (event) => {
    event.preventDefault();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setOrderSnapshot({
      items: cartItems,
      subtotal,
      address: form,
    });
    setShowReviewScreen(true);
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

  if (orderPlaced || showReviewScreen) {
    const items = orderSnapshot?.items || cartItems;
    const orderSubtotal = orderSnapshot?.subtotal ?? subtotal;
    const STANDARD_SHIPPING = 100;
    const orderTotal = orderSubtotal + STANDARD_SHIPPING;
    const address = orderSnapshot?.address || form;
    const addressLines = [
      address.addressLine1?.trim(),
      address.addressLine2?.trim() || null,
      address.landmark?.trim() ? `Landmark: ${address.landmark.trim()}` : null,
      `${address.city?.trim()} - ${address.pincode?.trim()}`,
    ].filter(Boolean);

    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className="min-h-[calc(100dvh-1.5rem)] rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:min-h-0">
            {orderPlaced ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800">
                Your order has been placed successfully.
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Review</p>
                  <h2 className="text-xl font-semibold text-slate-900">Review your order</h2>
                </div>
              </div>
            )}
            {orderPlaced && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  Back to home
                </button>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="inline-flex w-full overflow-hidden rounded-full border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setConfirmStep('summary')}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    confirmStep === 'summary'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmStep('items')}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    confirmStep === 'items'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Items
                </button>
              </div>

              {confirmStep === 'summary' ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Delivery Address
                      </h2>
                      {!orderPlaced && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewScreen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50"
                          aria-label="Edit delivery address"
                          title="Edit address"
                        >
                          <img src={editIc} alt="" className="h-5 w-5" aria-hidden />
                        </button>
                      )}
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900">{address.name}</p>
                      <p>{address.email}</p>
                      <p>{address.mobile}</p>
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        {"\u20B9"}{orderSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>Standard shipping</span>
                      <span className="font-semibold text-gray-900">
                        {"\u20B9"}{STANDARD_SHIPPING}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
                      <span>Total (shipping included)</span>
                      <span>{"\u20B9"}{orderTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Final shipping may vary based on delivery distance. We will confirm before dispatch.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      No items found in the cart.
                    </p>
                  ) : (
                    <div
                      className={`space-y-3 ${
                        items.length >= 3
                          ? "max-h-[360px] overflow-y-auto pr-1"
                          : ""
                      }`}
                    >
                      {items.map((item) => {
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
                            className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                          >
                            <img
                              src={imageSrc}
                              alt={item.title}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-base font-semibold text-gray-900">
                                {item.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty {item.qty}
                              </p>
                            </div>
                            <p className="text-base font-semibold text-gray-900">
                              {"\u20B9"}{(item.price * item.qty).toLocaleString('en-IN')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!orderPlaced && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={placeOrder}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  Confirm order
                </button>
              </div>
            )}
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
          <form className="space-y-6" onSubmit={handleReview}>
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
                type="button"
                onClick={handleReview}
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
