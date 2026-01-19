import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">DreamAquatics</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please read these terms carefully before placing an order.
          </p>
        </header>

        <section className="mt-6 space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
            <p className="mt-2 text-sm text-slate-600">
              By using this website you agree to these terms. We may update these
              terms from time to time, and the latest version will always be
              available here.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Orders and Availability</h2>
            <p className="mt-2 text-sm text-slate-600">
              Product availability is shown on the listing cards. We reserve the
              right to cancel or adjust any order if stock changes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>
            <p className="mt-2 text-sm text-slate-600">
              Prices shown on the site are subject to change without notice. Final
              pricing is confirmed before dispatch.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Shipping</h2>
            <p className="mt-2 text-sm text-slate-600">
              Standard shipping applies. Final shipping charges may vary based on
              delivery distance and will be confirmed before dispatch.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
            <p className="mt-2 text-sm text-slate-600">
              Payment details are shared via WhatsApp after you place the order.
              Your order is processed once payment is confirmed.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Support</h2>
            <p className="mt-2 text-sm text-slate-600">
              For any questions about your order, reach out using the contact
              options on the home page.
            </p>
          </div>
        </section>

        <div className="mt-6 text-sm text-slate-600">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Terms;
