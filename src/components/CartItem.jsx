import trash_ic from "../assets/Icons/trash_ic.svg";
import { getImageWithFallback } from "../assets";

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const CartItem = ({ item, onRemove }) => {
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
      className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center"
      role="listitem"
      aria-label={item.title}
    >
      <div className="flex items-start gap-4">
        <img
          src={imageSrc}
          alt={item.title}
          className="h-28 w-28 rounded-md object-cover"
        />

        <div className="flex flex-1 flex-col gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Dream Aquatics
            </p>
            <h3 className="text-base font-semibold text-gray-900">
              {item.title}
            </h3>
            {item.meta && (
              <p className="text-sm text-gray-500 line-clamp-1">{item.meta}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
              {currencyFormatter.format(item.price)}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Total <span className="ml-1 text-slate-900">{item.qty}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 md:justify-end">
        <p className="text-sm font-medium text-gray-700">
          Subtotal:{' '}
          <span className="text-gray-900">
            {currencyFormatter.format(lineTotal)}
          </span>
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.title} from cart`}
          className="text-sm font-semibold text-red-600 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <img src={trash_ic} alt="Dlt"/>
        </button>
      </div>
    </article>
  );
};

export default CartItem;


