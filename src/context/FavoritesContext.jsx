import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  addFavoriteProduct,
  fetchMyFavoriteProducts,
  removeFavoriteProduct,
} from '../lib/favoritesApi';

const FavoritesContext = createContext(null);
const FAVORITES_STORAGE_KEY = 'dream-aquatics-favorites';
const areSameId = (a, b) => String(a ?? '') === String(b ?? '');

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
  const [authUserId, setAuthUserId] = useState(null);

  const readGuestFavorites = () => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeFavoriteItem).filter((item) => item.id);
    } catch (error) {
      console.warn('[favorites] Failed to read guest favorites', error);
      return [];
    }
  };

  const persistGuestFavorites = (items) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('[favorites] Failed to persist guest favorites', error);
    }
  };

  const clearGuestFavorites = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
  };

  const loadFavorites = async () => {
    if (!authUserId) {
      const guest = readGuestFavorites();
      setFavoriteItems(guest);
      return { data: guest, error: null };
    }
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

  const syncGuestFavoritesToServer = async () => {
    const guestItems = readGuestFavorites();
    if (!guestItems.length) return { error: null };

    for (const item of guestItems) {
      const { error } = await addFavoriteProduct(item.id);
      if (error) return { error };
    }
    clearGuestFavorites();
    return { error: null };
  };

  useEffect(() => {
    let active = true;

    const hydrateFavorites = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        setAuthUserId(null);
        setFavoriteItems(readGuestFavorites());
        return;
      }
      setAuthUserId(session.user.id);
      await syncGuestFavoritesToServer();
      const { data } = await fetchMyFavoriteProducts();
      if (!active) return;
      const normalized = (data || [])
        .map(normalizeFavoriteItem)
        .filter((item) => item.id);
      setFavoriteItems(normalized);
    };

    hydrateFavorites();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        setAuthUserId(null);
        setFavoriteItems(readGuestFavorites());
        return;
      }
      setAuthUserId(session.user.id);
      void (async () => {
        await syncGuestFavoritesToServer();
        const { data } = await fetchMyFavoriteProducts();
        if (!active) return;
        const normalized = (data || [])
          .map(normalizeFavoriteItem)
          .filter((item) => item.id);
        setFavoriteItems(normalized);
      })();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const addFavorite = async (product) => {
    if (!product?.id) return { error: new Error('Missing product id') };
    const normalizedProduct = normalizeFavoriteItem(product);

    if (!authUserId) {
      setFavoriteItems((prev) => {
        if (prev.some((item) => areSameId(item.id, product.id))) return prev;
        const next = [...prev, normalizedProduct];
        persistGuestFavorites(next);
        return next;
      });
      return { error: null };
    }

    const { error } = await addFavoriteProduct(product.id);
    if (error) return { error };

    setFavoriteItems((prev) => {
      if (prev.some((item) => areSameId(item.id, product.id))) return prev;
      return [...prev, normalizedProduct];
    });
    return { error: null };
  };

  const removeFavorite = async (productId) => {
    if (!productId) return { error: new Error('Missing product id') };

    if (!authUserId) {
      setFavoriteItems((prev) => {
        const next = prev.filter((item) => !areSameId(item.id, productId));
        persistGuestFavorites(next);
        return next;
      });
      return { error: null };
    }

    const { error } = await removeFavoriteProduct(productId);
    if (error) return { error };

    setFavoriteItems((prev) => prev.filter((item) => !areSameId(item.id, productId)));
    return { error: null };
  };

  const toggleFavorite = async (product) => {
    if (!product?.id) return { error: new Error('Missing product id') };
    const exists = favoriteItems.some((item) => areSameId(item.id, product.id));
    return exists ? removeFavorite(product.id) : addFavorite(product);
  };

  const isFavorite = (productId) =>
    favoriteItems.some((item) => areSameId(item.id, productId));

  const clearFavorites = () => {
    setFavoriteItems([]);
    clearGuestFavorites();
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
