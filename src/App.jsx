import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CartPage from './pages/CartPage.jsx';
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
  const { clearCart } = useCart();

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
    if (!authUser?.name) return null;
    return `Welcome ${authUser.name}`;
  }, [authUser]);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSessionUser(session?.user ?? null);
        const { profile: initialProfile } = await fetchCurrentProfile();
        if (isMounted) {
          setProfile(initialProfile);
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
      }
    };


    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSessionUser(session?.user ?? null);
    
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          try {
            // Try to fetch existing profile
            const { profile: refreshedProfile, error: fetchErr } = await fetchCurrentProfile();
            if (fetchErr) {
              console.error('fetchCurrentProfile error', fetchErr);
            }
    
            if (!refreshedProfile) {
              // No profile exists -> create one
              const displayName = session?.user?.user_metadata?.full_name ?? session?.user?.email ?? null;
              try {
                const { profile: createdProfile, error: upsertErr } = await upsertProfile({
                  full_name: displayName,
                  phone: null,
                });
                if (upsertErr) {
                  console.error('upsertProfile error', upsertErr);
                } else {
                  setProfile(createdProfile);
                }
              } catch (err) {
                console.error('Unexpected upsertProfile error', err);
              }
            } else {
              // Profile exists -> use it
              setProfile(refreshedProfile);
            }
          } catch (error) {
            console.error('Failed to refresh/create profile', error);
          }
        }
    
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );
    

    init();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // Clear cart storage
      clearCart();
      clearCartStorage();
      
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear any other localStorage items if needed
      // Note: Supabase handles its own session storage, but we clear cart explicitly
    } catch (error) {
      console.error('Logout failed', error);
    }
  }, [clearCart]);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    closeLoginModal();
  }, [closeLoginModal]);

  const handleProfileUpdate = useCallback((updatedProfile) => {
    setProfile(updatedProfile);
  }, []);




  return (
    <BrowserRouter>
      <div className="App flex min-h-screen flex-col">
        <Header user={authUser} onLogout={handleLogout} onRequestLogin={openLoginModal} />
        {welcomeText && (
          <div className="bg-sky-50 text-sky-800 text-center text-sm font-semibold tracking-wide py-2">
            {welcomeText}
          </div>
        )}
        {isLoginModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeLoginModal();
              }
            }}
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={closeLoginModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <AuthForm
                variant="modal"
                onSuccess={handleAuthSuccess}
                onProfileUpdate={handleProfileUpdate}
                onClose={closeLoginModal}
              />
            </div>
          </div>
        )}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home profile={profile} />} />
            <Route path="/category/:categorySlug" element={<CategoryListingPage />} />
            <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryListingPage />} />
            <Route path="/cart" element={<CartPage/>} />
            <Route
              path="/admin/add-product"
              element={
                profile?.role === 'admin' ? (
                  <AdminAddProduct profile={profile} />
                ) : (
                  <Navigate to="/" replace />
                )
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
