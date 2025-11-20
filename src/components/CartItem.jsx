import trash_ic from "../assets/Icons/trash_ic.svg";

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const CartItem = ({ item, onIncrement, onDecrement, onRemove }) => {
  const disableMinus = item.qty <= 1;
  const lineTotal = item.price * item.qty;

  return (
    <article
      className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center"
      role="listitem"
      aria-label={item.title}
    >
      <img
        src={item.image}
        alt={item.title}
        className="h-24 w-24 rounded-md object-cover"
      />

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {item.title}
            </h3>
            {item.meta && (
              <p className="text-sm text-gray-500 line-clamp-1">{item.meta}</p>
            )}
          </div>
          <p className="text-base font-semibold text-gray-900">
            {currencyFormatter.format(item.price)}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="inline-flex items-center overflow-hidden rounded-md border border-gray-300"
            role="group"
            aria-label={`Quantity control for ${item.title}`}
          >
            <button
              type="button"
              onClick={onDecrement}
              disabled={disableMinus}
              aria-label={`Decrease quantity for ${item.title}`}
              className="px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              -
            </button>
            <span className="px-4 py-2 text-sm font-semibold text-gray-900">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              aria-label={`Increase quantity for ${item.title}`}
              className="px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              +
            </button>
          </div>

          <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
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
        </div>
      </div>
    </article>
  );
};

export default CartItem;


