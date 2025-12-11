import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [formError, setFormError] = useState('');

  const welcomeText = useMemo(() => {
    if (!user?.name) return null;
    return `Welcome ${user.name}`;
  }, [user]);
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = useCallback((email, name = null) => {
    const session = {
      email,
      name: name || email.split('@')[0],
      expiresAt: Date.now() + SESSION_MS,
    };
    setUser(session);
    localStorage.setItem(USER_KEY, JSON.stringify(session));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const openLoginModal = useCallback(() => {
    setFormError('');
    setIsRegisterMode(false);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsRegisterMode(false);
    setFormError('');
    setEmailInput('');
    setPasswordInput('');
    setNameInput('');
  }, []);

  const handleLoginSubmit = useCallback(() => {
    if (!emailInput.trim()) {
      setFormError('Please enter your email');
      return;
    }
    if (!validateEmail(emailInput.trim())) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!passwordInput.trim()) {
      setFormError('Please enter your password');
      return;
    }
    handleLogin(emailInput.trim());
    setEmailInput('');
    setPasswordInput('');
    setFormError('');
    setIsLoginModalOpen(false);
  }, [handleLogin, emailInput, passwordInput]);

  const handleRegisterSubmit = useCallback(() => {
    if (!nameInput.trim()) {
      setFormError('Please enter your name');
      return;
    }
    if (!emailInput.trim()) {
      setFormError('Please enter your email');
      return;
    }
    if (!validateEmail(emailInput.trim())) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!passwordInput.trim()) {
      setFormError('Please enter your password');
      return;
    }
    handleLogin(emailInput.trim(), nameInput.trim());
    setEmailInput('');
    setPasswordInput('');
    setNameInput('');
    setFormError('');
    setIsLoginModalOpen(false);
    setIsRegisterMode(false);
  }, [handleLogin, nameInput, emailInput, passwordInput]);




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
                <h2 className="text-xl font-bold text-slate-900">
                  {isRegisterMode ? 'Create an account' : 'Sign in'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {isRegisterMode 
                    ? 'Enter your details to create an account.' 
                    : 'Enter your email and password to continue.'}
                </p>
                <div className="mt-4 space-y-4">
                  {isRegisterMode && (
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
                  )}
                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your.email@example.com"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your password"
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </label>
                  {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeLoginModal}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={isRegisterMode ? handleRegisterSubmit : handleLoginSubmit}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
                  >
                    {isRegisterMode ? 'Register' : 'Login'}
                  </button>
                </div>
                <div className="mt-4 text-center">
                  {isRegisterMode ? (
                    <p className="text-sm text-slate-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(false);
                          setFormError('');
                        }}
                        className="font-semibold text-sky-600 hover:text-sky-700"
                      >
                        Login
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(true);
                          setFormError('');
                        }}
                        className="font-semibold text-sky-600 hover:text-sky-700"
                      >
                        Register
                      </button>
                    </p>
                  )}
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
