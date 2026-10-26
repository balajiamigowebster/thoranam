// Frontend API Configuration
// Dynamically switches between local development and live backend URL

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

/**
 * Helper to construct full API URLs
 * Uses relative path directly on the deployment host (Vercel, localhost, or live server)
 * This guarantees the frontend works seamlessly with its own API routes.
 * @param {string} path e.g. "/api/products"
 */
export function getApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
  }
  return cleanPath;
}

export const LIVE_BACKEND_URL = "https://amigowebster.in/thoranam";

export function getAssetUrl(src) {
  if (!src) return "/images/placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  return src;
}

export default {
  API_BASE_URL,
  getApiUrl,
  getAssetUrl,
};
