import { Product, syncDatabase } from "@/models";
import { INITIAL_PRODUCTS } from "@/lib/initial-products";
import { Op } from "sequelize";

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

      // Check if new initial items need seeding
      const existingTitles = new Set(products.map((p) => p.title));
      const missing = INITIAL_PRODUCTS.filter((item) => !existingTitles.has(item.title));
      if (missing.length > 0 && !query.search && !query.category) {
        for (const item of missing) {
          await Product.create({
            title: item.title,
            category: item.category,
            price: item.price,
            stock: item.stock,
            status: item.status,
            main_image: item.mainImage,
            gallery_images: item.galleryImages,
            description: item.description,
            highlights: item.highlights,
            closing_description: item.closingDescription,
            material: item.material,
            size: item.size,
            wash_care: item.washCare,
            is_featured: Boolean(item.isFeatured),
          });
        }
        products = await Product.findAll({ order: [["id", "DESC"]] });
      }

      return products.map((p) => formatProduct(p.toJSON()));
    } catch (dbErr) {
      console.warn("[Products] DB query error, falling back to INITIAL_PRODUCTS:", dbErr.message);
      let list = INITIAL_PRODUCTS.map((p) => ({ ...p, isFeatured: Boolean(p.isFeatured) }));
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
    }
  },

  // Get single product by ID
  async getProductById(id) {
    try {
      await syncDatabase();
      const product = await Product.findByPk(id);
      if (!product) return null;
      return formatProduct(product.toJSON());
    } catch (dbErr) {
      console.warn("[Products] DB getProductById error, fallback to initial items:", dbErr.message);
      const found = INITIAL_PRODUCTS.find((p) => String(p.id) === String(id));
      return found || null;
    }
  },

  // Create a new product
  async createProduct(data) {
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

    return formatProduct(created.toJSON());
  },

  // Update product by ID
  async updateProduct(id, data) {
    await syncDatabase();
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

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

    return formatProduct(product.toJSON());
  },

  // Delete product by ID
  async deleteProduct(id) {
    await syncDatabase();
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    await product.destroy();
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
