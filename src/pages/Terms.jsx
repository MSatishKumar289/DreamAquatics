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
            <h2 className="text-lg font-semibold text-slate-900">Order Confirmation</h2>
            <p className="mt-2 text-sm text-slate-600">
              Once an order is placed, it will be verified to ensure product availability. The customer will receive an order confirmation message on WhatsApp.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Order Payment</h2>
            <p className="mt-2 text-sm text-slate-600">
              All orders are processed only after full payment of the order value plus shipment charges is received.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              No advance booking of products is allowed unless explicitly mentioned.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              All payments are accepted through UPI transactions. COD (Cash on Delivery) is not available.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Once payment is received, the customer will be notified on WhatsApp.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Shipment Processing Time</h2>
            <p className="mt-2 text-sm text-slate-600">
              All orders are processed within 1 to 2 business days. During periods of high order volume, shipments may be delayed by a few days. Kindly allow additional transit time for delivery.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              If there is a significant delay in shipment, we will contact you via email or WhatsApp. Some orders may also be delayed due to fish quarantine procedures, and customized tanks and stands may take more time than usual orders.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Note: Orders are not shipped or delivered on weekends or holidays.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Shipping Charges</h2>
            <p className="mt-2 text-sm text-slate-600">
              Checkout includes a standard shipping charge of Rs. 100.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Additional shipping charges may apply based on product weight and size. These charges will be informed to the customer before shipment. The package will be shipped only after the additional amount is collected.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Packing Details</h2>
            <p className="mt-2 text-sm text-slate-600">
              Dry goods (such as food, medicine, filters, lights, and live plants) are packed in carton boxes. All products are inspected and verified before packing and dispatch.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              A photo or video will be shared with customers prior to dispatch.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Damage and DOA (Dead on Arrival) Policy</h2>
            <p className="mt-2 text-sm text-slate-600">
              If items are damaged during shipping and become unusable, they are covered under our DOA claim policy.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              If any live fish die during transit, we will process a claim and provide a replacement after verification.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Any DOA or damaged goods must be reported within 1 hour after unpacking.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Important: A clear unboxing video clip is required to process any DOA or damaged accessory claims.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              The video must be recorded with original packing visible, and proper acclimation must be followed for all live products (fish, plants, shrimps, and snails).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Return Policy</h2>
            <p className="mt-2 text-sm text-slate-600">
              Returns are not accepted once an order is shipped or delivered, except in cases covered under damaged, defective, incorrect item, or eligible DOA claims.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Return Eligibility</h2>
            <p className="mt-2 text-sm text-slate-600">
              Damaged or Defective Products: If an item arrives damaged or defective, you can request a return. Claims must be submitted within 2 hours of delivery.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Incorrect Items: If you receive an incorrect product, you are eligible for a return. Exchanges are processed only if we sent the wrong product.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Dead on Arrival (DOA) for Live Fish: Returns are not accepted for live fish or live plants under normal circumstances, except valid DOA claims for fish as per our DOA policy.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Non-Returnable Items: Live plants and live fish are not eligible for general returns.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Non-Returnable Items</h2>
            <p className="mt-2 text-sm text-slate-600">
              Live plants and fish cannot be returned once shipped.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Opened or used products are not returnable.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Custom orders (made-to-order or customized items) are not returnable.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Delivery Timeframe</h2>
            <p className="mt-2 text-sm text-slate-600">
              Once your order is shipped, you will receive a shipment confirmation on WhatsApp with a tracking ID/number. Tracking is usually activated within 6 hours.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Delivery usually takes 1 to 2 business days for domestic shipping, 3 to 5 business days for parts of South India, 4 to 7 business days for parts of North India, and 7 to 8 days for parts of North-East India.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Customers are advised to track shipments using the provided tracking ID/number and contact the respective delivery agency in case of delays.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              In some rural locations, orders may need to be collected at the courier center. If delivery is delayed, please do not wait for doorstep delivery and kindly visit the respective delivery agency.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Business/Working Days: Monday to Friday.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Shipping Partners: ST Courier, DTDC, French Courier, Expressbee, and Indian Postal Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Refund Process</h2>
            <p className="mt-2 text-sm text-slate-600">
              Refund Method: Refunds are processed to the original payment method. Shipping costs are non-refundable.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Exchange Policy: Exchanges are offered only if we have sent the wrong product.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Refunds typically take 1 to 2 business days to process.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Shipping Costs for Returns</h2>
            <p className="mt-2 text-sm text-slate-600">
              Damaged or Incorrect Products: We will cover return shipping costs.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Customer Returns: For returns not caused by a defect or our error, the customer is responsible for return shipping charges.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Order Cancellation</h2>
            <p className="mt-2 text-sm text-slate-600">
              Customers are advised to cancel orders before packing/shipment. Once shipped, order cancellation is not valid.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Final Note</h2>
            <p className="mt-2 text-sm text-slate-600">
              These terms and conditions are drafted to ensure and protect fair value for both parties (buyer and seller).
            </p>
            <p className="mt-2 text-sm text-slate-600">
              For feedback regarding these terms and conditions, customers are welcome to share their suggestions via email or WhatsApp.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Thank you to all customers for your valuable time, trust, and support. We are committed to providing satisfactory service to all.
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
