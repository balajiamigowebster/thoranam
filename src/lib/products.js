// Products Data Layer
// Connects with MySQL backend API /api/products with offline fallback to localStorage

import { INITIAL_PRODUCTS } from "./initial-products";
import { getApiUrl } from "@/config";

export async function fetchProductsFromDb() {
  try {
    const res = await fetch(getApiUrl("/api/products"));
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      // Merge with local items so locally added items are never erased
      const local = getLocalProducts();
      const dbIds = new Set(json.data.map((p) => String(p.id)));
      const locallyAdded = local.filter((p) => !dbIds.has(String(p.id)));
      const merged = [...locallyAdded, ...json.data];
      saveLocalProducts(merged, false);
      return merged;
    }
  } catch (err) {
    console.warn("Could not fetch products from MySQL API, falling back to local storage:", err.message);
  }
  return getLocalProducts();
}

export async function saveProductToDb(productData) {
  let savedData = null;
  try {
    const isEdit = Boolean(productData.id);
    const method = isEdit ? "PUT" : "POST";
    
    const res = await fetch(getApiUrl("/api/products"), {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const json = await res.json();
    if (json.success && json.data) {
      savedData = json.data;
    } else {
      console.warn("API response warning:", json.message);
    }
  } catch (err) {
    console.warn("Could not save product to API:", err.message);
  }

  // Always persist to local store so additions/checkboxes never disappear
  const finalItem = savedData || productData;
  const current = getLocalProducts();
  let updated;
  const idx = current.findIndex((p) => String(p.id) === String(finalItem.id));
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...updated[idx], ...finalItem };
  } else {
    updated = [{ ...finalItem, id: finalItem.id || Date.now() }, ...current];
  }
  saveLocalProducts(updated, true);
  return finalItem;
}

export async function deleteProductFromDb(productId) {
  try {
    const res = await fetch(getApiUrl(`/api/products?id=${productId}`), {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      window.dispatchEvent(new Event("thoranam_products_updated"));
    }
  } catch (err) {
    console.warn("Could not delete product via MySQL API:", err.message);
  }
  const current = getLocalProducts();
  const updated = current.filter((p) => p.id !== productId);
  saveLocalProducts(updated);
}

// Local storage helpers
function getLocalProducts() {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  try {
    const saved = localStorage.getItem("thoranam_products");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products, notify = true) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thoranam_products", JSON.stringify(products));
    if (notify) {
      window.dispatchEvent(new Event("thoranam_products_updated"));
    }
  } catch (e) {
    console.error(e);
  }
}

export { INITIAL_PRODUCTS, getLocalProducts as getStoredProducts, saveLocalProducts as saveStoredProducts };
