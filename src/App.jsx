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

  const handleLogin = useCallback((name, email) => {
    const session = {
      name,
      email: email || '',
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

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App flex min-h-screen flex-col">
          <Header user={user} onLogout={handleLogout} />
          {welcomeText && (
            <div className="bg-sky-50 text-sky-800 text-center text-sm font-semibold tracking-wide py-2">
              {welcomeText}
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
