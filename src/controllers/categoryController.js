import { Category, StoreSetting, syncDatabase } from "@/models";
import { INITIAL_CATEGORIES, HOMEPAGE_BROWSE_CATEGORIES } from "@/lib/categories";
import { withTimeout } from "@/lib/sequelize";
import { unstable_cache, revalidateTag } from "next/cache";

// In-memory caching for category queries to prevent repetitive DB connections
let categoriesCache = null;
let categoriesCacheExpiry = 0;
let browseCategoriesCache = null;
let browseCategoriesCacheExpiry = 0;

export function invalidateCategoriesCache() {
  categoriesCache = null;
  categoriesCacheExpiry = 0;
  browseCategoriesCache = null;
  browseCategoriesCacheExpiry = 0;
  try {
    revalidateTag("categories");
  } catch (e) {}
}

const FALLBACK_CATEGORIES = INITIAL_CATEGORIES.map((c, idx) => ({
  id: c.id,
  label: c.label || c.name,
  href: c.href,
  image: c.image || "",
  sort_order: c.sort_order ?? idx,
  featured: Boolean(c.featured),
  subcategories: c.subcategories || [],
  showcase: c.showcase || [],
}));

const getCachedBrowseCategories = unstable_cache(
  async () => {
    let browseList = [];
    try {
      const setting = await withTimeout(
        StoreSetting.findByPk("homepage_browse_categories"),
        6000
      );
      if (setting && setting.setting_value) {
        let val = setting.setting_value;
        if (typeof val === "string") {
          try { val = JSON.parse(val); } catch { val = null; }
        }
        if (typeof val === "string") {
          try { val = JSON.parse(val); } catch {}
        }
        if (Array.isArray(val) && val.length > 0) {
          browseList = val;
        }
      }
    } catch (e) {}

    if (!Array.isArray(browseList) || browseList.length === 0) {
      browseList = [...HOMEPAGE_BROWSE_CATEGORIES];
    }

    // Note: Do NOT automatically merge full DB categories into the Homepage "Browse Our Categories" section.
    // As per design, the homepage circular section only displays the curated 8 categories.
    // All custom/DB categories will show inside the "Thoranam Collection" menu and their product collections.

    return browseList;
  },
  ["thoranam-db-browse-categories-curated-v3"],
  {
    revalidate: 60,
    tags: ["categories"],
  }
);

export const categoryController = {
  async getAllCategories() {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    if (categoriesCache && now < categoriesCacheExpiry) {
      return categoriesCache;
    }

    try {
      const categories = await withTimeout(
        Category.findAll({
          order: [
            ["sort_order", "ASC"],
            ["created_at", "ASC"],
          ],
        }),
        3500
      );

      if (categories && categories.length > 0) {
        const formatted = categories.map((c) => {
          const safeParse = (v) => {
            if (typeof v !== "string") return v || [];
            try { return JSON.parse(v || "[]"); } catch { return []; }
          };
          const item = c.toJSON ? c.toJSON() : c;
          return {
            id: item.id,
            label: item.label,
            href: item.href,
            image: item.image || "",
            sort_order: item.sort_order || 0,
            featured: Boolean(item.featured),
            subcategories: safeParse(item.subcategories),
            showcase: safeParse(item.showcase),
          };
        });

        categoriesCache = formatted;
        categoriesCacheExpiry = now + 60000; // 60s cache
        return formatted;
      }

      // If DB has 0 categories, initialize with default list
      let idx = 0;
      for (const cat of INITIAL_CATEGORIES) {
        try {
          await Category.create({
            id: cat.id,
            label: cat.label,
            href: cat.href,
            image: cat.image || "",
            sort_order: cat.sort_order ?? idx++,
            featured: Boolean(cat.featured),
            subcategories: cat.subcategories || [],
            showcase: cat.showcase || [],
          });
        } catch (seedErr) {}
      }

      categoriesCache = FALLBACK_CATEGORIES;
      categoriesCacheExpiry = now + 60000;
      return FALLBACK_CATEGORIES;
    } catch (dbErr) {
      console.warn("[Categories] DB unreachable/timeout, returning cached or defaults:", dbErr.message);
      return categoriesCache || FALLBACK_CATEGORIES;
    }
  },

  async syncAllCategories(list) {
    try {
      await syncDatabase();
      await Category.destroy({ where: {}, truncate: true });
      let idx = 0;
      for (const cat of list) {
        await Category.create({
          id: cat.id,
          label: cat.label,
          href: cat.href,
          image: cat.image || "",
          sort_order: cat.sort_order ?? idx++,
          featured: Boolean(cat.featured),
          subcategories: cat.subcategories || [],
          showcase: cat.showcase || [],
        });
      }
      invalidateCategoriesCache();
      return { success: true };
    } catch (e) {
      console.warn("[Categories] Database sync warning:", e.message);
      invalidateCategoriesCache();
      return { success: true, warning: e.message };
    }
  },

  async createCategory(data) {
    await syncDatabase();
    const created = await Category.create({
      id: data.id,
      label: data.label,
      href: data.href,
      image: data.image || "",
      sort_order: data.sort_order ?? 0,
      featured: Boolean(data.featured),
      subcategories: data.subcategories || [],
      showcase: data.showcase || [],
    });
    invalidateCategoriesCache();
    return created.toJSON();
  },

  async updateCategory(id, data) {
    await syncDatabase();
    const cat = await Category.findByPk(id);
    if (!cat) throw new Error("Category not found");
    await cat.update(data);
    invalidateCategoriesCache();
    return cat.toJSON();
  },

  async deleteCategory(id) {
    await syncDatabase();
    const cat = await Category.findByPk(id);
    if (!cat) throw new Error("Category not found");
    await cat.destroy();
    invalidateCategoriesCache();
    return { success: true };
  },

  async getBrowseCategories() {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    if (browseCategoriesCache && now < browseCategoriesCacheExpiry) {
      return browseCategoriesCache;
    }

    try {
      const cached = await getCachedBrowseCategories();
      if (Array.isArray(cached) && cached.length > 0) {
        browseCategoriesCache = cached;
        browseCategoriesCacheExpiry = now + 60000;
        return cached;
      }
    } catch (e) {}

    return browseCategoriesCache || HOMEPAGE_BROWSE_CATEGORIES;
  },

  async syncBrowseCategories(list) {
    try {
      const stringified = typeof list === "string" ? list : JSON.stringify(list);
      const existing = await StoreSetting.findByPk("homepage_browse_categories");
      if (existing) {
        await existing.update({ setting_value: stringified });
      } else {
        await StoreSetting.create({
          setting_key: "homepage_browse_categories",
          setting_value: stringified,
        });
      }
      browseCategoriesCache = list;
      browseCategoriesCacheExpiry = (typeof performance !== "undefined" ? performance.now() : 0) + 60000;
      return { success: true };
    } catch (e) {
      console.warn("[BrowseCategories] Database sync error:", e);
      return { success: false, error: e.message };
    }
  },
};

export default categoryController;
