import { Category, syncDatabase } from "@/models";
import { INITIAL_CATEGORIES } from "@/lib/categories";

export const categoryController = {
  async getAllCategories() {
    await syncDatabase();
    let categories = await Category.findAll({ order: [["created_at", "ASC"]] });

    if (categories.length === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await Category.create({
          id: cat.id,
          label: cat.label,
          href: cat.href,
          featured: Boolean(cat.featured),
          subcategories: cat.subcategories || [],
          showcase: cat.showcase || [],
        });
      }
      categories = await Category.findAll({ order: [["created_at", "ASC"]] });
    }

    return categories.map((c) => {
      const data = c.toJSON();
      return {
        id: data.id,
        label: data.label,
        href: data.href,
        featured: Boolean(data.featured),
        subcategories: typeof data.subcategories === "string" ? JSON.parse(data.subcategories || "[]") : (data.subcategories || []),
        showcase: typeof data.showcase === "string" ? JSON.parse(data.showcase || "[]") : (data.showcase || []),
      };
    });
  },

  async syncAllCategories(list) {
    await syncDatabase();
    await Category.destroy({ where: {}, truncate: true });
    for (const cat of list) {
      await Category.create({
        id: cat.id,
        label: cat.label,
        href: cat.href,
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
      featured: Boolean(data.featured),
      subcategories: data.subcategories || [],
      showcase: data.showcase || [],
    });
    return created.toJSON();
  },
};

export default categoryController;
