import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'dream-aquatics-addresses';
const MAX_ADDRESSES = 2;

const ProfileContext = createContext(null);

const loadAddresses = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (error) {
    console.error('Failed to load addresses', error);
    return [];
  }
};

export const ProfileProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    setAddresses(loadAddresses());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses]);

  const addAddress = (address) => {
    if (addresses.length >= MAX_ADDRESSES) {
      return { ok: false, error: 'You can store up to 2 addresses.' };
    }
    const next = {
      ...address,
      id: address.id || crypto.randomUUID(),
      isDefault: addresses.length === 0
    };
    setAddresses((prev) => [...prev, next]);
    return { ok: true };
  };

  const updateAddress = (id, updates) => {
    setAddresses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    return { ok: true };
  };

  const removeAddress = (id) => {
    setAddresses((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (next.length && !next.some((item) => item.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((item) => ({ ...item, isDefault: item.id === id }))
    );
  };

  const value = useMemo(
    () => ({
      addresses,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress
    }),
    [addresses]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
};
