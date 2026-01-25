import { supabase } from "./supabaseClient"; // adjust path if your supabase client is elsewhere

// ---------- Shared ----------
export const STATUS_LABELS = {
  awaiting_approval: "Awaiting Approval",
  in_transit: "Confirmed (In Transit)",
  delivered: "Delivered",
  cancelled: "Cancelled",
  placed: "Placed" // in case older data exists
};

export const formatOrderStatus = (status) =>
  STATUS_LABELS[status] || status || "Unknown";

// ---------- USER ----------
export const fetchMyOrders = async () => {
  // user_id is set on order insert for logged in users.
  // If later you add guest orders, those won't appear here by user_id.
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_name,
      customer_email,
      customer_mobile,
      address_line1,
      address_line2,
      landmark,
      city,
      pincode,
      subtotal,
      shipping_fee,
      total,
      status,
      created_at,
      order_items (
        id,
        product_id,
        title,
        price,
        qty,
        line_total
      )
    `
    )
    .order("created_at", { ascending: false });

  return { data, error };
};

// ---------- ADMIN ----------
export const fetchAllOrdersAdmin = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_name,
      customer_email,
      customer_mobile,
      address_line1,
      address_line2,
      landmark,
      city,
      pincode,
      subtotal,
      shipping_fee,
      total,
      status,
      created_at,
      order_items (
        id,
        product_id,
        title,
        price,
        qty,
        line_total
      )
    `
    )
    .order("created_at", { ascending: false });

  return { data, error };
};

export const updateOrderStatusAdmin = async (orderId, status) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id,status")
    .single();

  return { data, error };
};

// ---------- CREATE ORDER ----------
export const createOrder = async (payload) => {
  // get real logged-in user from Supabase session
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) return { data: null, error: userErr };

  const authUserId = userRes?.user?.id ?? null;

  // IMPORTANT:
  // If logged in, force correct user_id
  // If not logged in, do not send user_id key at all (so it becomes NULL)
  const finalPayload = {
    ...payload,
    ...(authUserId ? { user_id: authUserId } : {}),
  };

  if (!authUserId) {
    // remove user_id if it exists but undefined/null
    delete finalPayload.user_id;
  }

  const { data, error } = await supabase
    .from("orders")
    .insert(finalPayload)
    .select("id, order_number, status, total, created_at, user_id")
    .single();

  return { data, error };
};

export const createOrderItems = async ({ orderId, cartItems }) => {
  const rows = (cartItems || []).map((item) => {
    const qty = Number(item.qty || 1);
    const price = Number(item.price || 0);

    return {
      order_id: orderId,
      product_id: item.id || null,          // if your cart stores product uuid in item.id
      title: item.title || item.name || "",
      price,
      qty,
      line_total: price * qty,
    };
  });

  const { data, error } = await supabase
    .from("order_items")
    .insert(rows)
    .select("id, order_id");

  return { data, error };
};

