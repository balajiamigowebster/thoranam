"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import { getApiUrl } from "@/config";

const WishlistContext = createContext(null);
const emptySubscribe = () => () => {};

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [badgeBump, setBadgeBump] = useState(false);

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Helper to read current customer from localStorage
  const getCustomer = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("thoranam_customer_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Save to localStorage and fire broadcast event
  const persistLocally = useCallback((items) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("thoranam_wishlist", JSON.stringify(items));
      window.dispatchEvent(new Event("thoranam_wishlist_updated"));
    } catch (e) {
      console.error("Wishlist persist error:", e);
    }
  }, []);

  // Sync with DB if customer is signed in
  const syncWithDb = useCallback(async (currentLocalItems) => {
    const cust = getCustomer();
    if (!cust || !cust.email) return;

    try {
      // 1. Send local items to merge into DB
      const res = await fetch(getApiUrl("/api/wishlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cust.email,
          action: "sync",
          items: currentLocalItems,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        // Map DB items to clean format
        const clean = data.items.map((it) => ({
          id: it.product_id,
          title: it.product_title,
          price: it.product_price,
          image: it.product_image,
          mainImage: it.product_image,
          category: it.product_category,
        }));
        setWishlistItems(clean);
        persistLocally(clean);
      }
    } catch (err) {
      console.warn("Could not sync wishlist with DB:", err);
    }
  }, [getCustomer, persistLocally]);

  // Initial load
  useEffect(() => {
    let initial = [];
    try {
      const stored = localStorage.getItem("thoranam_wishlist");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          initial = parsed;
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setWishlistItems(parsed);
        }
      }
    } catch (e) {}

    // Check if customer is already signed in
    syncWithDb(initial);
  }, [syncWithDb]);

  // Listen for customer login/logout events
  useEffect(() => {
    const handleAuthChange = () => {
      let current = [];
      try {
        const stored = localStorage.getItem("thoranam_wishlist");
        if (stored) current = JSON.parse(stored);
      } catch (e) {}
      syncWithDb(current);
    };

    const handleStorage = (e) => {
      if (e.key === "thoranam_wishlist" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setWishlistItems(parsed);
        } catch (err) {}
      }
      if (e.key === "thoranam_customer_user") {
        handleAuthChange();
      }
    };

    window.addEventListener("thoranam_customer_auth_changed", handleAuthChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("thoranam_customer_auth_changed", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncWithDb]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const pidStr = String(productId);
      return wishlistItems.some((it) => String(it.id) === pidStr);
    },
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      if (!product || !product.id) return;
      const pid = String(product.id);
      const exists = wishlistItems.some((it) => String(it.id) === pid);

      let updated;
      const cust = getCustomer();

      if (exists) {
        // Remove
        updated = wishlistItems.filter((it) => String(it.id) !== pid);
        setWishlistItems(updated);
        persistLocally(updated);

        if (cust?.email) {
          try {
            await fetch(
              getApiUrl(`/api/wishlist?email=${encodeURIComponent(cust.email)}&productId=${encodeURIComponent(pid)}`),
              { method: "DELETE" }
            );
          } catch (e) {}
        }
      } else {
        // Add
        const newItem = {
          id: pid,
          title: product.title || "",
          price: product.price || "",
          image: product.image || product.mainImage || "/images/product-1.jpg",
          mainImage: product.mainImage || product.image || "/images/product-1.jpg",
          category: product.category || "",
        };
        updated = [newItem, ...wishlistItems.filter((it) => String(it.id) !== pid)];
        setWishlistItems(updated);
        persistLocally(updated);

        // Visual bump animation
        setBadgeBump(true);
        setTimeout(() => setBadgeBump(false), 600);

        if (cust?.email) {
          try {
            await fetch(getApiUrl("/api/wishlist"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: cust.email,
                product: newItem,
              }),
            });
          } catch (e) {}
        }
      }
    },
    [wishlistItems, getCustomer, persistLocally]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!productId) return;
      const pid = String(productId);
      const updated = wishlistItems.filter((it) => String(it.id) !== pid);
      setWishlistItems(updated);
      persistLocally(updated);

      const cust = getCustomer();
      if (cust?.email) {
        try {
          await fetch(
            getApiUrl(`/api/wishlist?email=${encodeURIComponent(cust.email)}&productId=${encodeURIComponent(pid)}`),
            { method: "DELETE" }
          );
        } catch (e) {}
      }
    },
    [wishlistItems, getCustomer, persistLocally]
  );

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    persistLocally([]);
  }, [persistLocally]);

  const totalCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        totalCount,
        badgeBump,
        isMounted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}

