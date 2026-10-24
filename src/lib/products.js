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

const DEFAULT_HARDCODED_IDS = new Set([
  "1792827048894",
  "1792827048895",
  "1792827048896",
  "1792827048897",
  "1792827048898",
  "fancy-misty-dusk-1",
  "fancy-heritage-procession",
  "fancy-emerald-chevron",
  "fancy-misty-dusk-2",
]);

export function isPhantomOrSeedProduct(p) {
  if (!p) return false;
  const idStr = String(p.id || "");
  if (DEFAULT_HARDCODED_IDS.has(idStr)) return true;
  if (idStr.startsWith("fancy-")) return true;

  const titleLow = (p.title || "").trim().toLowerCase();
  if (SEED_TITLES.has(titleLow)) return true;

  // Filter out any leftover hardcoded default cards
  if (
    titleLow.includes("heritage procession") &&
    (String(p.price).includes("4,890") || String(p.price).includes("4890") || p.stock === 8)
  ) {
    return true;
  }
  if (titleLow.includes("misty dusk")) {
    if (String(p.price).includes("3,250") || String(p.price).includes("3250")) return true;
    if (Array.isArray(p.highlights) && p.highlights.length <= 3) return true;
  }
  if (
    titleLow.includes("emerald chevron") &&
    (String(p.price).includes("2,890") || String(p.price).includes("2890") || p.stock === 14)
  ) {
    return true;
  }

  // Filter out old default products that have default placeholder paths and no explicit user creation flag
  const defaultImages = new Set([
    "/images/product-1.jpg",
    "/images/product-2.jpg",
    "/images/product-3.jpg",
    "/images/product-4.jpg",
    "/images/bestseller-2.jpg",
  ]);
  if (!p._userCreated && !p._userModified && defaultImages.has(p.mainImage)) {
    if (
      titleLow.includes("plum leaf") ||
      titleLow.includes("misty dusk") ||
      titleLow.includes("heritage procession") ||
      titleLow.includes("emerald chevron") ||
      titleLow.includes("verdant ikat")
    ) {
      return true;
    }
  }

  return false;
}

export function isSeedProduct(p) {
  return isPhantomOrSeedProduct(p);
}

export async function fetchProductsFromDb() {
  try {
    const res = await fetch(getApiUrl("/api/products"));
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const cleanDbData = json.data.filter((p) => !isPhantomOrSeedProduct(p));
      const local = getLocalProducts();
      const localMap = new Map(local.map((p) => [String(p.id), p]));
      const overrides = getFeaturedOverrides();

      // Merge db items with user's local edits and featured overrides
      const merged = cleanDbData.map((dbProduct) => {
        const localProduct = localMap.get(String(dbProduct.id));
        let combined = { ...dbProduct };

        if (localProduct && (localProduct._userModified || localProduct._lastModified)) {
          combined = { ...combined, ...localProduct };
        }

        if (overrides[String(dbProduct.id)] !== undefined) {
          combined.isFeatured = Boolean(overrides[String(dbProduct.id)]);
        } else if (localProduct && localProduct.isFeatured !== undefined) {
          combined.isFeatured = Boolean(localProduct.isFeatured);
        }

        return combined;
      });

      const dbIds = new Set(cleanDbData.map((p) => String(p.id)));
      const locallyAdded = local.filter((p) => !dbIds.has(String(p.id)));
      const finalMerged = [...locallyAdded, ...merged].filter((p) => !isPhantomOrSeedProduct(p));
      saveLocalProducts(finalMerged, false);
      return finalMerged;
    }
  } catch (err) {
    console.warn("Could not fetch products from API, falling back to local storage:", err.message);
  }
  return getLocalProducts();
}

export async function saveProductToDb(productData) {
  const isFeatured = Boolean(productData.isFeatured);
  const productId = productData.id || Date.now();

  // 1. Immediately record in featured overrides
  saveFeaturedOverride(productId, isFeatured);

  // 2. Mark product as created/modified by user
  const finalItem = {
    ...productData,
    id: productId,
    isFeatured,
    _userCreated: true,
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
    console.warn("Could not delete product via API:", err.message);
  }
  const current = getLocalProducts();
  const updated = current.filter((p) => String(p.id) !== String(productId));
  saveLocalProducts(updated, true);
}

// Local storage helpers
function getLocalProducts() {
  if (typeof window === "undefined") return [];
  const overrides = getFeaturedOverrides();
  try {
    const saved = localStorage.getItem("thoranam_products");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Exclude default mock and seed products
        const clean = parsed.filter((p) => !isPhantomOrSeedProduct(p));
        // If clean list changed, sync back to local storage
        if (clean.length !== parsed.length) {
          localStorage.setItem("thoranam_products", JSON.stringify(clean));
        }
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
  return [];
}

function saveLocalProducts(products, notify = true) {
  if (typeof window === "undefined") return;
  try {
    const cleanOnly = (products || []).filter((p) => !isPhantomOrSeedProduct(p));
    localStorage.setItem("thoranam_products", JSON.stringify(cleanOnly));
    if (notify) {
      window.dispatchEvent(new Event("thoranam_products_updated"));
    }
  } catch (e) {
    console.error(e);
  }
}

export { INITIAL_PRODUCTS, getLocalProducts as getStoredProducts, saveLocalProducts as saveStoredProducts };
