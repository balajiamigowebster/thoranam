import { productController, categoryController } from "@/controllers";
import { getAllBlogs } from "@/lib/blogs";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";

  // Static core routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  let blogRoutes = [];
  try {
    const blogs = getAllBlogs();
    if (Array.isArray(blogs)) {
      blogRoutes = blogs.map((b) => ({
        url: `${baseUrl}/blogs/${b.slug}`,
        lastModified: b.publishedAt ? new Date(b.publishedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("Error generating sitemap blogs:", err);
  }

  let productRoutes = [];
  try {
    const products = await productController.getAllProducts();
    if (Array.isArray(products)) {
      productRoutes = products
        .filter((p) => p && p.id)
        .map((p) => ({
          url: `${baseUrl}/products/${p.id}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch (err) {
    console.error("Error generating sitemap products:", err);
  }

  let categoryRoutes = [];
  try {
    const categories = await categoryController.getAllCategories();
    if (Array.isArray(categories)) {
      categoryRoutes = categories
        .filter((c) => c && c.id)
        .map((c) => ({
          url: `${baseUrl}/products?cat=${encodeURIComponent(c.id)}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch (err) {
    console.error("Error generating sitemap categories:", err);
  }

  return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...productRoutes];
}

