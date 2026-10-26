import { Product, syncDatabase } from "@/models";
import { Op } from "sequelize";
import { unstable_cache, revalidateTag } from "next/cache";

// In-memory cache for ultra-fast product retrieval without hitting MySQL on every request
let productsCache = {
  data: null,
  timestamp: 0,
  singleMap: new Map(), // string id -> { data, timestamp }
};

const CACHE_TTL_MS = 5 * 1000; // 5 seconds TTL

export function invalidateProductsCache() {
  productsCache.data = null;
  productsCache.timestamp = 0;
  productsCache.singleMap.clear();
  try {
    revalidateTag("products");
  } catch (e) {}
}

// Helper to ensure database queries never hang the serverless runtime or client indefinitely
async function withTimeout(promise, ms = 4500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Database query timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Global Next.js Data Cache for products across Vercel serverless lambdas
const getCachedDbProducts = unstable_cache(
  async () => {
    try {
      const products = await withTimeout(
        Product.findAll({
          order: [["id", "ASC"]],
        }),
        6000
      );
      return (products || []).map((p) => formatProduct(p.toJSON()));
    } catch (e) {
      console.warn("[Products DB] Data cache fetch err:", e.message);
      return [];
    }
  },
  ["thoranam-db-products-global-v1"],
  {
    revalidate: 5,
    tags: ["products"],
  }
);

// Controller for Product operations - STRICTLY CONNECTS ONLY TO MYSQL DATABASE
export const productController = {
  // Get all products directly from MySQL database with optional filters
  async getAllProducts(query = {}) {
    const isUnfiltered = (!query.category || query.category === "all") && !query.search;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();

    // 1. Serve from in-memory RAM cache if available and fresh
    if (isUnfiltered && productsCache.data && now - productsCache.timestamp < CACHE_TTL_MS) {
      return productsCache.data;
    }

    // 2. If unfiltered, query Next.js Data Cache (persists across Vercel Lambdas)
    if (isUnfiltered) {
      try {
        const cached = await getCachedDbProducts();
        if (Array.isArray(cached) && cached.length > 0) {
          productsCache.data = cached;
          productsCache.timestamp = now;
          cached.forEach((item) => {
            productsCache.singleMap.set(String(item.id), { data: item, timestamp: now });
          });
          return cached;
        }
      } catch (cacheErr) {
        console.warn("[Products] Data cache miss:", cacheErr.message);
      }
    }

    const where = {};
    if (query.category && query.category !== "all") {
      where.category = query.category;
    }
    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { category: { [Op.like]: `%${query.search}%` } },
      ];
    }

    let products;
    try {
      products = await withTimeout(
        Product.findAll({
          where,
          order: [["id", "ASC"]],
        }),
        4500
      );
    } catch (findErr) {
      console.warn("[Products DB] Query failed or timed out:", findErr.message);
      if (productsCache.data && productsCache.data.length > 0) {
        return productsCache.data;
      }
      return [];
    }

    const formatted = (products || []).map((p) => formatProduct(p.toJSON()));

    if (isUnfiltered && formatted.length > 0) {
      productsCache.data = formatted;
      productsCache.timestamp = now;
      // Also prime individual product cache map
      formatted.forEach((item) => {
        productsCache.singleMap.set(String(item.id), { data: item, timestamp: now });
      });
    }

    return formatted;
  },

  // Get single product by ID directly from MySQL with in-memory cache
  async getProductById(id) {
    if (!id) return null;
    const key = String(id);
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const cached = productsCache.singleMap.get(key);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const product = await withTimeout(Product.findByPk(id), 4500);
      if (product) {
        const formatted = formatProduct(product.toJSON());
        productsCache.singleMap.set(key, { data: formatted, timestamp: now });
        return formatted;
      }
    } catch (e) {
      console.warn("[Products DB] getProductById timed out or failed:", e.message);
    }

    // Try finding by slug from cache if available
    if (productsCache.data) {
      const match = productsCache.data.find(
        (p) =>
          String(p.id) === key ||
          p.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === key.toLowerCase()
      );
      if (match) return match;
    }

    return null;
  },

  // Invalidate cache method
  invalidateCache() {
    invalidateProductsCache();
  },

  // Create a new product directly in MySQL database
  async createProduct(data) {
    const gallery = Array.isArray(data.galleryImages)
      ? data.galleryImages
      : typeof data.galleryImages === "string"
      ? safeJsonParse(data.galleryImages, [])
      : [];
    
    let mainImg = data.mainImage;
    if (!mainImg || typeof mainImg !== "string" || mainImg.trim() === "") {
      mainImg = gallery[0] || "/images/product-1.jpg";
    }

    try {
      const created = await Product.create({
        title: data.title,
        category: data.category || "Silk Sarees",
        price: data.price || "₹ 0",
        stock: Number(data.stock) || 0,
        status: data.status || "Published",
        main_image: mainImg,
        gallery_images: JSON.stringify(gallery),
        description: data.description || "",
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        closing_description: data.closingDescription || "",
        material: data.material || "",
        size: data.size || "",
        wash_care: data.washCare || "",
        seo_title: data.seoTitle || "",
        seo_description: data.seoDescription || "",
        seo_keywords: data.seoKeywords || "",
        og_image: data.ogImage || mainImg,
        is_featured: Boolean(data.isFeatured),
      });

      invalidateProductsCache();
      return formatProduct(created.toJSON());
    } catch (createErr) {
      console.warn("[Products DB] Direct create failed, attempting single sync fallback:", createErr.message);
      await syncDatabase();
      const created = await Product.create({
        title: data.title,
        category: data.category || "Silk Sarees",
        price: data.price || "₹ 0",
        stock: Number(data.stock) || 0,
        status: data.status || "Published",
        main_image: mainImg,
        gallery_images: JSON.stringify(gallery),
        description: data.description || "",
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        closing_description: data.closingDescription || "",
        material: data.material || "",
        size: data.size || "",
        wash_care: data.washCare || "",
        seo_title: data.seoTitle || "",
        seo_description: data.seoDescription || "",
        seo_keywords: data.seoKeywords || "",
        og_image: data.ogImage || mainImg,
        is_featured: Boolean(data.isFeatured),
      });

      invalidateProductsCache();
      return formatProduct(created.toJSON());
    }
  },

  // Update product by ID directly in MySQL database
  async updateProduct(id, data) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found in database`);
    }

    const galleryVal =
      data.galleryImages !== undefined
        ? (Array.isArray(data.galleryImages) ? JSON.stringify(data.galleryImages) : data.galleryImages)
        : product.gallery_images;

    await product.update({
      title: data.title !== undefined ? data.title : product.title,
      category: data.category !== undefined ? data.category : product.category,
      price: data.price !== undefined ? data.price : product.price,
      stock: data.stock !== undefined ? Number(data.stock) : product.stock,
      status: data.status !== undefined ? data.status : product.status,
      main_image: data.mainImage !== undefined ? data.mainImage : product.main_image,
      gallery_images: galleryVal,
      description: data.description !== undefined ? data.description : product.description,
      highlights: data.highlights !== undefined ? data.highlights : product.highlights,
      closing_description: data.closingDescription !== undefined ? data.closingDescription : product.closing_description,
      material: data.material !== undefined ? data.material : product.material,
      size: data.size !== undefined ? data.size : product.size,
      wash_care: data.washCare !== undefined ? data.washCare : product.wash_care,
      seo_title: data.seoTitle !== undefined ? data.seoTitle : product.seo_title,
      seo_description: data.seoDescription !== undefined ? data.seoDescription : product.seo_description,
      seo_keywords: data.seoKeywords !== undefined ? data.seoKeywords : product.seo_keywords,
      og_image: data.ogImage !== undefined ? data.ogImage : product.og_image,
      is_featured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : product.is_featured,
    });

    invalidateProductsCache();
    return formatProduct(product.toJSON());
  },

  // Delete product by ID directly from MySQL database
  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (product) {
      await product.destroy();
    }
    invalidateProductsCache();
    return { success: true, message: "Product deleted from database" };
  },
};

function safeJsonParse(val, fallback = []) {
  if (typeof val !== "string") return val || fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// Formatter to match frontend props
function formatProduct(r) {
  const gallery = safeJsonParse(r.gallery_images, []);
  let main = r.main_image;
  // If main_image is missing, empty, or truncated corrupt 64KB base64
  if (!main || typeof main !== "string" || main.trim() === "" || (main.startsWith("data:image") && main.length === 65535)) {
    main = (gallery && gallery[0] && gallery[0].length !== 65535) ? gallery[0] : "/images/product-1.jpg";
  }

  return {
    id: r.id,
    title: r.title,
    category: r.category,
    price: r.price,
    stock: r.stock,
    status: r.status,
    mainImage: main,
    galleryImages: gallery,
    description: r.description || "",
    highlights: safeJsonParse(r.highlights, []),
    closingDescription: r.closing_description || "",
    material: r.material || "",
    size: r.size || "",
    washCare: r.wash_care || "",
    seoTitle: r.seo_title || "",
    seoDescription: r.seo_description || "",
    seoKeywords: r.seo_keywords || "",
    ogImage: r.og_image || main,
    isFeatured: Boolean(r.is_featured),
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

export default productController;
