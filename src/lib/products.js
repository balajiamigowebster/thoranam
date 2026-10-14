// Products Data Layer
// Connects with MySQL backend API /api/products with offline fallback to localStorage

import { INITIAL_PRODUCTS } from "./initial-products";

export async function fetchProductsFromDb() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      saveLocalProducts(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn("Could not fetch products from MySQL API, falling back to local storage:", err.message);
  }
  return getLocalProducts();
}

export async function saveProductToDb(productData) {
  try {
    const isEdit = Boolean(productData.id && typeof productData.id === "number" && productData.id < 1000000000);
    // If it has a real DB ID (typically integer auto-increment) or if editing
    const method = productData.id && !String(productData.id).startsWith("temp_") ? "PUT" : "POST";
    
    // We send to API
    const res = await fetch("/api/products", {
      method: productData.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    const json = await res.json();
    if (json.success && json.data) {
      window.dispatchEvent(new Event("thoranam_products_updated"));
      return json.data;
    }
  } catch (err) {
    console.warn("Could not save product to MySQL API:", err.message);
  }

  // Fallback to local save
  const current = getLocalProducts();
  let updated;
  const idx = current.findIndex((p) => p.id === productData.id);
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = productData;
  } else {
    updated = [{ ...productData, id: productData.id || Date.now() }, ...current];
  }
  saveLocalProducts(updated);
  return productData;
}

export async function deleteProductFromDb(productId) {
  try {
    const res = await fetch(`/api/products?id=${productId}`, {
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

function saveLocalProducts(products) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thoranam_products", JSON.stringify(products));
    window.dispatchEvent(new Event("thoranam_products_updated"));
  } catch (e) {
    console.error(e);
  }
}

export { INITIAL_PRODUCTS, getLocalProducts as getStoredProducts, saveLocalProducts as saveStoredProducts };
