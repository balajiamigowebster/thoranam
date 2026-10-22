import { Category, syncDatabase } from "@/models";
import { INITIAL_CATEGORIES } from "@/lib/categories";

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
        const data = c.toJSON();
        return {
          id: data.id,
          label: data.label,
          href: data.href,
          image: data.image || "",
          sort_order: data.sort_order || 0,
          featured: Boolean(data.featured),
          subcategories: typeof data.subcategories === "string" ? JSON.parse(data.subcategories || "[]") : (data.subcategories || []),
          showcase: typeof data.showcase === "string" ? JSON.parse(data.showcase || "[]") : (data.showcase || []),
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
};

export default categoryController;
