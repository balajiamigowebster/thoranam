// Frontend API Configuration
// Dynamically switches between local development and live backend URL

const LIVE_BACKEND_URL = "https://amigowebster.in/thoranam";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? ""
    : LIVE_BACKEND_URL);

/**
 * Helper to construct full API URLs
 * @param {string} path e.g. "/api/products" or "api/products"
 * @returns {string} full URL e.g. "https://amigowebster.in/thoranam/api/products"
 */
export function getApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return cleanPath;
  return `${API_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
}

export default {
  API_BASE_URL,
  getApiUrl,
};
