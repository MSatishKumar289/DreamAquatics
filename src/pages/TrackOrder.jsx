import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { lookupOrderByIdAndMobile } from "../lib/orderLookupApi";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const location = useLocation();
  
  useEffect(() => {
       const preset = new URLSearchParams(location.search).get("orderId");
       
       if (preset) setOrderId(preset); }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setOrder(null);

    if (!orderId.trim() || !mobile.trim()) {
      setError("Please enter both Order ID and Mobile number.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: lookupError } = await lookupOrderByIdAndMobile({
        orderId: orderId.trim(),
        mobile: mobile.trim(),
      });

      if (lookupError || !data?.order) {
        setError("Order not found. Please check the details and try again.");
        return;
      }

      setOrder(data.order);
    } catch (err) {
      setError(err.message || "Unable to fetch order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="text-sm text-gray-500">Track Order</p>
          <h1 className="text-3xl font-bold text-gray-900">Find your order</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-gray-700">
              Order ID
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. b3878868-a2ce-4692-8cf4-2b28d9391f30"
              />
            </label>

            <label className="block text-sm font-semibold text-gray-700">
              Mobile number
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="10-digit mobile"
              />
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              {loading ? "Searching..." : "Track order"}
            </button>
          </form>
        </section>

        {order && (
          <section className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900">Order details</h2>
              <p className="text-sm text-gray-600">Order ID: {order.id}</p>
              {order.order_number && (
                <p className="text-sm text-gray-600">Order number: {order.order_number}</p>
              )}
              <p className="text-sm text-gray-600">Status: {order.status}</p>
              <p className="text-sm text-gray-600">
                Total: ?{Number(order.total || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Delivery address</h3>
              <div className="mt-2 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                {order.customer_email && <p>{order.customer_email}</p>}
                <p>{order.customer_mobile}</p>
                <p>{order.address_line1}</p>
                {order.address_line2 && <p>{order.address_line2}</p>}
                {order.landmark && <p>Landmark: {order.landmark}</p>}
                <p>
                  {order.city} - {order.pincode}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Items</h3>
              <div className="mt-3 space-y-3">
                {(order.order_items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">Qty {item.qty}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ?{Number(item.line_total || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default TrackOrder;

