const OrdersPanel = ({
  adminOrders,
  filteredAdminOrders,
  adminOrderFilter,
  setAdminOrderFilter,
  adminOrderCounts,
  ordersLoading,
  ordersError,
  handleQuickOrderStatusUpdate,
  getOrderStatusLabel,
  formatOrderStatus,
  setSelectedAdminOrder,
  setSelectedOrderStatusDraft
}) => (
  <section className="md:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
        <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
        <p className="mt-1 text-xs text-slate-500">
          Showing {filteredAdminOrders.length} of {adminOrders.length}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Filter
        </label>
        <select
          value={adminOrderFilter}
          onChange={(event) => setAdminOrderFilter(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All ({adminOrderCounts.all})</option>
          <option value="awaiting_approval">
            Awaiting Approval ({adminOrderCounts.awaiting_approval})
          </option>
          <option value="accepted">Order Confirmed ({adminOrderCounts.accepted})</option>
          <option value="in_transit">In Transit ({adminOrderCounts.in_transit})</option>
          <option value="completed">Completed ({adminOrderCounts.completed})</option>
          <option value="cancelled">Canceled ({adminOrderCounts.cancelled})</option>
        </select>
      </div>
    </div>

    {ordersLoading ? (
      <p className="mt-4 text-sm text-slate-500">Loading orders...</p>
    ) : ordersError ? (
      <p className="mt-4 text-sm text-rose-600">{ordersError}</p>
    ) : adminOrders.length === 0 ? (
      <p className="mt-4 text-sm text-slate-500">No orders received yet.</p>
    ) : (
      <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1 lg:max-h-[520px]">
        {filteredAdminOrders.map((order) => {
          const items = order.order_items || [];
          const firstItem = items[0];
          const extraCount = Math.max(items.length - 1, 0);

          const dateLabel = new Date(order.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });

          const orderState = order.status || "awaiting_approval";
          const statusLabel = getOrderStatusLabel(order);

          return (
            <div
              key={order.id}
              className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdminOrder(order);
                    setSelectedOrderStatusDraft(order.status || "awaiting_approval");
                  }}
                  className="min-w-[220px] flex-1 text-left"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Order {order.order_number || order.id}
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
                  <p className="mt-1 text-xs text-slate-600">
                    {dateLabel} - {statusLabel?.text || formatOrderStatus(order.status)}
                  </p>
                </button>

                <div className="text-sm font-semibold text-slate-900">
                  Rs. {Number(order.total || 0).toLocaleString("en-IN")}
                </div>

                {orderState === "awaiting_approval" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickOrderStatusUpdate(order.id, "accepted")}
                      className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickOrderStatusUpdate(order.id, "cancelled")}
                      className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </section>
);

export default OrdersPanel;
