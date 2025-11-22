import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CartPage from './pages/CartPage.jsx';
import CategoryListingPage from './pages/CategoryListingPage';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="App flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:categorySlug" element={<CategoryListingPage />} />
              <Route path="/category/:categorySlug/:subCategorySlug" element={<CategoryListingPage />} />
              <Route path="/cart" element={<CartPage/>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
