import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress as setDefaultAddressDb,
} from "../lib/addressApi";

const MAX_ADDRESSES = 2;

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const refreshAddresses = async () => {
    setLoadingAddresses(true);

    try {
      const { data, error } = await fetchCustomerAddresses();

      if (error) {
        console.error("fetchCustomerAddresses error:", error);
        setAddresses([]);
        return;
      }

      setAddresses(data || []);
    } catch (e) {
      console.error("refreshAddresses crash:", e);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // ✅ only run once on mount (no auth listener here)
  useEffect(() => {
    refreshAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNextAddressLabel = (existing = []) => {
    const labels = new Set(existing.map((a) => (a.label || "").trim()).filter(Boolean));
  
    if (!labels.has("Home")) return "Home";
    if (!labels.has("Home 2")) return "Home 2";
  
    // Home 3, Home 4...
    let i = 3;
    while (labels.has(`Home ${i}`)) i += 1;
    return `Home ${i}`;
  };
  

  const addAddress = async (address) => {
    console.log("address: ", address)
    

    if (addresses.length >= MAX_ADDRESSES) {
      return { ok: false, error: "You can store up to 2 addresses." };
    }

    const payload = {
      label: address.label?.trim() || getNextAddressLabel(addresses),
      is_default: addresses.length === 0,
    
      name: address.name || "",
      email: address.email || "",
    
      mobile: address.mobile ?? address.phone ?? "",
    
      address_line1:
        address.address_line1 ?? address.addressLine1 ?? address.line1 ?? "",
      address_line2:
        address.address_line2 ?? address.addressLine2 ?? address.line2 ?? "",
    
      city: address.city || "",
      landmark: address.landmark || "",
      pincode: address.pincode || "",
    };
    
    console.log("INSERT payload:", payload);

    const { data, error } = await createCustomerAddress(payload);
    if (error) return { ok: false, error };

    setAddresses((prev) => [...prev, data]);


    return { ok: true, data };
  };

  const updateAddress = async (id, updates) => {
    const payload = {
      label: updates.label,
      name: updates.name,
      email: updates.email,
      mobile: updates.mobile,
      address_line1: updates.address_line1,
      address_line2: updates.address_line2,
      city: updates.city,
      landmark: updates.landmark,
      pincode: updates.pincode,
    };

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const { data, error } = await updateCustomerAddress(id, payload);
    if (error) return { ok: false, error };

    setAddresses((prev) => prev.map((a) => (a.id === id ? data : a)));
    return { ok: true, data };
  };

  const removeAddress = async (id) => {
    const { ok, error } = await deleteCustomerAddress(id);
    if (!ok) return { ok: false, error };

    await refreshAddresses();
    return { ok: true };
  };

  const setDefaultAddress = async (id) => {
    const { ok, error } = await setDefaultAddressDb(id);
    if (!ok) return { ok: false, error };

    await refreshAddresses();
    return { ok: true };
  };

  const value = useMemo(
    () => ({
      addresses,
      loadingAddresses,
      refreshAddresses,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    }),
    [addresses, loadingAddresses]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
};
