// Frontend API Configuration
// Dynamically switches between local development and live backend URL

const LIVE_BACKEND_URL = "https://amigowebster.in/thoranam";

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

/**
 * Helper to resolve uploaded images or static assets
 * If image is /uploads/filename.jpg, serves it from the current server or environment
 */
export function getAssetUrl(src) {
  if (!src) return "/images/placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  // When running locally on localhost, /uploads/... is served directly from /public/uploads/
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    if (host === "localhost" || host === "127.0.0.1") {
      return src;
    }
    // On Vercel or production without local file storage, fallback to live backend
    if (src.startsWith("/uploads/") && (host.includes("vercel.app") || host.includes("thoranam"))) {
      return `${LIVE_BACKEND_URL.replace(/\/$/, "")}${src}`;
    }
  }
  return src;
}

export default {
  API_BASE_URL,
  getApiUrl,
  getAssetUrl,
};
