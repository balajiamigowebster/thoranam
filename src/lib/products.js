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
      return sortProductsChronological(json.data);
    }
  } catch (err) {
    console.warn("Could not fetch products from database API:", err.message);
  }
  return [];
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

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("thoranam_products_updated"));
  }

  return json;
}

// Helper stub for legacy imports (always returns empty array so initial state stays clean)
export function getStoredProducts() {
  return [];
}

export function saveStoredProducts() {
  // Deprecated: products are stored only in the database
}

export const INITIAL_PRODUCTS = [];
