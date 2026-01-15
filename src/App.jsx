import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import Home from './pages/Home';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/Checkout.jsx';
import CategoryListingPage from './pages/CategoryListingPage';
import AdminAddProduct from './pages/AdminAddProduct';
import Login from './pages/Login';
import AuthForm from './components/AuthForm';
import { supabase } from './lib/supabaseClient';
import { fetchCurrentProfile, upsertProfile } from './lib/profileApi';
import { clearCartStorage } from './helpers/storage';

function AppContent() {
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { clearCart } = useCart();

  /* ================= AUTH LISTENER (SESSION ONLY) ================= */

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('AUTH EVENT:', event);

        if (event === 'SIGNED_OUT') {
          setSessionUser(null);
          setProfile(null);

          // 🔒 Cart cleanup happens ONLY here
          clearCart();
          clearCartStorage();

          return;
        }

        if (session?.user) {
          setSessionUser(session.user);
        }
      });

    return () => subscription.unsubscribe();
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

  /* ================= LOGOUT ================= */

  const handleLogout = useCallback(async () => {
    console.log('LOGOUT CLICKED');
    const res = await supabase.auth.signOut();
    console.log('SIGNOUT RESULT:', res);
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <BrowserRouter>
      <div className="App flex min-h-screen flex-col">
        <Header
          user={authUser}
          onLogout={handleLogout}
          onRequestLogin={openLoginModal}
          onCartOpen={() => setIsCartOpen(true)}
        />

        {welcomeText && (
          <div className="bg-sky-50 text-sky-800 text-center text-sm font-semibold tracking-wide py-2">
            {welcomeText}
          </div>
        )}

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
                <Checkout user={authUser} onRequestLogin={openLoginModal} />
              }
            />
            <Route
              path="/admin/add-product"
              element={
                profile?.role === 'admin'
                  ? <AdminAddProduct profile={profile} />
                  : <Navigate to="/" replace />
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
