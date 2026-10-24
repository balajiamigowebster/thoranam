import { Product, syncDatabase } from "@/models";
import { Op } from "sequelize";

// Controller for Product operations - STRICTLY CONNECTS ONLY TO MYSQL DATABASE
export const productController = {
  // Get all products directly from MySQL database with optional filters
  async getAllProducts(query = {}) {
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
      products = await Product.findAll({
        where,
        order: [["id", "ASC"]],
      });
    } catch (findErr) {
      console.warn("[Products DB] Table or query uninitialized, synchronizing schema:", findErr.message);
      await syncDatabase();
      products = await Product.findAll({
        where,
        order: [["id", "ASC"]],
      });
    }

    return (products || []).map((p) => formatProduct(p.toJSON()));
  },

  // Get single product by ID directly from MySQL
  async getProductById(id) {
    const product = await Product.findByPk(id);
    if (product) return formatProduct(product.toJSON());
    return null;
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

    return formatProduct(product.toJSON());
  },

  // Delete product by ID directly from MySQL database
  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (product) {
      await product.destroy();
    }
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
