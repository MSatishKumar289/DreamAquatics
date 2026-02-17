import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatOrderStatus } from "../lib/ordersApi";

const getStatusTone = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "cancelled") return "border-rose-200 bg-rose-50 text-rose-700";
  if (key === "delivered" || key === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (key === "in_transit") return "border-amber-200 bg-amber-50 text-amber-700";
  if (key === "accepted") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

const UserOrdersDrawer = ({
  isOpen,
  onClose,
  notifications = [],
  orders = [],
  lastRefreshedAt,
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
      if (event.key === "Escape") onClose?.();
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

  const lastRefreshedLabel = useMemo(() => {
    if (!lastRefreshedAt) return "Never";
    const diffMs = Date.now() - lastRefreshedAt;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin <= 0) return "Just now";
    if (diffMin === 1) return "1 min ago";
    return `${diffMin} min ago`;
  }, [lastRefreshedAt]);

  const latestOrderStates = useMemo(() => {
    return orders
      .slice(0, 6)
      .map((order) => ({
        id: order.id,
        orderNumber: order.order_number || order.id,
        status: order.status || "awaiting_approval",
        total: Number(order.total || 0),
        createdAt: order.created_at,
      }));
  }, [orders]);

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-md flex-col bg-gradient-to-b from-[#5eaeea] via-[#9dcdf0] to-[#d7eaf8] shadow-2xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex flex-none items-center justify-between border-b border-blue-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">DreamAquatics</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Order Updates</h2>
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

        <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span className="uppercase tracking-[0.2em]">Last refreshed</span>
            <span className="font-semibold text-slate-700">{lastRefreshedLabel}</span>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No new status updates</p>
              <p className="mt-2 text-xs text-slate-600">
                We will notify you here when your order status changes.
              </p>
            </div>
          ) : (
            <section className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-md shadow-slate-200/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Order {note.orderNumber}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatOrderStatus(note.previousStatus)} to {formatOrderStatus(note.status)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(note.status)}`}>
                      {formatOrderStatus(note.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">
                      Rs. {Number(note.total || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(note.changedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Latest Orders</p>
            <div className="mt-2 space-y-2">
              {latestOrderStates.length === 0 ? (
                <p className="text-xs text-slate-500">No orders placed yet.</p>
              ) : (
                latestOrderStates.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">#{order.orderNumber}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusTone(order.status)}`}>
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                navigate("/profile?tab=orders");
                onClose?.();
              }}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:brightness-105"
            >
              View all orders
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default UserOrdersDrawer;
