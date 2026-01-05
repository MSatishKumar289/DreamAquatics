const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const OrderSummary = ({
  itemCount,
  subtotal,
  shippingLabel = 'Calculated at checkout',
  taxLabel = 'Calculated at checkout',
  onCheckout,
}) => {
  const total = subtotal;
  const isDisabled = itemCount === 0;

  return (
    <section className="rounded-xl bg-white p-6 shadow-md ring-1 ring-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
      <p className="mt-1 text-sm text-gray-500">
        {itemCount} item{itemCount === 1 ? '' : 's'}
      </p>

      <dl className="mt-6 space-y-3 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium">
            {currencyFormatter.format(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Shipping</dt>
          <dd>{shippingLabel}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Taxes</dt>
          <dd>{taxLabel}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
          <dt>Total</dt>
          <dd>{currencyFormatter.format(total)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onCheckout}
        disabled={isDisabled}
        aria-label="Proceed to checkout"
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:bg-blue-200"
      >
        Checkout
      </button>
    </section>
  );
};

export default OrderSummary;


