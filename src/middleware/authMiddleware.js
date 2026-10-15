import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "thoranam_admin_token";
export const JWT_SECRET = process.env.JWT_SECRET || "thoranam_luxury_boutique_secure_admin_jwt_secret_key_2026";

/**
 * Parses and verifies basic token existence or expiration
 */
export function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr =
      typeof Buffer !== "undefined"
        ? Buffer.from(payloadB64, "base64").toString("utf-8")
        : atob(payloadB64);
    const decoded = JSON.parse(jsonStr);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

/**
 * Authentication Middleware for protected Admin routes
 */
export function authMiddleware(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const verified = verifyAdminToken(token);

  if (!verified) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default authMiddleware;
