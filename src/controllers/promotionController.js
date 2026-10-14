import { Promotion, syncDatabase } from "@/models";

export const promotionController = {
  async getAllPromotions() {
    await syncDatabase();
    const promotions = await Promotion.findAll({ order: [["created_at", "DESC"]] });
    return promotions.map((p) => p.toJSON());
  },

  async createPromotion(data) {
    await syncDatabase();
    const id = data.id || `PROMO-${Date.now()}`;
    const created = await Promotion.create({
      id,
      code: data.code,
      discount_type: data.discount_type || "percentage",
      discount_value: data.discount_value,
      min_order_value: data.min_order_value || 0,
      max_discount: data.max_discount || null,
      expiry_date: data.expiry_date || null,
      status: data.status || "Active",
    });
    return created.toJSON();
  },
};

export default promotionController;
