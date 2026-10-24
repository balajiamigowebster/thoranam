// Products Data Layer
// Connects with MySQL backend API /api/products with offline fallback to localStorage

import { INITIAL_PRODUCTS } from "./initial-products";
import { getApiUrl } from "@/config";

// Persistent overrides for featured status to prevent cold serverless lambdas from flapping
export function getFeaturedOverrides() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("thoranam_featured_overrides");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {};
}

export function saveFeaturedOverride(id, isFeatured) {
  if (typeof window === "undefined") return;
  try {
    const current = getFeaturedOverrides();
    current[String(id)] = Boolean(isFeatured);
    localStorage.setItem("thoranam_featured_overrides", JSON.stringify(current));
  } catch (e) {
    console.error(e);
  }
}

const SEED_TITLES = new Set([
  "semi mangalagiri saree",
  "kanchipuram silk saree",
  "exotic chanderi saree",
  "pure cotton handloom saree",
  "thoranam exclusive zari weave",
  "aqua bloom – pure kota french knot saree",
  "aqua blossom – neem silk festive saree",
  "pastel radiance – chanderi silk saree",
  "chettinad 80 count heritage cotton",
  "illampillai zari border cotton saree",
  "mangalagiri pattu border cotton saree",
  "banarasi silk brocade grand saree",
  "mysore crepe silk gold zari saree",
  "dharmavaram festive silk saree",
  "semi kanchipuram brocade saree",
  "semi raw silk contemporary saree",
  "semi tussar embroidered saree",
  "thoranam signature coimbatore cotton",
  "thoranam royal brocade festive saree",
  "thoranam hand-painted kalamkari saree",
  "chettinad 120 count royal cotton saree",
  "handloom linen cotton pastel saree",
  "organic mul cotton daily grace saree",
]);

export function isSeedProduct(p) {
  if (!p) return false;
  const titleLow = (p.title || "").trim().toLowerCase();
  return SEED_TITLES.has(titleLow);
}

export async function fetchProductsFromDb() {
  try {
    const res = await fetch(getApiUrl("/api/products"));
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      // Exclude any legacy seed products
      const cleanDbData = json.data.filter((p) => !isSeedProduct(p));
      const local = getLocalProducts();
      const localMap = new Map(local.map((p) => [String(p.id), p]));
      const overrides = getFeaturedOverrides();

      // Merge db items with user's local edits and featured overrides
      const merged = cleanDbData.map((dbProduct) => {
        const localProduct = localMap.get(String(dbProduct.id));
        let combined = { ...dbProduct };

        // If the product was edited locally in admin, retain all local modifications
        if (localProduct && (localProduct._userModified || localProduct._lastModified)) {
          combined = { ...combined, ...localProduct };
        }

        // Apply explicit user featured override if present
        if (overrides[String(dbProduct.id)] !== undefined) {
          combined.isFeatured = Boolean(overrides[String(dbProduct.id)]);
        } else if (localProduct && localProduct.isFeatured !== undefined) {
          combined.isFeatured = Boolean(localProduct.isFeatured);
        }

        return combined;
      });

      const dbIds = new Set(cleanDbData.map((p) => String(p.id)));
      const locallyAdded = local.filter((p) => !dbIds.has(String(p.id)));
      const finalMerged = [...locallyAdded, ...merged].filter((p) => !isSeedProduct(p));
      saveLocalProducts(finalMerged, false);
      return finalMerged;
    }
  } catch (err) {
    console.warn("Could not fetch products from MySQL API, falling back to local storage:", err.message);
  }
  return getLocalProducts();
}

export async function saveProductToDb(productData) {
  const isFeatured = Boolean(productData.isFeatured);
  const productId = productData.id || Date.now();

  // 1. Immediately record in featured overrides
  saveFeaturedOverride(productId, isFeatured);

  // 2. Mark product as modified by user so cold lambda responses cannot wipe it
  const finalItem = {
    ...productData,
    id: productId,
    isFeatured,
    _userModified: true,
    _lastModified: Date.now(),
  };

  // 3. Immediately persist to localStorage
  const current = getLocalProducts();
  let updated;
  const idx = current.findIndex((p) => String(p.id) === String(productId));
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...updated[idx], ...finalItem };
  } else {
    updated = [finalItem, ...current];
  }
  saveLocalProducts(updated, true);

  // 4. Send to backend API
  try {
    const isEdit = Boolean(productData.id);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(getApiUrl("/api/products"), {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalItem),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return { ...json.data, isFeatured };
    }
  } catch (err) {
    console.warn("Could not save product to API:", err.message);
  }

  return finalItem;
}

export async function deleteProductFromDb(productId) {
  if (typeof window !== "undefined") {
    try {
      const overrides = getFeaturedOverrides();
      delete overrides[String(productId)];
      localStorage.setItem("thoranam_featured_overrides", JSON.stringify(overrides));
    } catch (e) {}
  }
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
  const updated = current.filter((p) => String(p.id) !== String(productId));
  saveLocalProducts(updated, true);
}

// Local storage helpers
function getLocalProducts() {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  const overrides = getFeaturedOverrides();
  try {
    const saved = localStorage.getItem("thoranam_products");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Exclude seed products from local storage cache
        const clean = parsed.filter((p) => !isSeedProduct(p));
        return clean.map((p) => {
          if (overrides[String(p.id)] !== undefined) {
            return { ...p, isFeatured: Boolean(overrides[String(p.id)]) };
          }
          return p;
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PRODUCTS.filter((p) => !isSeedProduct(p)).map((p) => {
    if (overrides[String(p.id)] !== undefined) {
      return { ...p, isFeatured: Boolean(overrides[String(p.id)]) };
    }
    return p;
  });
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

