import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminOrdersDrawer = ({
  isOpen,
  onClose,
  orders = [],
  lastRefreshedAt
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsVisible(false);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    if (shouldRender) {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen, onClose]);

  const getOrderStatusKey = (order) => {
    const state = order.status || "awaiting_approval";
    if (state === "cancelled") return "cancelled";
    if (state !== "accepted") return state;
    return order.fulfillment || "accepted";
  };

  const sortedOrders = useMemo(() => {
    return orders
      .filter((order) => getOrderStatusKey(order) === "awaiting_approval")
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }, [orders]);

  const lastRefreshedLabel = useMemo(() => {
    if (!lastRefreshedAt) return "Never";
    const diffMs = Date.now() - lastRefreshedAt;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin <= 0) return "Just now";
    if (diffMin === 1) return "1 min ago";
    return `${diffMin} min ago`;
  }, [lastRefreshedAt]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex flex-none items-center justify-between border-b border-blue-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              DreamAquatics
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Notifications
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            aria-label="Close notifications"
          >
            Close
          </button>
        </header>

        <div className="flex flex-1 min-h-0 flex-col px-6 py-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span className="uppercase tracking-[0.2em]">Last refreshed</span>
            <span className="font-semibold text-slate-700">{lastRefreshedLabel}</span>
          </div>
          {sortedOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No new orders
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Accepted or canceled orders won’t show here.
              </p>
            </div>
          ) : (
            <section className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
              {sortedOrders.map((order) => {
                const items = order.items || [];
                const firstItem = items[0];
                const extraCount = Math.max(items.length - 1, 0);
                const dateLabel = new Date(order.placedAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );
                const statusLabel = {
                  text: "Awaiting Approval",
                  cls: "bg-slate-50 text-slate-600 border-slate-200",
                };
                const orderLabel = order.order_number || order.id;
                const itemLine = firstItem
                  ? `${firstItem.title}${extraCount > 0 ? ` + ${extraCount} more` : ""}`
                  : "Items pending";

                return (
                  <div
                    key={order.id}
                    className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-md shadow-slate-200/60 transition hover:shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                        <span>Order {orderLabel}</span>
                        <span>{dateLabel}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{itemLine}</p>
                        <p className="text-sm font-semibold text-slate-900">
                          Rs. {order.total.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        {statusLabel && (
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusLabel.cls}`}
                          >
                            {statusLabel.text}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/admin/add-product?orderId=${order.id}`);
                            onClose?.();
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          View ->
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </aside>
    </div>
  );
};

export default AdminOrdersDrawer;
