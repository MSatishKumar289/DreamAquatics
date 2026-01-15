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
      className="relative flex gap-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
      role="listitem"
      aria-label={item.title}
    >
      <img
        src={imageSrc}
        alt={item.title}
        className="h-28 w-28 flex-shrink-0 rounded-xl border border-gray-200 bg-gray-50 object-cover sm:h-32 sm:w-32"
      />

      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
          {item.meta && (
            <p className="text-sm text-gray-500 line-clamp-1">{item.meta}</p>
          )}
          <p className="text-sm font-semibold text-gray-700">Qty {item.qty}</p>
          <p className="text-sm font-semibold text-gray-700">
            Total {currencyFormatter.format(lineTotal)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.title} from cart`}
        className="absolute bottom-4 right-4 rounded-full p-1 text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <img src={trash_ic} alt="Dlt" className="h-5 w-5" />
      </button>
    </article>
  );
};

export default CartItem;


