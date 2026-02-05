import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import AdminOrdersDrawer from './components/AdminOrdersDrawer';
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
import AuthForm from './components/AuthForm';
import { supabase } from './lib/supabaseClient';
import { fetchCurrentProfile, upsertProfile } from './lib/profileApi';
import { fetchAllOrdersAdmin, normalizeAdminOrders } from './lib/ordersApi';
import { clearCartStorage } from './helpers/storage';
import { ProfileProvider } from './context/ProfileContext';
import ProtectedRoute from "./components/ProtectedRoute";


function AppContent() {
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOrdersOpen, setIsAdminOrdersOpen] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersLastRefreshedAt, setAdminOrdersLastRefreshedAt] = useState(null);
  const [userOrders] = useState([]);
  const adminPollTimerRef = useRef(null);
  const adminPollInFlightRef = useRef(false);
  const location = useLocation();

  const { clearCart, lastAddedAt, lastAddedItem } = useCart();
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

          // 🔒 Cart cleanup happens ONLY here
          clearCart();
          clearCartStorage();

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
  }, [clearCart]);

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

  /* ================= LOGOUT ================= */

  const handleLogout = useCallback(async () => {
    console.log('LOGOUT CLICKED');
    const res = await supabase.auth.signOut();
    console.log('SIGNOUT RESULT:', res);
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const isRoleResolved = !sessionUser || !!profile?.role;

  return (
    <div className="App flex min-h-screen flex-col">
        <Header
          user={authUser}
          onLogout={handleLogout}
          onRequestLogin={openLoginModal}
          onCartOpen={() => setIsCartOpen(true)}
          onAdminOrdersOpen={() => setIsAdminOrdersOpen(true)}
          isRoleResolved={isRoleResolved}
          newOrdersCount={newOrdersCount}
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
        {authUser?.role === 'admin' && (
          <AdminOrdersDrawer
            isOpen={isAdminOrdersOpen}
            onClose={() => setIsAdminOrdersOpen(false)}
            orders={adminOrders}
            lastRefreshedAt={adminOrdersLastRefreshedAt}
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

        <Footer />
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ProfileProvider>
          <AppContent />
        </ProfileProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;





