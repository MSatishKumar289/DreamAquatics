import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#5eaeea] via-[#9dcdf0] to-[#d7eaf8] py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-[#EAF4FF] via-[#DDEEFF] to-[#CEE5FF] p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rotate-12 rounded-2xl bg-blue-400/20" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-16 w-20 -skew-x-[24deg] bg-blue-300/20" />
          <p className="text-xs uppercase tracking-[0.4em] text-blue-700">
            <span className="inline-block -skew-x-[10deg] rounded-[4px] bg-white/95 px-3 py-0.5 shadow-sm">
              <span className="inline-block skew-x-[10deg]">DreamAquatics</span>
            </span>
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            <span className="inline-block -skew-x-[10deg] rounded-[6px] bg-gradient-to-r from-[#0B4FA1] via-[#0A66D9] to-[#3D8EFF] px-4 py-1 text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)]">
              <span
                className="inline-block skew-x-[10deg]"
                style={{ fontFamily: "'Trajan Pro Regular', 'Trajan Pro', serif" }}
              >
                Terms and Conditions
              </span>
            </span>
          </h1>
          <p className="mt-2 text-sm text-blue-900">
            <span className="inline-block -skew-x-[10deg] rounded-[4px] bg-white/95 px-3 py-1 shadow-sm">
              <span className="inline-block skew-x-[10deg]">
                Please read these terms carefully before placing an order.
              </span>
            </span>
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
