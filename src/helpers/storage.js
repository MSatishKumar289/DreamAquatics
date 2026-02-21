const CART_STORAGE_KEY = 'dream-aquatics-cart';

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

export const CART_STORAGE = {
  key: CART_STORAGE_KEY,
  read: readCartFromStorage,
  write: persistCartToStorage,
  clear: clearCartStorage,
};


