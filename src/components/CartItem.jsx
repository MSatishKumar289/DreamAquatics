import trash_ic from "../assets/Icons/trash_ic.svg";
import { getImageWithFallback } from "../assets";

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const CartItem = ({ item, onRemove, onIncrement, onDecrement }) => {
  const lineTotal = item.price * item.qty;

  let imageSrc = item.image;
  if (typeof item.image === 'string') {
    if (item.image.startsWith('http')) {
      imageSrc = item.image;
    } else {
      imageSrc = getImageWithFallback(item.image, item.title);
    }
  }

  return (
    <article
      className="relative flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      role="listitem"
      aria-label={item.title}
    >
      <img
        src={imageSrc}
        alt={item.title}
        className="h-20 w-20 flex-shrink-0 rounded-2xl border border-blue-100 bg-blue-50 object-cover"
      />

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
            {item.meta && (
              <p className="text-sm text-slate-500 line-clamp-1">{item.meta}</p>
            )}
            <div className="inline-flex items-center overflow-hidden rounded-full border border-blue-100 bg-blue-50">
              <button
                type="button"
                onClick={onDecrement}
                disabled={!onDecrement || item.qty <= 1}
                className="px-3 py-1.5 text-base font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-blue-300"
                aria-label={`Decrease quantity for ${item.title}`}
              >
                -
              </button>
              <span className="px-3 text-sm font-semibold text-blue-700">
                {item.qty}
              </span>
              <button
                type="button"
                onClick={onIncrement}
                disabled={!onIncrement}
                className="px-3 py-1.5 text-base font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-blue-300"
                aria-label={`Increase quantity for ${item.title}`}
              >
                +
              </button>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-900">
            {currencyFormatter.format(lineTotal)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.title} from cart`}
        className="absolute bottom-3 right-3 rounded-full border border-red-100 bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <img src={trash_ic} alt="Dlt" className="h-4 w-4" />
      </button>
    </article>
  );
};

export default CartItem;
