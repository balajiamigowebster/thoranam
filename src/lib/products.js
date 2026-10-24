// Products Data Layer
// Connects DIRECTLY with MySQL backend API /api/products
// Strictly stores and fetches products from the database, eliminating all localStorage interference

import { getApiUrl } from "@/config";

// Clear any legacy localStorage products cache from user's browser
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("thoranam_products");
  } catch (e) {}
}

export function sortProductsChronological(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const timeA = Number(a.id) || 0;
    const timeB = Number(b.id) || 0;
    if (timeA && timeB && timeA !== timeB) {
      return timeA - timeB;
    }
    return 0;
  });
}

// In-memory client cache to serve instant renders without waiting for network roundtrips
let clientProductsCache = null;

// Initialize from sessionStorage if available in browser
if (typeof window !== "undefined") {
  try {
    const saved = sessionStorage.getItem("thoranam_products_cache");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        clientProductsCache = parsed;
      }
    }
  } catch (e) {}
}

function updateLocalCache(data) {
  if (Array.isArray(data)) {
    const sorted = sortProductsChronological(data);
    clientProductsCache = sorted;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("thoranam_products_cache", JSON.stringify(sorted));
      } catch (e) {}
    }
    return sorted;
  }
  return clientProductsCache || [];
}

// Fetch all products directly from the database API
export async function fetchProductsFromDb() {
  try {
    const res = await fetch(getApiUrl("/api/products"), {
      cache: "no-store",
      headers: { Pragma: "no-cache" },
    });
    if (!res.ok) throw new Error("Failed to fetch products from database");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return updateLocalCache(json.data);
    }
  } catch (err) {
    console.warn("Could not fetch products from database API:", err.message);
  }
  return getStoredProducts();
}

// Save (create or update) product directly into the database
export async function saveProductToDb(productData) {
  const isEdit = Boolean(productData.id);
  const method = isEdit ? "PUT" : "POST";

  const res = await fetch(getApiUrl("/api/products"), {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to save product to database");
  }

  // Optimistically update client cache
  if (json.data) {
    const current = getStoredProducts();
    let updated;
    if (isEdit) {
      updated = current.map((p) => (String(p.id) === String(json.data.id) ? json.data : p));
    } else {
      updated = [...current, json.data];
    }
    updateLocalCache(updated);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("thoranam_products_updated"));
  }

  return json.data;
}

// Delete product directly from the database
export async function deleteProductFromDb(productId) {
  const res = await fetch(getApiUrl(`/api/products?id=${productId}`), {
    method: "DELETE",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to delete product from database");
  }

  // Update client cache
  const current = getStoredProducts();
  const filtered = current.filter((p) => String(p.id) !== String(productId));
  updateLocalCache(filtered);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("thoranam_products_updated"));
  }

  return json;
}

// Helper stub for initial states (uses client cache for instant synchronous render if present)
export function getStoredProducts() {
  if (clientProductsCache && clientProductsCache.length > 0) {
    return clientProductsCache;
  }
  if (typeof window !== "undefined") {
    try {
      const saved = sessionStorage.getItem("thoranam_products_cache");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          clientProductsCache = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }
  return [];
}

export function saveStoredProducts() {
  // Deprecated: products are stored only in the database
}

export const INITIAL_PRODUCTS = [];
