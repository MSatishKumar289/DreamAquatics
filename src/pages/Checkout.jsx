import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    pincode: '',
    landmark: '',
    mobile: '',
  });
  const [errors, setErrors] = useState({});
  const showLoginPrompt = !user?.email;

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!formData.addressLine1.trim()) nextErrors.addressLine1 = 'Address line 1 is required.';
    if (!formData.city.trim()) nextErrors.city = 'City is required.';
    if (!/^\d{6}$/.test(formData.pincode)) nextErrors.pincode = 'Pin code must be 6 digits.';
    if (!/^\d{10}$/.test(formData.mobile)) nextErrors.mobile = 'Mobile number must be 10 digits.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    console.info('Checkout address captured', formData);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Checkout</p>
              <h1 className="text-2xl font-semibold text-slate-900 whitespace-nowrap">Delivery address</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Address line 1
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House number, street"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                {errors.addressLine1 && (
                  <span className="mt-1 block text-xs text-rose-600">{errors.addressLine1}</span>
                )}
              </label>
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Address line 2
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Area, apartment, floor (optional)"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                City
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                {errors.city && <span className="mt-1 block text-xs text-rose-600">{errors.city}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Pin code
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData((prev) => ({ ...prev, pincode: nextValue }));
                  }}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="Pin code"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                {errors.pincode && <span className="mt-1 block text-xs text-rose-600">{errors.pincode}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Landmark
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Nearby landmark"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              Mobile number
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={(event) => {
                  const nextValue = event.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData((prev) => ({ ...prev, mobile: nextValue }));
                }}
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="Mobile number"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              {errors.mobile && <span className="mt-1 block text-xs text-rose-600">{errors.mobile}</span>}
            </label>

            <div className="flex justify-center">
              <button
                type="submit"
                className="btn-primary"
              >
                Place Your Order
              </button>
            </div>
          </form>

          {showLoginPrompt && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 px-4 py-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>Already have an account? Log in to prefill your details.</span>
              <button
                type="button"
                onClick={handleLoginClick}
                className="btn-primary"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Checkout;
