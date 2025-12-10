import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CartPage from './pages/CartPage.jsx';
import CategoryListingPage from './pages/CategoryListingPage';
import AdminAddProduct from './pages/AdminAddProduct';
import Login from './pages/Login';

function App() {
  const USER_KEY = 'da_user_session';
  const SESSION_MS = 5 * 60 * 1000; // 5 minutes

  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
        return parsed;
      }
      localStorage.removeItem(USER_KEY);
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === USER_KEY) {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : null;
          if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
            setUser(parsed);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
    };

    const checkExpiry = () => {
      if (user?.expiresAt && user.expiresAt <= Date.now()) {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      }
    };

    const interval = setInterval(checkExpiry, 5000);
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user]);

  const handleLogin = useCallback((name, phone) => {
    const session = {
      name,
      phone: phone || '',
      expiresAt: Date.now() + SESSION_MS,
    };
    setUser(session);
    localStorage.setItem(USER_KEY, JSON.stringify(session));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const welcomeText = useMemo(() => {
    if (!user?.name) return null;
    return `Welcome ${user.name}`;
  }, [user]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [formError, setFormError] = useState('');

  const openLoginModal = useCallback(() => {
    setFormError('');
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setFormError('');
  }, []);

  const handleSavePhone = useCallback(() => {
    if (!nameInput.trim()) {
      setFormError('Please enter your name');
      return;
    }
    if (!phoneInput.trim()) {
      setFormError('Please enter your mobile number');
      return;
    }
    handleLogin(nameInput.trim(), phoneInput.trim());
    setNameInput('');
    setPhoneInput('');
    setFormError('');
    setIsLoginModalOpen(false);
  }, [handleLogin, nameInput, phoneInput]);


  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      console.log('Supabase test:', { data, error });
    };
    test();
  }, []);

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App flex min-h-screen flex-col">
          <Header user={user} onLogout={handleLogout} onRequestLogin={openLoginModal} />
          {welcomeText && (
            <div className="bg-sky-50 text-sky-800 text-center text-sm font-semibold tracking-wide py-2">
              {welcomeText}
            </div>
          )}
          {isLoginModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your name and mobile number to continue.
                </p>
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Name
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your name"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Mobile number
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </label>
                  {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      closeLoginModal();
                      setNameInput('');
                      setPhoneInput('');
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePhone}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:categorySlug" element={<CategoryListingPage />} />
              <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryListingPage />} />
              <Route path="/cart" element={<CartPage/>} />
              <Route path="/admin/add-product" element={<AdminAddProduct />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
