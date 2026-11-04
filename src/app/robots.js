export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/checkout",
          "/checkout/*",
          "/login",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

