import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { CART_STORAGE, readCartFromStorage, persistCartToStorage, clearCartStorage } from '../helpers/storage';

const CartContext = createContext(null);

const normalizeItem = (item) => ({
  id: item.id,
  title: item.title,
  price: item.price,
  qty: item.qty ?? item.quantity ?? 1,
  image: item.image,
  meta: item.meta || item.subtitle || '',
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    const { items } = readCartFromStorage();
    return items.map(normalizeItem);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    persistCartToStorage(cartItems);
  }, [cartItems]);

  const addItem = (product, qty = 1) => {
    if (!product?.id) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [...prev, normalizeItem({ ...product, qty })];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty } : item
      )
    );
  };

  const removeItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    clearCartStorage();
  };

  const getItemCount = () => cartItems.reduce((sum, item) => sum + item.qty, 0);

  const getSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const value = useMemo(
    () => ({
      cartItems,
      addItem,
      addToCart: addItem,
      updateQty,
      removeItem,
      clearCart,
      getItemCount,
      getSubtotal,
      itemCount: getItemCount(),
      subtotal: getSubtotal(),
      storageKey: CART_STORAGE.key,
    }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

