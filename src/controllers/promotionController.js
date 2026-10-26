import { Promotion, syncDatabase } from "@/models";
import { withTimeout } from "@/lib/sequelize";

export const promotionController = {
  async getAllPromotions() {
    try {
      const promotions = await withTimeout(
        Promotion.findAll({ order: [["created_at", "DESC"]] }),
        3500
      );
      return promotions.map((p) => p.toJSON());
    } catch (dbErr) {
      console.warn("[Promotions] DB error, returning sample promotions:", dbErr.message);
      return [
        { id: "PROMO-1", code: "DIWALI20", discount_type: "percentage", discount_value: 20, min_order_value: 5000, max_discount: 2000, expiry_date: "2026-11-30", status: "Active" },
        { id: "PROMO-2", code: "FIRST10", discount_type: "percentage", discount_value: 10, min_order_value: 2000, max_discount: 1000, expiry_date: "2026-12-31", status: "Active" },
        { id: "PROMO-3", code: "THORANAM500", discount_type: "flat", discount_value: 500, min_order_value: 4000, max_discount: 500, expiry_date: "2026-10-31", status: "Active" },
      ];
    }
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
