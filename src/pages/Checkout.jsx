import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";
import { useCart } from "../context/CartContext";
import { getImageWithFallback } from "../assets";
import editIc from "../assets/Icons/edit_ic.png";
import { createOrder, createOrderItems } from "../lib/ordersApi";



const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Spinner = ({ size = 20 }) => (
  <div
    className="inline-block animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
    style={{ width: size, height: size }}
    aria-label="Loading"
  />
);

const Checkout = ({ user, onRequestLogin }) => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { addresses, loadingAddresses, addAddress, updateAddress, refreshAddresses } = useProfile();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [confirmStep, setConfirmStep] = useState("summary");
  const [showCelebration, setShowCelebration] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingFromReview, setEditingFromReview] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    landmark: "",
    pincode: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2500);
  };

  const ToastUI = toast.show ? (
    <div className="fixed top-5 left-1/2 z-[9999] -translate-x-1/2">
      <div
        className={`rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ring-1 ${
          toast.type === "success"
            ? "bg-emerald-600 text-white ring-emerald-200"
            : "bg-red-600 text-white ring-red-200"
        }`}
      >
        {toast.message}
      </div>
    </div>
  ) : null;

  const isLoggedIn = !!user?.email;
  const submitLabel = "Review your order";
  const STANDARD_SHIPPING = 100;

  const isFetchingAddressForCheckout = isLoggedIn && loadingAddresses;

  // Prevent repeated auto-review trigger
  const autoReviewTriggeredRef = useRef(false);

  // prefill name/email for logged in user
  useEffect(() => {
    if (!isLoggedIn) return;
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [isLoggedIn, user?.name, user?.email]);

  /**
   * Logged-in checkout:
   * If any address exists -> autofill and auto open review screen.
   */
  useEffect(() => {
    if (!isLoggedIn) return;
    if (loadingAddresses) return;
    if (!addresses || addresses.length === 0) return;

    // avoid looping when user comes back from review -> edit -> review
    if (autoReviewTriggeredRef.current) return;

    const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
    if (!defaultAddress) return;

    const nextForm = {
      name: defaultAddress.name || "",
      email: defaultAddress.email || "",
      addressLine1: defaultAddress.address_line1 || "",
      addressLine2: defaultAddress.address_line2 || "",
      city: defaultAddress.city || "",
      landmark: defaultAddress.landmark || "",
      pincode: defaultAddress.pincode || "",
      mobile: defaultAddress.mobile || "",
    };
    

    // set form first
    setForm((prev) => {
      const hasValues =
        prev.addressLine1.trim() ||
        prev.city.trim() ||
        prev.pincode.trim() ||
        prev.mobile.trim();

      // if user already started typing, don't override
      if (hasValues) return prev;

      return nextForm;
    });

    // Auto show review screen (as per requirement)
    setOrderSnapshot({
      items: cartItems,
      subtotal,
      address: nextForm,
    });

    setShowReviewScreen(true);
    autoReviewTriggeredRef.current = true;

    window.scrollTo({ top: 0, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, loadingAddresses, addresses]);

  useEffect(() => {
    if (!orderPlaced) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    setConfirmStep("summary");
    setShowCelebration(true);
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [orderPlaced]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDigitsOnly = (field, maxLength) => (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, maxLength);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validationErrors = useMemo(() => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!emailRegex.test(form.email)) {
      next.email = "Enter a valid email.";
    }
    if (!form.addressLine1.trim()) next.addressLine1 = "Address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.pincode.trim()) {
      next.pincode = "Pincode is required.";
    } else if (form.pincode.length !== 6) {
      next.pincode = "Pincode must be 6 digits.";
    }
    if (!form.mobile.trim()) {
      next.mobile = "Mobile number is required.";
    } else if (form.mobile.length !== 10) {
      next.mobile = "Mobile number must be 10 digits.";
    }
    return next;
  }, [form]);

  // const hasDbAddress = isLoggedIn && addresses && addresses.length > 0;


  const placeOrder = async () => {
    try {
      const payload = {
        customer_name: form.name,
        customer_email: form.email || null,
        customer_mobile: form.mobile,
        address_line1: form.addressLine1,
        address_line2: form.addressLine2 || null,
        city: form.city,
        landmark: form.landmark || null,
        pincode: form.pincode,
        subtotal,
        shipping_fee: STANDARD_SHIPPING,
        total: subtotal + STANDARD_SHIPPING,
        status: "awaiting_approval",
      };
  
      // 1) create order
      const { data: order, error: orderErr } = await createOrder(payload);
      if (orderErr) {
        console.error(orderErr);
        showToast(orderErr.message || "Order create failed", "error");
        return;
      }
  
      // 2) create order items
      const { error: itemsErr } = await createOrderItems({
        orderId: order.id,
        cartItems,
      });
  
      if (itemsErr) {
        console.error(itemsErr);
        showToast(itemsErr.message || "Order items insert failed", "error");
        return;
      }
  
      // 3) success UI
      setOrderSnapshot({
        items: cartItems,
        subtotal,
        address: form,
        order,
      });
  
      setOrderPlaced(true);
      setShowCelebration(true);
      clearCart();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to place order", "error");
    }
  };
  
  
  
  const mapDbAddressToForm = (dbAddr) => {
    if (!dbAddr) return null;
    return {
      name: dbAddr.name || "",
      email: dbAddr.email || "",
      addressLine1: dbAddr.address_line1 || "",
      addressLine2: dbAddr.address_line2 || "",
      city: dbAddr.city || "",
      landmark: dbAddr.landmark || "",
      pincode: dbAddr.pincode || "",
      mobile: dbAddr.mobile || "",
    };
  };

  const getDbDefaultAddress = () => {
    if (!addresses || addresses.length === 0) return null;
    return addresses.find((a) => a.is_default) || addresses[0];
  };
  
  const setFormFromDbAddress = () => {
    const a = getDbDefaultAddress();
    if (!a) return false;
  
    setForm({
      name: a.name || "",
      email: a.email || "",
      addressLine1: a.address_line1 || "",
      addressLine2: a.address_line2 || "",
      city: a.city || "",
      landmark: a.landmark || "",
      pincode: a.pincode || "",
      mobile: a.mobile || "",
    });
  
    return true;
  };
  
  

  const handleReview = async (event) => {
    event.preventDefault();
    if (savingAddress) return;
  
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
  
    // ✅ CASE 1: Logged in + editing existing DB address -> UPDATE in DB
    if (isLoggedIn && editingFromReview && addresses && addresses.length > 0) {
      setSavingAddress(true);
      try {
        const dbDefault = addresses.find((a) => a.is_default) || addresses[0];
  
        if (!dbDefault?.id) {
          showToast("Address not found to update", "error");
          return;
        }
  
        const payload = {
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          address_line1: form.addressLine1,
          address_line2: form.addressLine2,
          city: form.city,
          landmark: form.landmark,
          pincode: form.pincode,
        };
  
        const res = await updateAddress(dbDefault.id, payload);
  
        if (!res?.ok) {
          showToast("Failed to update address", "error");
          return;
        }
  
        showToast("Address updated successfully", "success");
        await refreshAddresses();
      } finally {
        setSavingAddress(false);
      }
  
      // ✅ After update, return to Review screen
      setEditingFromReview(false);
  
      setOrderSnapshot({
        items: cartItems,
        subtotal,
        address: form,
      });
  
      setShowReviewScreen(true);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
  
    // ✅ CASE 2: Logged in + NO address in DB -> INSERT in DB (first-time save)
    if (isLoggedIn && (!addresses || addresses.length === 0)) {
      setSavingAddress(true);
      try {
        const payload = {
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          address_line1: form.addressLine1,
          address_line2: form.addressLine2,
          city: form.city,
          landmark: form.landmark,
          pincode: form.pincode,
        };
  
        const res = await addAddress(payload);
  
        if (!res?.ok) {
          console.error("Checkout addAddress failed:", res?.error);
          showToast("Failed to save address", "error");
          return;
        }
  
        showToast("Address saved successfully", "success");
        await refreshAddresses();
      } finally {
        setSavingAddress(false);
      }
    }
  
    // Guest flow OR logged in but already had DB address but not in edit mode:
    setEditingFromReview(false);
  
    setOrderSnapshot({
      items: cartItems,
      subtotal,
      address: form,
    });
  
    setShowReviewScreen(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  

  // ---- Review / Placed screen ----
  if (orderPlaced || showReviewScreen) {
    const items = orderSnapshot?.items || cartItems;
    const orderSubtotal = orderSnapshot?.subtotal ?? subtotal;
    const orderTotal = orderSubtotal + STANDARD_SHIPPING;
    const address = orderSnapshot?.address || form;

    const addressLines = [
      address.addressLine1?.trim(),
      address.addressLine2?.trim() || null,
      address.landmark?.trim() ? `Landmark: ${address.landmark.trim()}` : null,
      `${address.city?.trim()} - ${address.pincode?.trim()}`,
    ].filter(Boolean);
    

    return (
      <main className="min-h-screen bg-gray-50 py-8">
        {ToastUI}

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <section className="relative min-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:min-h-0">
            {orderPlaced ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800">
                Your order has been placed successfully.
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Review
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Review your order
                  </h2>
                </div>
              </div>
            )}

            {orderPlaced && (
              <div className="mt-4 flex flex-col items-center gap-3 text-center">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                  View your order in Profile → Orders.
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <Link
                    to="/profile?tab=orders"
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Go to Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    className="rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    Back to home
                  </button>
                </div>
              </div>
            )}

            {orderPlaced && showCelebration && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="celebrate-pop text-5xl">🎉</div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="inline-flex w-full overflow-hidden rounded-full border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setConfirmStep("summary")}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    confirmStep === "summary"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmStep("items")}
                  className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    confirmStep === "items"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Items
                </button>
              </div>

              {confirmStep === "summary" ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-900 shadow-[0_0_18px_rgba(37,99,235,0.35)]">
                    Payment details will be shared via WhatsApp after you confirm
                    your order.
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Delivery Address
                      </h2>

                      {!orderPlaced && (
                        <button
                          type="button"
                          onClick={async () => {
                            // Must ONLY populate from DB when user has address
                            // (no local fallback)
                            if (isLoggedIn && addresses && addresses.length > 0) {
                              setEditingFromReview(true);
                          
                              // if somehow not ready, block
                              if (loadingAddresses) return;
                          
                              const ok = setFormFromDbAddress();
                              if (!ok) return;
                          
                              setShowReviewScreen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              return;
                            }
                          
                            // Guest OR no DB address -> just go to form (don't autofill)
                            setEditingFromReview(true);
                            setShowReviewScreen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          
                          
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 shadow-sm hover:bg-blue-700"
                          aria-label="Edit delivery address"
                          title="Edit address"
                        >
                          <img
                            src={editIc}
                            alt=""
                            className="h-5 w-5"
                            aria-hidden
                          />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900">{address.name}</p>
                      <p>{address.email}</p>
                      <p>{address.mobile}</p>
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        {"\u20B9"}
                        {orderSubtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span>Standard shipping</span>
                      <span className="font-semibold text-gray-900">
                        {"\u20B9"}
                        {STANDARD_SHIPPING}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
                      <span>Total (shipping included)</span>
                      <span>
                        {"\u20B9"}
                        {orderTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Final shipping may vary based on delivery distance. We will
                      confirm before dispatch.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-600">No items found in the cart.</p>
                  ) : (
                    <div
                      className={`space-y-3 ${
                        items.length >= 3 ? "max-h-[360px] overflow-y-auto pr-1" : ""
                      }`}
                    >
                      {items.map((item) => {
                        let imageSrc = item.image;
                        if (typeof item.image === "string") {
                          if (!item.image.startsWith("http")) {
                            imageSrc = getImageWithFallback(item.image, item.title);
                          }
                        }
                        if (!imageSrc) imageSrc = getImageWithFallback("", item.title);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                          >
                            <img
                              src={imageSrc}
                              alt={item.title}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-base font-semibold text-gray-900">
                                {item.title}
                              </p>
                              <p className="text-sm text-gray-600">Qty {item.qty}</p>
                            </div>
                            <p className="text-base font-semibold text-gray-900">
                              {"\u20B9"}
                              {(item.price * item.qty).toLocaleString("en-IN")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!orderPlaced && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={placeOrder}
                  className="w-full max-w-xs rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  Confirm order
                </button>
              </div>
            )}

            {orderPlaced && (
              <style>{`
                @keyframes bubbleRise {
                  0% { transform: translateY(0) scale(0.9); opacity: 0; }
                  10% { opacity: 1; }
                  100% { transform: translateY(-460px) scale(1.15); opacity: 0; }
                }
                @keyframes celebratePop {
                  0% { transform: scale(0.6); opacity: 0; }
                  20% { opacity: 1; }
                  60% { transform: scale(1.15); }
                  100% { transform: scale(1); opacity: 0; }
                }
                .celebrate-pop { animation: celebratePop 1.6s ease-out forwards; }
              `}</style>
            )}
          </section>
        </div>
      </main>
    );
  }

  // ---- Address form screen ----
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {ToastUI}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-500">Checkout</p>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Address</h1>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          {/* Spinner while fetching addresses */}
          {isFetchingAddressForCheckout && !editingFromReview ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <Spinner size={26} />
              <p className="text-sm font-semibold text-slate-800">
                Loading saved address...
              </p>
              <p className="text-xs text-slate-500">
                Please wait
              </p>
            </div>
          ) : (
            <>
              {!isLoggedIn && (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  You are checking out as a guest. Your order updates will be sent
                  to the email and mobile number below.
                </div>
              )}

              <form className="space-y-6" onSubmit={handleReview}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Name *
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.name && (
                      <span className="mt-1 block text-xs text-red-600">
                        {errors.name}
                      </span>
                    )}
                  </label>

                  <label className="block text-sm font-semibold text-gray-700">
                    Email *
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.email && (
                      <span className="mt-1 block text-xs text-red-600">
                        {errors.email}
                      </span>
                    )}
                  </label>
                </div>

                <label className="block text-sm font-semibold text-gray-700">
                  Address Line 1 *
                  <input
                    type="text"
                    value={form.addressLine1}
                    onChange={handleChange("addressLine1")}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {errors.addressLine1 && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.addressLine1}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-semibold text-gray-700">
                  Address Line 2
                  <input
                    type="text"
                    value={form.addressLine2}
                    onChange={handleChange("addressLine2")}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    City *
                    <input
                      type="text"
                      value={form.city}
                      onChange={handleChange("city")}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.city && (
                      <span className="mt-1 block text-xs text-red-600">
                        {errors.city}
                      </span>
                    )}
                  </label>

                  <label className="block text-sm font-semibold text-gray-700">
                    Pincode *
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      value={form.pincode}
                      onChange={handleDigitsOnly("pincode", 6)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.pincode && (
                      <span className="mt-1 block text-xs text-red-600">
                        {errors.pincode}
                      </span>
                    )}
                  </label>

                  <label className="block text-sm font-semibold text-gray-700">
                    Mobile *
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      value={form.mobile}
                      onChange={handleDigitsOnly("mobile", 10)}
                      className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.mobile && (
                      <span className="mt-1 block text-xs text-red-600">
                        {errors.mobile}
                      </span>
                    )}
                  </label>
                </div>

                <label className="block text-sm font-semibold text-gray-700">
                  Landmark
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={handleChange("landmark")}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>

                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    disabled={savingAddress}
                    onClick={handleReview}
                    className="w-full max-w-xs rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    {savingAddress ? "Saving..." : submitLabel}
                  </button>

                  {/* Cancel button only when edit from review */}
                  {editingFromReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewScreen(true);
                        setEditingFromReview(false);
                        window.scrollTo({ top: 0, behavior: "auto" });
                      }}
                      className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-gray-900 shadow-sm transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}

                  {!isLoggedIn && (
                    <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 px-5 py-4 text-center text-sm text-gray-700">
                      <span>Already have an account? Log in to prefill details.</span>
                      <button
                        type="button"
                        onClick={onRequestLogin}
                        className="w-full max-w-xs rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Checkout;
