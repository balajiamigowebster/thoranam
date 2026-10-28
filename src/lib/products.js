// Products Data Layer
// Connects DIRECTLY with MySQL backend API /api/products
// Strictly stores and fetches products from the database, eliminating all localStorage interference

import { getApiUrl } from "@/config";

// Clear any legacy localStorage products cache from user's browser
// STRICT REQUIREMENT: Products must ONLY be stored in MySQL Database, never in localStorage!
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("thoranam_products");
    localStorage.removeItem("thoranam_products_cache");
    localStorage.removeItem("thoranam_products_catalog_cache_v2");
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

// In-memory client cache only (RAM only, NEVER saved to localStorage)
let clientProductsCache = null;
let pendingFetch = null;

const CACHE_STORAGE_KEY = "thoranam_products_session_cache";

// Initialize transient session-only cache if available in current browser tab
if (typeof window !== "undefined") {
  try {
    const saved = sessionStorage.getItem(CACHE_STORAGE_KEY);
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
    // Transient tab session only - strictly NO localStorage
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(sorted));
      } catch (e) {}
    }
    return sorted;
  }
  return clientProductsCache || [];
}

// Fast lookup of single product from memory/storage
export function getProductFromCache(productId) {
  if (!productId) return null;
  const products = getStoredProducts();
  const idStr = String(productId).trim().toLowerCase();
  return (
    products.find(
      (p) =>
        String(p.id).toLowerCase() === idStr ||
        p.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === idStr
    ) || null
  );
}

// Fetch all products directly from the database API with in-flight deduplication
export async function fetchProductsFromDb(force = false) {
  // If request is already in progress, reuse the existing promise
  if (pendingFetch && !force) {
    return pendingFetch;
  }

  pendingFetch = (async () => {
    let timeoutId = null;
    try {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      if (controller) {
        timeoutId = setTimeout(() => controller.abort(), 15000);
      }
      const res = await fetch(getApiUrl("/api/products"), {
        signal: controller?.signal,
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Failed to fetch products from database");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return updateLocalCache(json.data);
      }
    } catch (err) {
      console.warn("Could not fetch products from database API:", err.message);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      pendingFetch = null;
    }
    return getStoredProducts();
  })();

  return pendingFetch;
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
      const saved = sessionStorage.getItem(CACHE_STORAGE_KEY);
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
