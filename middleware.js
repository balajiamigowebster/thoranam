import { NextResponse } from "next/server";
import { authMiddleware } from "./src/middleware/authMiddleware";

const ALLOWED_ORIGINS = [
  "https://thoranam.co",
  "https://www.thoranam.co",
  "https://thoranam-olive.vercel.app",
  "http://localhost:3000",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle CORS for /api routes when requested from live frontend domains
  if (pathname.startsWith("/api")) {
    const isAllowed = origin && (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes(origin.replace(/\/$/, "")));
    
    // Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 200 });
      if (isAllowed) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
      }
      return response;
    }

    const response = NextResponse.next();
    if (isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
