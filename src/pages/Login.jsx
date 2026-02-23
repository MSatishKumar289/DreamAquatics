import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useCart } from '../context/CartContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, subtotal } = useCart();
  const cameFromCheckout = Boolean(location.state?.from?.pathname?.startsWith('/checkout'));
  const adminWhatsAppNumber = '918667418965';

  const buildWhatsAppOrderLink = () => {
    if (!adminWhatsAppNumber) return '';
    const orderSubtotal = subtotal || 0;
    const orderTotal = orderSubtotal + 100;
    const itemsText = (cartItems || [])
      .map((item) => {
        const title = item.title || item.name || 'Item';
        const qty = item.qty || 1;
        const price = Number(item.price || 0);
        return `${title} x${qty} - Rs. ${price.toLocaleString('en-IN')}`;
      })
      .join('\n');
    const message = itemsText
      ? `Hi Dream Aquatics, I want to place an order via WhatsApp.\n\nItems: ${itemsText}\nSubtotal: Rs. ${orderSubtotal.toLocaleString('en-IN')}\nShipping: Rs. 100\nTotal: Rs. ${orderTotal.toLocaleString('en-IN')}`
      : 'Hi Dream Aquatics, I want to place an order via WhatsApp.';
    return `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-blue-300/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-sky-400/35 via-cyan-300/30 to-blue-500/35 blur-3xl" aria-hidden />
        <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
          <AuthForm
            variant="page"
            onSuccess={handleAuthSuccess}
          />
          {cameFromCheckout && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-900">
              <p className="font-semibold">Prefer WhatsApp?</p>
              <p className="mt-1 text-xs text-emerald-800">
                You can place your order directly with our team if you need help.
              </p>
              <div className="mt-3 flex justify-center">
                <a
                  href={buildWhatsAppOrderLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/70 bg-emerald-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
                >
                  WhatsApp to order
                </a>
              </div>
            </div>
          )}
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">
              <Link to="/" className="font-semibold text-sky-600 hover:text-sky-700">
                Explore the collection
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
