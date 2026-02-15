const CART_STORAGE_KEY = 'dream-aquatics-cart';
const FAVORITES_STORAGE_KEY = 'dream-aquatics-favorites';

const isBrowser = typeof window !== 'undefined';

const isStorageAvailable = () => {
  if (!isBrowser) return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('[storage] localStorage unavailable, falling back to memory-only cart.', error);
    return false;
  }
};

export const getNextMidnightIso = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.toISOString();
};

export const readCartFromStorage = () => {
  if (!isStorageAvailable()) {
    return { items: [], expiry: null };
  }

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedValue) {
      return { items: [], expiry: getNextMidnightIso() };
    }

    const parsed = JSON.parse(storedValue);
    const expiryTime = parsed?.expiry ? new Date(parsed.expiry).getTime() : null;
    if (!expiryTime || Date.now() >= expiryTime) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return { items: [], expiry: getNextMidnightIso() };
    }

    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      expiry: parsed.expiry,
    };
  } catch (error) {
    console.warn('[storage] Unable to parse cart data. Resetting cart.', error);
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return { items: [], expiry: getNextMidnightIso() };
  }
};

export const persistCartToStorage = (items) => {
  if (!isStorageAvailable()) return;
  try {
    const payload = {
      items,
      expiry: getNextMidnightIso(),
    };
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[storage] Failed to persist cart data.', error);
  }
};

export const clearCartStorage = () => {
  if (!isStorageAvailable()) return;
  window.localStorage.removeItem(CART_STORAGE_KEY);
};

export const readFavoritesFromStorage = () => {
  if (!isStorageAvailable()) {
    return { items: [], expiry: null };
  }

  try {
    const storedValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!storedValue) {
      return { items: [], expiry: getNextMidnightIso() };
    }

    const parsed = JSON.parse(storedValue);
    const expiryTime = parsed?.expiry ? new Date(parsed.expiry).getTime() : null;
    if (!expiryTime || Date.now() >= expiryTime) {
      window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
      return { items: [], expiry: getNextMidnightIso() };
    }

    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      expiry: parsed.expiry,
    };
  } catch (error) {
    console.warn('[storage] Unable to parse favorites data. Resetting favorites.', error);
    window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    return { items: [], expiry: getNextMidnightIso() };
  }
};

export const persistFavoritesToStorage = (items) => {
  if (!isStorageAvailable()) return;
  try {
    const payload = {
      items,
      expiry: getNextMidnightIso(),
    };
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[storage] Failed to persist favorites data.', error);
  }
};

export const clearFavoritesStorage = () => {
  if (!isStorageAvailable()) return;
  window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
};

export const CART_STORAGE = {
  key: CART_STORAGE_KEY,
  read: readCartFromStorage,
  write: persistCartToStorage,
  clear: clearCartStorage,
};

export const FAVORITES_STORAGE = {
  key: FAVORITES_STORAGE_KEY,
  read: readFavoritesFromStorage,
  write: persistFavoritesToStorage,
  clear: clearFavoritesStorage,
};


