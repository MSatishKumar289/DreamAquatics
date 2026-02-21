import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  addFavoriteProduct,
  fetchMyFavoriteProducts,
  removeFavoriteProduct,
} from '../lib/favoritesApi';

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
    availability: item?.availability || item?.status || '',
    stock_count: item?.stock_count,
  };
};

export const FavoritesProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  const loadFavorites = async () => {
    const { data, error } = await fetchMyFavoriteProducts();
    if (error) {
      setFavoriteItems([]);
      return { data: [], error };
    }
    const normalized = (data || [])
      .map(normalizeFavoriteItem)
      .filter((item) => item.id);
    setFavoriteItems(normalized);
    return { data: normalized, error: null };
  };

  useEffect(() => {
    let active = true;

    const hydrateFavorites = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        setFavoriteItems([]);
        return;
      }
      await loadFavorites();
    };

    hydrateFavorites();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        setFavoriteItems([]);
        return;
      }
      void loadFavorites();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const addFavorite = async (product) => {
    if (!product?.id) return { error: new Error('Missing product id') };

    const { error } = await addFavoriteProduct(product.id);
    if (error) return { error };

    setFavoriteItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, normalizeFavoriteItem(product)];
    });
    return { error: null };
  };

  const removeFavorite = async (productId) => {
    if (!productId) return { error: new Error('Missing product id') };

    const { error } = await removeFavoriteProduct(productId);
    if (error) return { error };

    setFavoriteItems((prev) => prev.filter((item) => item.id !== productId));
    return { error: null };
  };

  const toggleFavorite = async (product) => {
    if (!product?.id) return { error: new Error('Missing product id') };
    const exists = favoriteItems.some((item) => item.id === product.id);
    return exists ? removeFavorite(product.id) : addFavorite(product);
  };

  const isFavorite = (productId) =>
    favoriteItems.some((item) => item.id === productId);

  const clearFavorites = () => {
    setFavoriteItems([]);
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
      reloadFavorites: loadFavorites,
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
