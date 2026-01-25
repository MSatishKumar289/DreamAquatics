import { useEffect, useMemo, useState } from "react";

const AdminOrdersDrawer = ({
  isOpen,
  onClose,
  orders = [],
  onUpdateOrderStatus,
  onUpdateOrderFulfillment
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [pendingFulfillment, setPendingFulfillment] = useState({});

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

  useEffect(() => {
    if (isOpen) return;
    setEditingOrderId(null);
    setPendingFulfillment({});
  }, [isOpen]);

  const getOrderStatusKey = (order) => {
    const state = order.status || "new";
    if (state === "cancelled") return "cancelled";
    if (state !== "accepted") return state;
    return order.fulfillment || "accepted";
  };

  const sortedOrders = useMemo(() => {
    return orders
      .filter((order) => getOrderStatusKey(order) === "new")
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  }, [orders]);

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
                const firstItem = order.items[0];
                const extraCount = Math.max(order.items.length - 1, 0);
                const dateLabel = new Date(order.placedAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );
                const orderState = order.status || "new";
                const committedFulfillment = order.fulfillment || null;
                const isEditing = editingOrderId === order.id;
                const fulfillment =
                  pendingFulfillment[order.id] ?? committedFulfillment ?? "in-transit";
                const statusLabel =
                  orderState === "cancelled"
                    ? {
                        text: "Canceled",
                        cls: "bg-rose-50 text-rose-700 border-rose-200",
                      }
                    : orderState === "accepted" && !committedFulfillment
                    ? {
                        text: "Accepted",
                        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      }
                    : orderState === "accepted" &&
                      committedFulfillment === "cancelled"
                    ? {
                        text: "Canceled",
                        cls: "bg-rose-50 text-rose-700 border-rose-200",
                      }
                    : orderState === "accepted" &&
                      committedFulfillment === "in-transit"
                    ? {
                        text: "In Transit",
                        cls: "bg-amber-50 text-amber-700 border-amber-200",
                      }
                    : orderState === "accepted" &&
                      committedFulfillment === "completed"
                    ? {
                        text: "Completed",
                        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      }
                    : null;
                const isDirty = fulfillment !== (committedFulfillment ?? "in-transit");

                return (
                  <div
                    key={order.id}
                    className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[200px] flex-1">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Order {order.id}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          <span className="inline-flex flex-wrap items-center gap-2">
                            <span>
                              {firstItem?.title}
                              {extraCount > 0 ? ` + ${extraCount} more` : ""}
                            </span>
                            {statusLabel && (
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusLabel.cls}`}
                              >
                                {statusLabel.text}
                              </span>
                            )}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-slate-600">{dateLabel}</p>
                      </div>

                      <div className="text-sm font-semibold text-slate-900">
                        Rs. {order.total.toLocaleString("en-IN")}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {orderState === "new" && (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus?.(order.id, "accepted")}
                              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus?.(order.id, "cancelled")}
                              className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                          {orderState === "accepted" && (
                            <>
                              {!isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingOrderId(order.id);
                                    setPendingFulfillment((prev) => ({
                                      ...prev,
                                      [order.id]: committedFulfillment ?? "in-transit"
                                    }));
                                  }}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                  Edit
                                </button>
                              ) : (
                                <>
                                  <select
                                    value={fulfillment}
                                    onChange={(event) =>
                                      setPendingFulfillment((prev) => ({
                                        ...prev,
                                        [order.id]: event.target.value
                                      }))
                                    }
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                                  >
                                    <option value="in-transit">In transit</option>
                                    <option value="completed">Order completed</option>
                                    <option value="cancelled">Order cancelled</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateOrderFulfillment?.(order.id, fulfillment);
                                      setEditingOrderId(null);
                                      setPendingFulfillment((prev) => {
                                        const next = { ...prev };
                                        delete next[order.id];
                                        return next;
                                      });
                                    }}
                                    disabled={!isDirty}
                                    className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingOrderId(null);
                                      setPendingFulfillment((prev) => {
                                        const next = { ...prev };
                                        delete next[order.id];
                                        return next;
                                      });
                                    }}
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                                  >
                                    Cancel
                                </button>
                              </>
                            )}
                          </>
                        )}
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
