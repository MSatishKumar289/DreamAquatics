import { useEffect, useMemo, useState } from "react";
import AddressForm from "../components/AddressForm";
import { useProfile } from "../context/ProfileContext";
import edit_ic from "../assets/Icons/edit_ic.png";
import bin_ic from "../assets/Icons/bin_ic.png";
import { fetchMyOrders, formatOrderStatus } from "../lib/ordersApi";

const Spinner = ({ size = 18 }) => (
  <div
    className="inline-block animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
    style={{ width: size, height: size }}
    aria-label="Loading"
  />
);

const getOrderStatusBadgeClasses = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "cancelled") return "border-rose-200 bg-rose-50 text-rose-700";
  if (key === "delivered") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (key === "in_transit") return "border-amber-200 bg-amber-50 text-amber-700";
  if (key === "accepted" || key === "approved" || key === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
};
const Profile = () => {
  const {
    addresses,
    loadingAddresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  } = useProfile();

  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("addresses");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const [savingAddress, setSavingAddress] = useState(false);

  // forces AddressForm remount -> clears typed content
  const [formResetKey, setFormResetKey] = useState(0);

  const isBusy = loadingAddresses || savingAddress;

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2500);
  };

  // ✅ Orders (DB)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const loadMyOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");

    const { data, error } = await fetchMyOrders();

    if (error) {
      setOrdersError(error.message || "Failed to load orders");
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrders(data || []);
    setOrdersLoading(false);
  };

  const canAddMore = addresses.length < 2;

  const handleAdd = async (payload) => {
    if (isBusy) return;
    setSavingAddress(true);

    try {
      const result = await addAddress(payload);

      if (!result?.ok) {
        const msg =
          typeof result?.error === "string"
            ? result.error
            : result?.error?.message || "Failed to add address";
        setError(msg);
        showToast(msg, "error");
        return;
      }

      setError("");
      showToast("Address added successfully", "success");

      // close and reset form
      setShowForm(false);
      setEditing(null);
      setFormResetKey((k) => k + 1);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editing) return;
    if (isBusy) return;

    setSavingAddress(true);
    try {
      const result = await updateAddress(editing.id, payload);

      if (!result?.ok) {
        const msg =
          typeof result?.error === "string"
            ? result.error
            : result?.error?.message || "Failed to update address";
        setError(msg);
        showToast(msg, "error");
        return;
      }

      setError("");
      showToast("Address updated successfully", "success");

      setEditing(null);
      setShowForm(false);
      setFormResetKey((k) => k + 1);
    } finally {
      setSavingAddress(false);
    }
  };

  const activeFormValue = useMemo(() => {
    if (!editing) return null;
    return {
      ...editing,
      phone: editing.mobile || "",
      line1: editing.address_line1 || "",
      line2: editing.address_line2 || "",
    };
  }, [editing]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "orders") {
      setActiveTab("orders");
    }
  }, [location.search]);

  // ✅ Load orders when Orders tab opens
  useEffect(() => {
    if (activeTab !== "orders") return;
    loadMyOrders();
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white py-10">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-5 left-1/2 z-[9999] -translate-x-1/2">
          <div
            className={`rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ring-1 whitespace-nowrap ${
              toast.type === "success"
                ? "bg-emerald-600 text-white ring-emerald-200"
                : "bg-red-600 text-white ring-red-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Profile
              </p>
              {activeTab === "addresses" ? (
                <>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    Saved Addresses
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Add up to two delivery addresses and set a default one.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                    Your Orders
                  </h1>
                  <p className="mt-2 text-sm text-slate-600">
                    Track your recent purchases and order history here.
                  </p>
                </>
              )}
            </div>

            {/* Top-right loader indicator */}
            {loadingAddresses && activeTab === "addresses" && (
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                <Spinner size={14} />
                Loading
              </div>
            )}

            {ordersLoading && activeTab === "orders" && (
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                <Spinner size={14} />
                Loading
              </div>
            )}
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4 inline-flex w-full overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setActiveTab("addresses")}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60 ${
                activeTab === "addresses"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Addresses
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setActiveTab("orders")}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60 ${
                activeTab === "orders"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Orders
            </button>
          </div>

          {activeTab === "addresses" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Address book
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                    setError("");
                    setFormResetKey((k) => k + 1);
                  }}
                  disabled={!canAddMore || isBusy || showForm || !!editing}
                  className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
                >
                  {isBusy ? <Spinner size={16} /> : null}
                  Add address
                </button>
              </div>

              {/* Full-page style loading placeholder */}
              {loadingAddresses ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-700">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spinner size={22} />
                    <span className="font-semibold">Loading addresses...</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {addresses.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 md:col-span-2">
                      No addresses saved yet.
                    </div>
                  )}

                  {addresses.map((addr) => {
                    const isDefault = !!addr.is_default;

                    return (
                      <div
                        key={addr.id}
                        className={`flex h-full w-full flex-col rounded-xl border px-4 py-3 shadow-sm ${
                          isDefault
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {addr.name}
                            </p>
                            {addr.email && (
                              <p className="text-xs break-words text-slate-600">
                                {addr.email}
                              </p>
                            )}
                            <p className="text-xs text-slate-600">
                              {addr.mobile}
                            </p>
                          </div>

                          <div className="flex flex-shrink-0 items-center gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setEditing(addr);
                                setShowForm(false);
                                setError("");
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={`Edit ${addr.name} address`}
                              title="Edit"
                            >
                              <img
                                src={edit_ic}
                                alt=""
                                className="h-4 w-4"
                                aria-hidden
                              />
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setPendingDelete(addr)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={`Delete ${addr.name} address`}
                              title="Delete"
                            >
                              <img
                                src={bin_ic}
                                alt=""
                                className="h-4 w-4"
                                aria-hidden
                              />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-slate-600">
                          <p>{addr.address_line1}</p>
                          {addr.address_line2 && <p>{addr.address_line2}</p>}
                          {addr.landmark && (
                            <p>Landmark: {addr.landmark}</p>
                          )}
                          <p>
                            {addr.city} - {addr.pincode}
                          </p>
                        </div>

                        <div className="mt-auto flex min-h-[40px] items-center justify-center">
                          {isDefault ? (
                            <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={async () => {
                                const res = await setDefaultAddress(addr.id);
                                if (!res?.ok) {
                                  showToast(
                                    "Failed to set default address",
                                    "error"
                                  );
                                  return;
                                }
                                showToast("Default address updated", "success");
                              }}
                              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Set default
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : ordersLoading ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              Loading your orders...
            </div>
          ) : ordersError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No orders yet. Your future orders will appear here.
            </div>
          ) : (
            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {orders.map((order) => {
                const items = order.order_items || [];
                const firstItem = items[0];
                const extraCount = Math.max(items.length - 1, 0);

                const dateLabel = new Date(order.created_at).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <button
                    key={order.id}
                    type="button"
                    disabled={isBusy}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Order {order.order_number || order.id}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                          {firstItem?.title || "Order Items"}
                          {extraCount > 0 ? ` + ${extraCount} more` : ""}
                        </p>
                        <span className={`mt-2 inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${getOrderStatusBadgeClasses(order.status)}`}>
                          {formatOrderStatus(order.status)}
                        </span>
                        <p className="mt-1 text-xs text-slate-600">
                          {dateLabel}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        ₹{Number(order.total || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {(showForm || editing) && (
          <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Edit address" : "Add new address"}
              </h2>

              {(loadingAddresses || savingAddress) && (
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Spinner size={14} />
                  Saving...
                </div>
              )}
            </div>

            <div className={`mt-4 ${isBusy ? "pointer-events-none opacity-70" : ""}`}>
              <AddressForm
                key={`${editing?.id || "new"}-${formResetKey}`}
                initialValue={activeFormValue}
                onCancel={() => {
                  if (isBusy) return;
                  setShowForm(false);
                  setEditing(null);
                  setError("");
                  setFormResetKey((k) => k + 1);
                }}
                onSave={editing ? handleUpdate : handleAdd}
              />
            </div>
          </section>
        )}
      </div>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !isBusy)
              setPendingDelete(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Remove address?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Delete address for {pendingDelete.name}?
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setPendingDelete(null)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  if (isBusy) return;

                  setSavingAddress(true);
                  try {
                    const deletedId = pendingDelete.id;
                    const wasDefault = !!pendingDelete.is_default;

                    const res = await removeAddress(deletedId);
                    if (!res?.ok) {
                      showToast("Failed to delete address", "error");
                      return;
                    }

                    // ✅ If default deleted -> set remaining address as default
                    if (wasDefault) {
                      const remaining = addresses.filter((a) => a.id !== deletedId);
                      if (remaining.length > 0) {
                        await setDefaultAddress(remaining[0].id);
                      }
                    }

                    showToast("Address deleted", "success");
                    setPendingDelete(null);
                  } finally {
                    setSavingAddress(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isBusy ? <Spinner size={16} /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ selectedOrder modal (DB) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="relative border-b border-dashed border-slate-200 px-5 py-4 text-center">
              <p className="flex items-baseline justify-center text-blue-600">
                <span className="text-base font-bold tracking-[0.2em]">D</span>
                <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">
                  REAM
                </span>
                <span className="ml-0.5 text-base font-bold tracking-[0.2em]">
                  A
                </span>
                <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">
                  QUATICS
                </span>
              </p>
              <h2 className="mt-2 text-1xl font-semibold text-slate-900">
                Order Details
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                Status:{" "}
                <span className="font-semibold">
                  {formatOrderStatus(selectedOrder.status)}
                </span>
              </p>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="absolute right-4 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
                aria-label="Close order details"
              >
                X
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-5 py-4 text-sm text-slate-700">
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                <span>Placed on</span>
                <span className="font-semibold text-slate-900">
                  {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Item</span>
                  <span>Total</span>
                </div>

                <div className="mt-3 space-y-3 border-b border-dashed border-slate-200 pb-4">
                  {(selectedOrder.order_items || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">
                          Qty {item.qty} · ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="font-semibold text-slate-900">
                        ₹{Number(item.line_total || item.qty * item.price).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{Number(selectedOrder.subtotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Standard shipping</span>
                  <span className="font-semibold text-slate-900">
                    ₹{Number(selectedOrder.shipping_fee || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 font-semibold text-slate-900">
                  <span>Total</span>
                  <span>₹{Number(selectedOrder.total || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="mt-4 border-b border-dashed border-slate-200 pb-4">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Delivery Address
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.customer_name}
                  </p>
                  {selectedOrder.customer_email && <p>{selectedOrder.customer_email}</p>}
                  <p>{selectedOrder.customer_mobile}</p>
                  <p>{selectedOrder.address_line1}</p>
                  {selectedOrder.address_line2 && <p>{selectedOrder.address_line2}</p>}
                  {selectedOrder.landmark && (
                    <p>Landmark: {selectedOrder.landmark}</p>
                  )}
                  <p>
                    {selectedOrder.city} - {selectedOrder.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-4 w-full bg-white">
              <svg
                className="h-full w-full"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 2 L5 8 L10 2 L15 8 L20 2 L25 8 L30 2 L35 8 L40 2 L45 8 L50 2 L55 8 L60 2 L65 8 L70 2 L75 8 L80 2 L85 8 L90 2 L95 8 L100 2"
                  stroke="#e2e8f0"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;











