import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import AdminOrdersDrawer from './components/AdminOrdersDrawer';
import UserOrdersDrawer from './components/UserOrdersDrawer';
import Footer from './components/Footer';
import Home from './pages/Home';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/Checkout.jsx';
import CategoryListingPage from './pages/CategoryListingPage';
import AdminAddProduct from './pages/AdminAddProduct';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import Profile from './pages/Profile';
import Search from './pages/Search';
import TrackOrder from './pages/TrackOrder';
import UnderHundredPage from './pages/UnderHundredPage';
import AuthForm from './components/AuthForm';
import { supabase } from './lib/supabaseClient';
import { fetchCurrentProfile, upsertProfile } from './lib/profileApi';
import { fetchAllOrdersAdmin, fetchMyOrders, normalizeAdminOrders } from './lib/ordersApi';
import { clearCartStorage, clearFavoritesStorage } from './helpers/storage';
import { ProfileProvider } from './context/ProfileContext';
import ProtectedRoute from "./components/ProtectedRoute";
import WhatsIcon from './assets/Icons/whatsapp.png';


function AppContent() {
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAdminOrdersOpen, setIsAdminOrdersOpen] = useState(false);
  const [isUserOrdersOpen, setIsUserOrdersOpen] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersLastRefreshedAt, setAdminOrdersLastRefreshedAt] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userOrdersLastRefreshedAt, setUserOrdersLastRefreshedAt] = useState(null);
  const [userOrderNotifications, setUserOrderNotifications] = useState([]);
  const adminPollTimerRef = useRef(null);
  const adminPollInFlightRef = useRef(false);
  const userPollTimerRef = useRef(null);
  const userPollInFlightRef = useRef(false);
  const userOrderStatusMapRef = useRef({});
  const userOrdersSeededRef = useRef(false);
  const location = useLocation();
  const pathname = location.pathname || '';
  const showPersistentWhatsApp =
    pathname === '/profile' ||
    pathname === '/checkout' ||
    pathname.startsWith('/category/');

  const { clearCart, lastAddedAt, lastAddedItem } = useCart();
  const { clearFavorites } = useFavorites();
  const [showAddedBanner, setShowAddedBanner] = useState(false);

  /* ================= AUTH LISTENER (SESSION ONLY) ================= */

  useEffect(() => {
    let active = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setAuthLoading(false);
        return;
      }
      if (data?.session?.user) {
        setSessionUser(data.session.user);
      }
      setAuthLoading(false);
    })();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('AUTH EVENT:', event);

        if (event === 'SIGNED_OUT') {
          setSessionUser(null);
          setProfile(null);
          setAuthLoading(false);
          localStorage.removeItem('da_profile_hint_seen');
          setUserOrders([]);
          setUserOrdersLastRefreshedAt(null);
          setUserOrderNotifications([]);
          setIsUserOrdersOpen(false);
          userOrderStatusMapRef.current = {};
          userOrdersSeededRef.current = false;
          clearUserPollTimer();

          // 🔒 Cart cleanup happens ONLY here
          clearCart();
          clearCartStorage();
          clearFavorites();
          clearFavoritesStorage();

          return;
        }

        if (session?.user) {
          setSessionUser(session.user);
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearCart, clearFavorites]);

  /* ================= PROFILE FETCH + SAFE CREATION ================= */

  useEffect(() => {
    if (!sessionUser) return;

    let active = true;

    (async () => {
      const { profile: existingProfile } = await fetchCurrentProfile();
      if (!active) return;

      if (existingProfile) {
        setProfile(existingProfile);
        return;
      }

      const displayName =
        sessionUser.user_metadata?.full_name ||
        sessionUser.email?.split('@')[0] ||
        null;

      const { profile: createdProfile, error } = await upsertProfile({
        full_name: displayName,
        role: 'user',
      });

      if (!active) return;
      if (error) return;

      setProfile(createdProfile);
    })();

    return () => {
      active = false;
    };
  }, [sessionUser]);

  useEffect(() => {
    if (!lastAddedAt) return;
    setShowAddedBanner(true);
    const timer = setTimeout(() => {
      setShowAddedBanner(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [lastAddedAt]);


  /* ================= DERIVED USER ================= */

  const authUser = useMemo(() => {
    if (!sessionUser) return null;

    const displayName =
      profile?.full_name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.email?.split('@')[0];

    return {
      email: sessionUser.email,
      name: displayName,
      role: profile?.role ?? null,
    };
  }, [sessionUser, profile]);

  const welcomeText = useMemo(() => {
    return authUser ? `Welcome ${authUser.name}` : null;
  }, [authUser]);

  const newOrdersCount = useMemo(
    () =>
      adminOrders.filter(
        (order) => (order.status || "awaiting_approval") === "awaiting_approval"
      ).length,
    [adminOrders]
  );

  const userNotificationsCount = useMemo(
    () => userOrderNotifications.filter((item) => !item.read).length,
    [userOrderNotifications]
  );

  const userNotificationsStorageKey = useMemo(
    () => (sessionUser?.id ? `da_user_order_notifications_${sessionUser.id}` : null),
    [sessionUser?.id]
  );

  const userStatusMapStorageKey = useMemo(
    () => (sessionUser?.id ? `da_user_order_status_map_${sessionUser.id}` : null),
    [sessionUser?.id]
  );

  const fetchAdminOrders = useCallback(async () => {
    if (adminPollInFlightRef.current) return;
    adminPollInFlightRef.current = true;
    try {
      const { data, error } = await fetchAllOrdersAdmin();
      if (error) {
        return;
      }
      setAdminOrders(normalizeAdminOrders(data || []));
      setAdminOrdersLastRefreshedAt(Date.now());
    } finally {
      adminPollInFlightRef.current = false;
    }
  }, []);

  const clearAdminPollTimer = () => {
    if (adminPollTimerRef.current) {
      clearTimeout(adminPollTimerRef.current);
      adminPollTimerRef.current = null;
    }
  };

  const scheduleAdminPoll = useCallback(() => {
    clearAdminPollTimer();
    adminPollTimerRef.current = setTimeout(async () => {
      if (document.hidden) {
        scheduleAdminPoll();
        return;
      }
      await fetchAdminOrders();
      scheduleAdminPoll();
    }, 3 * 60 * 1000);
  }, [fetchAdminOrders]);

  useEffect(() => {
    if (!userNotificationsStorageKey || !userStatusMapStorageKey) return;
    try {
      const storedNotificationsRaw = localStorage.getItem(userNotificationsStorageKey);
      const storedStatusMapRaw = localStorage.getItem(userStatusMapStorageKey);
      const storedNotifications = storedNotificationsRaw ? JSON.parse(storedNotificationsRaw) : [];
      const storedStatusMap = storedStatusMapRaw ? JSON.parse(storedStatusMapRaw) : {};

      setUserOrderNotifications(Array.isArray(storedNotifications) ? storedNotifications : []);
      userOrderStatusMapRef.current =
        storedStatusMap && typeof storedStatusMap === "object" ? storedStatusMap : {};
      userOrdersSeededRef.current = Object.keys(userOrderStatusMapRef.current).length > 0;
    } catch {
      setUserOrderNotifications([]);
      userOrderStatusMapRef.current = {};
      userOrdersSeededRef.current = false;
    }
  }, [userNotificationsStorageKey, userStatusMapStorageKey]);

  const fetchUserOrderNotifications = useCallback(async () => {
    if (userPollInFlightRef.current) return;
    userPollInFlightRef.current = true;

    try {
      const { data, error } = await fetchMyOrders();
      if (error) return;

      const orders = data || [];
      setUserOrders(orders);
      setUserOrdersLastRefreshedAt(Date.now());

      const nextStatusMap = orders.reduce((acc, order) => {
        acc[order.id] = order.status || "awaiting_approval";
        return acc;
      }, {});

      const prevStatusMap = userOrderStatusMapRef.current || {};
      const shouldCreateNotifications = userOrdersSeededRef.current;

      setUserOrderNotifications((prev) => {
        if (!shouldCreateNotifications) return prev;

        const existingIds = new Set(prev.map((item) => item.id));
        const newlyDetected = [];

        orders.forEach((order) => {
          const previous = prevStatusMap[order.id];
          const current = nextStatusMap[order.id];
          if (!previous || previous === current) return;

          const notificationId = `${order.id}:${current}`;
          if (existingIds.has(notificationId)) return;

          newlyDetected.push({
            id: notificationId,
            orderId: order.id,
            orderNumber: order.order_number || order.id,
            status: current,
            previousStatus: previous,
            total: Number(order.total || 0),
            changedAt: Date.now(),
            read: false,
          });
        });

        if (!newlyDetected.length) return prev;

        const merged = [...newlyDetected, ...prev].slice(0, 50);
        if (userNotificationsStorageKey) {
          localStorage.setItem(userNotificationsStorageKey, JSON.stringify(merged));
        }
        return merged;
      });

      userOrderStatusMapRef.current = nextStatusMap;
      userOrdersSeededRef.current = true;
      if (userStatusMapStorageKey) {
        localStorage.setItem(userStatusMapStorageKey, JSON.stringify(nextStatusMap));
      }
    } finally {
      userPollInFlightRef.current = false;
    }
  }, [userNotificationsStorageKey, userStatusMapStorageKey]);

  const clearUserPollTimer = () => {
    if (userPollTimerRef.current) {
      clearTimeout(userPollTimerRef.current);
      userPollTimerRef.current = null;
    }
  };

  const scheduleUserPoll = useCallback(() => {
    clearUserPollTimer();
    userPollTimerRef.current = setTimeout(async () => {
      if (document.hidden) {
        scheduleUserPoll();
        return;
      }
      await fetchUserOrderNotifications();
      scheduleUserPoll();
    }, 2 * 60 * 1000);
  }, [fetchUserOrderNotifications]);

  useEffect(() => {
    if (!authUser?.role || authUser.role !== "admin") return;

    const handleFocus = () => {
      if (document.hidden) return;
      fetchAdminOrders();
      scheduleAdminPoll();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAdminPollTimer();
        return;
      }
      fetchAdminOrders();
      scheduleAdminPoll();
    };

    const handleAdminOrdersUpdated = () => {
      if (document.hidden) return;
      fetchAdminOrders();
      scheduleAdminPoll();
    };

    fetchAdminOrders();
    scheduleAdminPoll();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("adminOrdersUpdated", handleAdminOrdersUpdated);

    return () => {
      clearAdminPollTimer();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("adminOrdersUpdated", handleAdminOrdersUpdated);
    };
  }, [authUser?.role, fetchAdminOrders, scheduleAdminPoll]);

  useEffect(() => {
    if (!authUser || authUser.role === "admin") return;

    const handleFocus = () => {
      if (document.hidden) return;
      fetchUserOrderNotifications();
      scheduleUserPoll();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearUserPollTimer();
        return;
      }
      fetchUserOrderNotifications();
      scheduleUserPoll();
    };

    const handleAdminOrdersUpdated = () => {
      if (document.hidden) return;
      fetchUserOrderNotifications();
      scheduleUserPoll();
    };

    fetchUserOrderNotifications();
    scheduleUserPoll();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("adminOrdersUpdated", handleAdminOrdersUpdated);

    return () => {
      clearUserPollTimer();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("adminOrdersUpdated", handleAdminOrdersUpdated);
    };
  }, [authUser, fetchUserOrderNotifications, scheduleUserPoll]);

  /* ================= LOGOUT ================= */

  const handleLogout = useCallback(async () => {
    console.log('LOGOUT CLICKED');
    const res = await supabase.auth.signOut();
    console.log('SIGNOUT RESULT:', res);
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const handleUserOrdersOpen = useCallback(() => {
    setIsUserOrdersOpen(true);
    setUserOrderNotifications((prev) => {
      if (!prev.some((item) => !item.read)) return prev;
      const next = prev.map((item) => ({ ...item, read: true }));
      if (userNotificationsStorageKey) {
        localStorage.setItem(userNotificationsStorageKey, JSON.stringify(next));
      }
      return next;
    });
  }, [userNotificationsStorageKey]);
  const isRoleResolved = !sessionUser || !!profile?.role;

  return (
    <div className="App relative flex min-h-screen flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #5eaeea 0%, #9dcdf0 30%, #d7eaf8 68%, #fdfefe 100%)",
          }}
        />
        <div className="relative z-10 flex min-h-screen flex-col">
        <Header
          user={authUser}
          onLogout={handleLogout}
          onRequestLogin={openLoginModal}
          onCartOpen={() => setIsCartOpen(true)}
          onFavoritesOpen={() => setIsFavoritesOpen(true)}
          onAdminOrdersOpen={() => setIsAdminOrdersOpen(true)}
          onUserOrdersOpen={handleUserOrdersOpen}
          isRoleResolved={isRoleResolved}
          newOrdersCount={newOrdersCount}
          userNotificationsCount={userNotificationsCount}
          showAddedBanner={showAddedBanner}
        />

        {isLoginModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLoginModal();
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={closeLoginModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
              <AuthForm
                variant="modal"
                onSuccess={closeLoginModal}
                onClose={closeLoginModal}
              />
            </div>
          </div>
        )}

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
        <FavoritesDrawer
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
        />
        {authUser?.role === 'admin' && (
          <AdminOrdersDrawer
            isOpen={isAdminOrdersOpen}
            onClose={() => setIsAdminOrdersOpen(false)}
            orders={adminOrders}
            lastRefreshedAt={adminOrdersLastRefreshedAt}
          />
        )}
        {authUser && authUser.role !== 'admin' && (
          <UserOrdersDrawer
            isOpen={isUserOrdersOpen}
            onClose={() => setIsUserOrdersOpen(false)}
            notifications={userOrderNotifications}
            orders={userOrders}
            lastRefreshedAt={userOrdersLastRefreshedAt}
          />
        )}

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home profile={profile} />} />
            <Route path="/category/:categorySlug" element={<CategoryListingPage />} />
            <Route
              path="/category/:categorySlug/:subCategorySlug"
              element={<CategoryListingPage />}
            />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                authUser
                  ? <Checkout user={authUser} onRequestLogin={openLoginModal} />
                  : <Navigate to="/login" replace state={{ from: location }} />
              }
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="/search" element={<Search />} />
            <Route path="/under-100" element={<UnderHundredPage />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route
              path="/admin/add-product"
              element={
                authLoading || !profile
                  ? <div className="p-6 text-sm text-slate-500">Loading admin…</div>
                  : profile.role === 'admin'
                    ? (
                      <AdminAddProduct
                        profile={profile}
                        authLoading={authLoading}
                        adminOrders={adminOrders}
                      />
                    )
                    : <Navigate to="/" replace />
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={sessionUser} loading={authLoading}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>

        {showAddedBanner && (
          <div className="fixed bottom-6 left-0 right-0 z-[120] flex justify-center px-4">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-700 bg-emerald-600 px-4 py-2.5 shadow-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                &#10003;
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
                Item added to cart
              </div>
            </div>
          </div>
        )}

        {showPersistentWhatsApp && (
          <a
            href="https://wa.me/918667418965"
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-5 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/80 bg-transparent p-1.5 shadow-lg shadow-emerald-500/35 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Chat on WhatsApp"
          >
            <img src={WhatsIcon} alt="" className="h-full w-full object-contain" aria-hidden="true" />
          </a>
        )}

        <Footer />
        </div>
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <CartProvider>
          <ProfileProvider>
            <AppContent />
          </ProfileProvider>
        </CartProvider>
      </FavoritesProvider>
    </BrowserRouter>
  );
}

export default App;







