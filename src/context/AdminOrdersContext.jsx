import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import notificationSound from "../assets/Sounds/notification.mp3";

const STORAGE_KEY = "dream-aquatics-admin-order-state";

const DEFAULT_ADMIN_ORDERS = [
  {
    id: "DA-ADMIN-1001",
    placedAt: "2025-01-20",
    subtotal: 1350,
    shipping: 100,
    total: 1450,
    customer: {
      name: "Satish",
      email: "msatish289kumar@gmail.com",
      phone: "3213123123",
      line1: "33D, Gandhi Puram, Cross Street",
      line2: "Dharapuram",
      landmark: "Near Periyakaaliamman Kovil",
      city: "Dharapuram",
      pincode: "638656",
    },
    items: [
      { id: "itm-1", title: "Full Moon Betta", qty: 2, price: 400 },
      { id: "itm-2", title: "Albino Oscar", qty: 1, price: 650 },
      { id: "itm-3", title: "Channa Andrao", qty: 1, price: 300 },
    ],
  },
];

const loadOrderState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load admin order state", error);
    return {};
  }
};

const buildInitialState = (orders, stored) => {
  const next = { ...stored };
  orders.forEach((order) => {
    if (next[order.id]) return;
    next[order.id] = {
      status: "new",
      fulfillment: "in-transit",
      pendingFulfillment: "in-transit",
      isDirty: false,
      hasSavedFulfillment: false,
      isEditing: false,
    };
  });
  return next;
};

const AdminOrdersContext = createContext(null);

export const AdminOrdersProvider = ({ children }) => {
  const [adminOrders] = useState(DEFAULT_ADMIN_ORDERS);
  const [adminOrderState, setAdminOrderState] = useState(() =>
    buildInitialState(DEFAULT_ADMIN_ORDERS, loadOrderState())
  );
  const audioRef = useRef(null);
  const prevNewOrdersRef = useRef(0);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    setAdminOrderState((prev) => buildInitialState(adminOrders, prev));
  }, [adminOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminOrderState));
    } catch (error) {
      console.error("Failed to save admin order state", error);
    }
  }, [adminOrderState]);

  const updateAdminOrderStatus = (orderId, status) => {
    setAdminOrderState((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        status,
        fulfillment:
          status === "accepted"
            ? prev[orderId]?.fulfillment || "in-transit"
            : prev[orderId]?.fulfillment,
        pendingFulfillment:
          status === "accepted"
            ? prev[orderId]?.fulfillment || "in-transit"
            : prev[orderId]?.pendingFulfillment,
        isDirty: false,
        hasSavedFulfillment: status === "accepted" ? false : status === "cancelled",
        isEditing: status === "accepted" ? false : prev[orderId]?.isEditing,
      },
    }));
  };

  const updateAdminOrderFulfillment = (orderId, fulfillment) => {
    setAdminOrderState((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        pendingFulfillment: fulfillment,
        isDirty: true,
      },
    }));
  };

  const saveAdminOrderFulfillment = (orderId) => {
    setAdminOrderState((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        fulfillment: prev[orderId]?.pendingFulfillment || prev[orderId]?.fulfillment,
        isDirty: false,
        hasSavedFulfillment: true,
        isEditing: false,
      },
    }));
  };

  const cancelAdminOrderFulfillment = (orderId) => {
    setAdminOrderState((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        pendingFulfillment: prev[orderId]?.fulfillment,
        isDirty: false,
        hasSavedFulfillment: prev[orderId]?.hasSavedFulfillment,
        isEditing: false,
      },
    }));
  };

  const toggleAdminOrderEditing = (orderId) => {
    setAdminOrderState((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        isEditing: !prev[orderId]?.isEditing,
        pendingFulfillment: prev[orderId]?.fulfillment || "in-transit",
        isDirty: false,
      },
    }));
  };

  const getAdminOrderStatus = (orderId) => {
    const orderState = adminOrderState[orderId]?.status || "new";
    if (orderState === "new") return "new";
    if (orderState === "cancelled") return "cancelled";
    const hasSaved = adminOrderState[orderId]?.hasSavedFulfillment;
    if (!hasSaved) return "accepted";
    return adminOrderState[orderId]?.fulfillment || "in-transit";
  };

  const newOrdersCount = useMemo(() => {
    return adminOrders.filter((order) => getAdminOrderStatus(order.id) === "new").length;
  }, [adminOrders, adminOrderState]);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevNewOrdersRef.current = newOrdersCount;
      return;
    }
    if (newOrdersCount > prevNewOrdersRef.current) {
      audioRef.current?.play().catch(() => {});
    }
    prevNewOrdersRef.current = newOrdersCount;
  }, [newOrdersCount]);

  const value = {
    adminOrders,
    adminOrderState,
    updateAdminOrderStatus,
    updateAdminOrderFulfillment,
    saveAdminOrderFulfillment,
    cancelAdminOrderFulfillment,
    toggleAdminOrderEditing,
    getAdminOrderStatus,
    newOrdersCount,
  };

  return (
    <AdminOrdersContext.Provider value={value}>
      {children}
    </AdminOrdersContext.Provider>
  );
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrdersContext);
  if (!context) {
    throw new Error("useAdminOrders must be used within AdminOrdersProvider");
  }
  return context;
};
