// Frontend API Configuration
// Dynamically switches between local development and live backend URL

const LIVE_BACKEND_URL = "https://amigowebster.in/thoranam";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

/**
 * Helper to construct full API URLs
 * When deployed on Vercel or live domain, forwards API calls to the cPanel Node.js backend where MySQL runs.
 * @param {string} path e.g. "/api/products" or "api/products"
 * @returns {string} full URL e.g. "https://amigowebster.in/thoranam/api/products"
 */
export function getApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
  }
  // Auto-detect Vercel preview/production and connect directly to live cPanel backend
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    if (host.includes("vercel.app") || host.includes("thoranam")) {
      return `${LIVE_BACKEND_URL.replace(/\/$/, "")}${cleanPath}`;
    }
  }
  return cleanPath;
}

/**
 * Helper to resolve uploaded images or static assets
 * If image is /uploads/filename.jpg, loads from backend where it was stored!
 */
export function getAssetUrl(src) {
  if (!src) return "/images/placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  if (src.startsWith("/uploads/")) {
    return `${LIVE_BACKEND_URL.replace(/\/$/, "")}${src}`;
  }
  return src;
}

export default {
  API_BASE_URL,
  getApiUrl,
  getAssetUrl,
};
