import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  FAVORITES_STORAGE,
  clearFavoritesStorage,
  persistFavoritesToStorage,
  readFavoritesFromStorage,
} from '../helpers/storage';

const FavoritesContext = createContext(null);

const normalizeFavoriteItem = (item) => {
  const imageFromDb = item?.product_images?.[0]?.url || '';
  const image = item?.image || imageFromDb || '';

  return {
    id: item?.id,
    title: item?.title || item?.name || '',
    price: Number(item?.price ?? 0),
    image,
    meta: item?.meta || item?.subtitle || '',
  };
};

export const FavoritesProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    const { items } = readFavoritesFromStorage();
    return (items || []).map(normalizeFavoriteItem).filter((item) => item.id);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    persistFavoritesToStorage(favoriteItems);
  }, [favoriteItems]);

  const addFavorite = (product) => {
    if (!product?.id) return;
    setFavoriteItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, normalizeFavoriteItem(product)];
    });
  };

  const removeFavorite = (productId) => {
    if (!productId) return;
    setFavoriteItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleFavorite = (product) => {
    if (!product?.id) return;
    setFavoriteItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev.filter((item) => item.id !== product.id);
      return [...prev, normalizeFavoriteItem(product)];
    });
  };

  const isFavorite = (productId) =>
    favoriteItems.some((item) => item.id === productId);

  const clearFavorites = () => {
    setFavoriteItems([]);
    clearFavoritesStorage();
  };

  const value = useMemo(
    () => ({
      favoriteItems,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      favoriteCount: favoriteItems.length,
      storageKey: FAVORITES_STORAGE.key,
    }),
    [favoriteItems]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
