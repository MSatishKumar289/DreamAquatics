import { useEffect, useMemo, useState } from "react";

const DEFAULT_UPI_ID = "thilakalpha@okaxis";

const OrderReceiptModal = ({
  selectedAdminOrder,
  setSelectedAdminOrder,
  selectedOrderStatusDraft,
  setSelectedOrderStatusDraft,
  getOrderStatusLabel,
  onSaveOrderStatus
}) => {
  if (!selectedAdminOrder) return null;
  const orderRef = selectedAdminOrder.order_number || selectedAdminOrder.id;
  const baseOrderAmount = Number(selectedAdminOrder.total || 0);
  const [upiAmountDraft, setUpiAmountDraft] = useState(
    Number.isFinite(baseOrderAmount) ? String(baseOrderAmount) : ""
  );
  const envUpiId = import.meta.env.VITE_ADMIN_UPI_ID || import.meta.env.VITE_UPI_ID || "";
  const [upiIdDraft, setUpiIdDraft] = useState(() => {
    if (envUpiId) return envUpiId;
    try {
      return localStorage.getItem("admin_upi_id") || DEFAULT_UPI_ID;
    } catch {
      return DEFAULT_UPI_ID;
    }
  });

  useEffect(() => {
    setUpiAmountDraft(Number.isFinite(baseOrderAmount) ? String(baseOrderAmount) : "");
  }, [selectedAdminOrder.id, baseOrderAmount]);

  const rawMobile = String(selectedAdminOrder.customer_mobile || "");
  const digitsOnly = rawMobile.replace(/\D/g, "");
  const buildWhatsappNumber = () => {
    if (!digitsOnly) return "";
    if (digitsOnly.startsWith("91") && digitsOnly.length >= 12) return digitsOnly;
    if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) return `91${digitsOnly.slice(1)}`;
    if (digitsOnly.length === 10) {
      if (digitsOnly.startsWith("0")) return `91${digitsOnly.slice(1)}`;
      return `91${digitsOnly}`;
    }
    if (digitsOnly.length > 10) return `91${digitsOnly.slice(-10)}`;
    return digitsOnly;
  };
  const whatsappNumber = buildWhatsappNumber();
  const hasWhatsappNumber = digitsOnly.length > 0;
  const parsedUpiAmount = Number.parseFloat(upiAmountDraft);
  const hasValidUpiAmount = Number.isFinite(parsedUpiAmount) && parsedUpiAmount > 0;
  useEffect(() => {
    if (envUpiId) {
      setUpiIdDraft(envUpiId);
      return;
    }
    try {
      localStorage.setItem("admin_upi_id", upiIdDraft.trim());
    } catch {
      // ignore localStorage failures in private browsing contexts
    }
  }, [envUpiId, upiIdDraft]);

  const upiId = upiIdDraft.trim();
  const payeeName = import.meta.env.VITE_ADMIN_UPI_PAYEE_NAME || "DreamAquatics";
  const upiLink = useMemo(() => {
    if (!upiId || !hasValidUpiAmount) return "";
    const query = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: parsedUpiAmount.toFixed(2),
      cu: "INR",
      tn: `Order ${orderRef}`
    });
    return `upi://pay?${query.toString()}`;
  }, [upiId, payeeName, parsedUpiAmount, hasValidUpiAmount, orderRef]);
  const upiQrImageUrl = useMemo(() => {
    if (!upiLink) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      upiLink
    )}`;
  }, [upiLink]);
  const plainQrPath = useMemo(() => upiQrImageUrl.replace(/^https?:\/\//, ""), [upiQrImageUrl]);
  const whatsappMessage = encodeURIComponent(
    `Hi ${selectedAdminOrder.customer_name || ""},\nThis is *DreamAquatics* regarding your order *${orderRef}*.${
      hasValidUpiAmount ? `\n*Please pay Rs. ${parsedUpiAmount.toFixed(2)}.*` : ""
    }${upiId ? `\n\nUPI ID: ${upiId}` : ""}${upiLink ? `\n\nUPI payment link: ${upiLink}` : ""}${
      plainQrPath ? `\n\nQR code link: ${plainQrPath}` : ""
    }${
      plainQrPath
        ? `\n\n*⚠️ Security warning:* Do not share OTP or UPI PIN, do not accept collect requests, and pay only after verifying the UPI ID and payee name.\n*Please share the screenshot of the payment once paid.*`
        : ""
    }`
  );
  const whatsappLink = hasWhatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) setSelectedAdminOrder(null);
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="relative border-b border-dashed border-slate-200 px-5 py-4 text-center">
          <p className="flex items-baseline justify-center text-blue-600">
            <span className="text-base font-bold tracking-[0.2em]">D</span>
            <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">REAM</span>
            <span className="ml-0.5 text-base font-bold tracking-[0.2em]">A</span>
            <span className="-ml-0.5 text-xs font-semibold tracking-[0.2em]">QUATICS</span>
          </p>

          <h2 className="mt-2 text-1xl font-semibold text-slate-900">Order receipt</h2>

          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Status</span>
            {getOrderStatusLabel(selectedAdminOrder) ? (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${getOrderStatusLabel(selectedAdminOrder).cls}`}
              >
                {getOrderStatusLabel(selectedAdminOrder).text}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedOrderStatusDraft("");
              setSelectedAdminOrder(null);
            }}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
            aria-label="Close order receipt"
          >
            X
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-4 text-sm text-slate-700">
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
            <span>Order ID</span>
            <span className="font-semibold text-slate-900">
              {selectedAdminOrder.order_number || selectedAdminOrder.id}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
            <span>Placed on</span>
            <span className="font-semibold text-slate-900">
              {new Date(selectedAdminOrder.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </span>
          </div>

          <div className="mt-4 flex flex-col items-start gap-3 border-b border-dashed border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-slate-500">Status</span>

            <div className="flex items-center gap-2">
              <select
                value={selectedOrderStatusDraft || selectedAdminOrder.status}
                onChange={(e) => setSelectedOrderStatusDraft(e.target.value)}
                className="min-w-[170px] rounded-full border border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-blue-600 focus:outline-none"
              >
                <option value="awaiting_approval">Awaiting Approval</option>
                <option value="accepted">Order Confirmed</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Rejected</option>
              </select>

              <button
                type="button"
                onClick={() => onSaveOrderStatus(selectedOrderStatusDraft || selectedAdminOrder.status)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                disabled={
                  (selectedOrderStatusDraft || selectedAdminOrder.status) ===
                  (selectedAdminOrder.status || "awaiting_approval")
                }
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderStatusDraft(selectedAdminOrder.status || "awaiting_approval");
                  setSelectedAdminOrder(null);
                }}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>Item</span>
              <span>Total</span>
            </div>

            <div className="mt-3 space-y-3 border-b border-dashed border-slate-200 pb-4">
              {(selectedAdminOrder.order_items || []).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      Qty {item.qty} - Rs. {Number(item.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="font-semibold text-slate-900">
                    Rs.{" "}
                    {Number(item.line_total || item.qty * item.price).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-b border-dashed border-slate-200 pb-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Delivery Address
            </h3>

            <div className="mt-2 space-y-1 text-sm">
              <p className="font-semibold text-slate-900">
                {selectedAdminOrder.customer_name}
              </p>
              {selectedAdminOrder.customer_email && <p>{selectedAdminOrder.customer_email}</p>}
              <div className="flex flex-wrap items-center gap-2">
                <p>{selectedAdminOrder.customer_mobile}</p>
              </div>
              <div className="mt-3 w-full rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  WhatsApp UPI Payment
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="text-xs text-slate-600" htmlFor="upi-id">
                    UPI ID
                  </label>
                  <input
                    id="upi-id"
                    type="text"
                    value={upiIdDraft}
                    onChange={(event) => setUpiIdDraft(event.target.value)}
                    placeholder="example@oksbi"
                    className="w-44 rounded-md border border-emerald-200 bg-white px-2 py-1 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                  <label className="text-xs text-slate-600" htmlFor="upi-amount">
                    Amount (Rs.)
                  </label>
                  <input
                    id="upi-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={upiAmountDraft}
                    onChange={(event) => setUpiAmountDraft(event.target.value)}
                    className="w-36 rounded-md border border-emerald-200 bg-white px-2 py-1 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                  {!upiLink && (
                    <span className="text-xs text-amber-700">
                      Enter UPI ID to generate payment link.
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {whatsappLink ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Open WhatsApp
                    </a>
                  ) : (
                    <span className="text-xs text-amber-700">
                      Customer mobile number is required to open WhatsApp.
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  WhatsApp opens with this amount and link prefilled. Admin must tap send manually.
                </p>
              </div>
              <p>{selectedAdminOrder.address_line1}</p>
              {selectedAdminOrder.address_line2 && <p>{selectedAdminOrder.address_line2}</p>}
              {selectedAdminOrder.landmark && <p>Landmark: {selectedAdminOrder.landmark}</p>}
              <p>
                {selectedAdminOrder.city} - {selectedAdminOrder.pincode}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                Rs. {Number(selectedAdminOrder.subtotal || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Standard shipping</span>
              <span className="font-semibold text-slate-900">
                Rs. {Number(selectedAdminOrder.shipping_fee || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 font-semibold text-slate-900">
              <span>Total</span>
              <span>
                Rs. {Number(selectedAdminOrder.total || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-full bg-white">
          <svg className="h-full w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
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
  );
};

export default OrderReceiptModal;
