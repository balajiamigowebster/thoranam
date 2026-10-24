import { Product, syncDatabase } from "@/models";
import { Op } from "sequelize";

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
        order: [["id", "ASC"]],
      });

      if (products) {
        const formatted = products.map((p) => formatProduct(p.toJSON()));
        memoryProducts = formatted;
        return formatted;
      }
    } catch (dbErr) {
      console.warn("[Products] DB query error, using resilient memory store:", dbErr.message);
    }

    let list = [...memoryProducts];
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
      memoryProducts.push(formatted);
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
      memoryProducts.push(newProduct);
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
      memoryProducts.push(updatedObj);
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
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

export default productController;
