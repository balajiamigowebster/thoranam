import { Product, syncDatabase } from "@/models";
import { INITIAL_PRODUCTS } from "@/lib/initial-products";
import { Op } from "sequelize";

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

const PHANTOM_IDS = new Set([
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

function isSeedProduct(p) {
  if (!p) return false;
  const idStr = String(p.id || "");
  if (PHANTOM_IDS.has(idStr) || idStr.startsWith("fancy-")) return true;
  const titleLow = (p.title || "").trim().toLowerCase();
  if (SEED_TITLES.has(titleLow)) return true;
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
  return false;
}

// Resilient in-memory store initialized clean (zero default products)
let memoryProducts = [];

// Controller for Product operations
export const productController = {
  // Get all products with optional filters
  async getAllProducts(query = {}) {
    try {
      await syncDatabase();
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

      let products = await Product.findAll({
        where,
        order: [["id", "DESC"]],
      });

      if (products && products.length > 0) {
        const formatted = products
          .map((p) => formatProduct(p.toJSON()))
          .filter((p) => !isSeedProduct(p));
        memoryProducts = formatted;
        return formatted;
      }
    } catch (dbErr) {
      console.warn("[Products] DB query error, using resilient memory store:", dbErr.message);
    }

    let list = memoryProducts.filter((p) => !isSeedProduct(p));
    if (query.category && query.category !== "all") {
      list = list.filter((p) => p.category?.toLowerCase() === query.category.toLowerCase());
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (p) => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  // Get single product by ID
  async getProductById(id) {
    try {
      await syncDatabase();
      const product = await Product.findByPk(id);
      if (product) return formatProduct(product.toJSON());
    } catch (dbErr) {
      console.warn("[Products] DB getProductById error, fallback to memory store:", dbErr.message);
    }
    const found = memoryProducts.find((p) => String(p.id) === String(id));
    return found || null;
  },

  // Create a new product
  async createProduct(data) {
    try {
      await syncDatabase();
      const created = await Product.create({
        title: data.title,
        category: data.category || "Silk Sarees",
        price: data.price || "₹ 0",
        stock: Number(data.stock) || 0,
        status: data.status || "Published",
        main_image: data.mainImage || "/images/product-1.jpg",
        gallery_images: Array.isArray(data.galleryImages) ? data.galleryImages : [],
        description: data.description || "",
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        closing_description: data.closingDescription || "",
        material: data.material || "",
        size: data.size || "",
        wash_care: data.washCare || "",
        seo_title: data.seoTitle || "",
        seo_description: data.seoDescription || "",
        seo_keywords: data.seoKeywords || "",
        og_image: data.ogImage || "",
        is_featured: Boolean(data.isFeatured),
      });

      const formatted = formatProduct(created.toJSON());
      memoryProducts.unshift(formatted);
      return formatted;
    } catch (err) {
      console.warn("[Products] DB createProduct fallback to memory store:", err.message);
      const newProduct = {
        ...data,
        id: data.id || Date.now(),
        isFeatured: Boolean(data.isFeatured),
        galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
      };
      memoryProducts.unshift(newProduct);
      return newProduct;
    }
  },

  // Update product by ID
  async updateProduct(id, data) {
    let updatedObj = null;
    try {
      await syncDatabase();
      const product = await Product.findByPk(id);
      if (product) {
        await product.update({
          title: data.title !== undefined ? data.title : product.title,
          category: data.category !== undefined ? data.category : product.category,
          price: data.price !== undefined ? data.price : product.price,
          stock: data.stock !== undefined ? Number(data.stock) : product.stock,
          status: data.status !== undefined ? data.status : product.status,
          main_image: data.mainImage !== undefined ? data.mainImage : product.main_image,
          gallery_images: data.galleryImages !== undefined ? data.galleryImages : product.gallery_images,
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
        updatedObj = formatProduct(product.toJSON());
      }
    } catch (err) {
      console.warn("[Products] DB updateProduct fallback to memory store:", err.message);
    }

    // Always keep memory store in sync
    const idx = memoryProducts.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) {
      memoryProducts[idx] = {
        ...memoryProducts[idx],
        ...data,
        id: memoryProducts[idx].id,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : memoryProducts[idx].isFeatured,
      };
      if (!updatedObj) updatedObj = memoryProducts[idx];
    } else if (!updatedObj) {
      updatedObj = { ...data, id, isFeatured: Boolean(data.isFeatured) };
      memoryProducts.unshift(updatedObj);
    }

    return updatedObj;
  },

  // Delete product by ID
  async deleteProduct(id) {
    try {
      await syncDatabase();
      const product = await Product.findByPk(id);
      if (product) {
        await product.destroy();
      }
    } catch (err) {
      console.warn("[Products] DB deleteProduct fallback to memory store:", err.message);
    }
    memoryProducts = memoryProducts.filter((p) => String(p.id) !== String(id));
    return { success: true, message: "Product deleted successfully" };
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
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    price: r.price,
    stock: r.stock,
    status: r.status,
    mainImage: r.main_image || "/images/product-1.jpg",
    galleryImages: safeJsonParse(r.gallery_images, []),
    description: r.description || "",
    highlights: safeJsonParse(r.highlights, []),
    closingDescription: r.closing_description || "",
    material: r.material || "",
    size: r.size || "",
    washCare: r.wash_care || "",
    seoTitle: r.seo_title || "",
    seoDescription: r.seo_description || "",
    seoKeywords: r.seo_keywords || "",
    ogImage: r.og_image || "",
    isFeatured: Boolean(r.is_featured),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export default productController;
