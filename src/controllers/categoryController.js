import { Category, syncDatabase } from "@/models";
import { INITIAL_CATEGORIES, HOMEPAGE_BROWSE_CATEGORIES } from "@/lib/categories";

export const categoryController = {
  async getAllCategories() {
    try {
      await syncDatabase();
      let categories = await Category.findAll({
        order: [
          ["sort_order", "ASC"],
          ["created_at", "ASC"],
        ],
      });

      if (categories.length === 0) {
        let idx = 0;
        for (const cat of INITIAL_CATEGORIES) {
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
        categories = await Category.findAll({
          order: [
            ["sort_order", "ASC"],
            ["created_at", "ASC"],
          ],
        });
      }

      return categories.map((c) => {
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
    } catch (dbErr) {
      console.warn("[Categories] Database unreachable, falling back to INITIAL_CATEGORIES:", dbErr.message);
      return INITIAL_CATEGORIES.map((c, idx) => ({
        id: c.id,
        label: c.label || c.name,
        href: c.href,
        image: c.image || "",
        sort_order: c.sort_order ?? idx,
        featured: Boolean(c.featured),
        subcategories: c.subcategories || [],
        showcase: c.showcase || [],
      }));
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
      return { success: true };
    } catch (e) {
      console.warn("[Categories] Database sync warning (falling back to storage):", e.message);
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
    return created.toJSON();
  },

  async updateCategory(id, data) {
    await syncDatabase();
    const cat = await Category.findByPk(id);
    if (!cat) throw new Error("Category not found");
    await cat.update(data);
    return cat.toJSON();
  },

  async deleteCategory(id) {
    await syncDatabase();
    const cat = await Category.findByPk(id);
    if (!cat) throw new Error("Category not found");
    await cat.destroy();
    return { success: true };
  },

  async getBrowseCategories() {
    try {
      const { StoreSetting } = await syncDatabase();
      const setting = await StoreSetting.findByPk("homepage_browse_categories");
      if (setting && setting.setting_value) {
        let val = setting.setting_value;
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {
            val = null;
          }
        }
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {}
        }
        if (Array.isArray(val) && val.length > 0) return val;
      }
    } catch (e) {
      console.warn("[BrowseCategories] Error getting browse categories from DB:", e.message);
    }
    return HOMEPAGE_BROWSE_CATEGORIES;
  },

  async syncBrowseCategories(list) {
    try {
      const { StoreSetting } = await syncDatabase();
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
      return { success: true };
    } catch (e) {
      console.warn("[BrowseCategories] Database sync error:", e);
      return { success: false, error: e.message };
    }
  },
};

export default categoryController;
