import { Promotion, syncDatabase } from "@/models";
import { withTimeout } from "@/lib/sequelize";

const defaultPromotions = [
  {
    id: "PROMO-1",
    code: "DIWALI20",
    discount_type: "percentage",
    discount_value: 20,
    min_order_value: 5000,
    max_discount: 2000,
    expiry_date: "2026-11-30",
    status: "Active",
  },
  {
    id: "PROMO-2",
    code: "FIRST10",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 2000,
    max_discount: 1000,
    expiry_date: "2026-12-31",
    status: "Active",
  },
  {
    id: "PROMO-3",
    code: "THORANAM500",
    discount_type: "flat",
    discount_value: 500,
    min_order_value: 4000,
    max_discount: 500,
    expiry_date: "2026-10-31",
    status: "Active",
  },
];

export const promotionController = {
  async getAllPromotions() {
    try {
      await syncDatabase();
      const promotions = await withTimeout(
        Promotion.findAll({ order: [["created_at", "DESC"]] }),
        4000
      );
      if (!promotions || promotions.length === 0) {
        // Auto-seed default promotions if empty
        try {
          await Promotion.bulkCreate(defaultPromotions, { ignoreDuplicates: true });
          const seeded = await Promotion.findAll({ order: [["created_at", "DESC"]] });
          return seeded.map((p) => p.toJSON());
        } catch (seedErr) {
          console.warn("[Promotions] Auto-seed note:", seedErr.message);
          return defaultPromotions;
        }
      }
      return promotions.map((p) => p.toJSON());
    } catch (dbErr) {
      console.warn("[Promotions] DB error, using default promotions:", dbErr.message);
      return defaultPromotions;
    }
  },

  async getPromotionById(id) {
    try {
      await syncDatabase();
      const promo = await Promotion.findByPk(id);
      return promo ? promo.toJSON() : null;
    } catch (e) {
      console.error("[Promotions] getPromotionById error:", e);
      return null;
    }
  },

  async getPromotionByCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    try {
      await syncDatabase();
      const promo = await Promotion.findOne({
        where: { code: cleanCode },
      });
      if (promo) return promo.toJSON();
    } catch (e) {
      console.error("[Promotions] getPromotionByCode error:", e);
    }
    // Fallback to in-memory defaults
    return (
      defaultPromotions.find(
        (p) => p.code.toUpperCase() === cleanCode
      ) || null
    );
  },

  async createPromotion(data) {
    await syncDatabase();
    const id = data.id || `PROMO-${Date.now()}`;
    const code = (data.code || "").trim().toUpperCase();

    if (!code) {
      throw new Error("Coupon code is required");
    }

    const discountVal = Number(data.discount_value);
    if (isNaN(discountVal) || discountVal <= 0) {
      throw new Error("Discount value must be greater than 0");
    }

    const created = await Promotion.create({
      id,
      code,
      discount_type: data.discount_type === "flat" ? "flat" : "percentage",
      discount_value: discountVal,
      min_order_value: Number(data.min_order_value) || 0,
      max_discount: data.max_discount ? Number(data.max_discount) : null,
      expiry_date: data.expiry_date || null,
      status: data.status || "Active",
    });
    return created.toJSON();
  },

  async updatePromotion(id, data) {
    await syncDatabase();
    const promo = await Promotion.findByPk(id);
    if (!promo) {
      throw new Error("Promotion not found");
    }

    const updates = {};
    if (data.code !== undefined) updates.code = data.code.trim().toUpperCase();
    if (data.discount_type !== undefined) {
      updates.discount_type = data.discount_type === "flat" ? "flat" : "percentage";
    }
    if (data.discount_value !== undefined) {
      updates.discount_value = Number(data.discount_value) || 0;
    }
    if (data.min_order_value !== undefined) {
      updates.min_order_value = Number(data.min_order_value) || 0;
    }
    if (data.max_discount !== undefined) {
      updates.max_discount = data.max_discount ? Number(data.max_discount) : null;
    }
    if (data.expiry_date !== undefined) {
      updates.expiry_date = data.expiry_date || null;
    }
    if (data.status !== undefined) {
      updates.status = data.status;
    }

    await promo.update(updates);
    return promo.toJSON();
  },

  async deletePromotion(id) {
    await syncDatabase();
    const promo = await Promotion.findByPk(id);
    if (!promo) {
      // Also attempt by code if ID was not matched
      const byCode = await Promotion.findOne({ where: { code: id } });
      if (byCode) {
        await byCode.destroy();
        return { success: true, id };
      }
      return { success: true, message: "Promotion already removed" };
    }
    await promo.destroy();
    return { success: true, id };
  },

  /**
   * Helper to validate a coupon against a cart subtotal
   */
  async validateCoupon(code, subtotal = 0) {
    const promo = await this.getPromotionByCode(code);
    if (!promo) {
      return {
        valid: false,
        message: `Coupon code "${code.toUpperCase()}" is not valid.`,
      };
    }

    if (promo.status !== "Active") {
      return {
        valid: false,
        message: `Coupon code "${promo.code}" is currently inactive.`,
      };
    }

    if (promo.expiry_date) {
      const today = new Date().toISOString().split("T")[0];
      if (promo.expiry_date < today) {
        return {
          valid: false,
          message: `Coupon code "${promo.code}" has expired on ${promo.expiry_date}.`,
        };
      }
    }

    const numSubtotal = Number(subtotal) || 0;
    const minOrder = Number(promo.min_order_value) || 0;
    if (minOrder > 0 && numSubtotal < minOrder) {
      return {
        valid: false,
        message: `Add ₹${(minOrder - numSubtotal).toLocaleString("en-IN")} more to use "${promo.code}". (Min order: ₹${minOrder.toLocaleString("en-IN")})`,
      };
    }

    // Calculate savings
    let discountAmount = 0;
    const val = Number(promo.discount_value) || 0;
    const maxBenefit = promo.max_discount ? Number(promo.max_discount) : null;

    if (promo.discount_type === "percentage") {
      discountAmount = (numSubtotal * val) / 100;
      if (maxBenefit && discountAmount > maxBenefit) {
        discountAmount = maxBenefit;
      }
    } else {
      discountAmount = Math.min(numSubtotal, val);
    }

    return {
      valid: true,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: val,
      discount_amount: Math.round(discountAmount * 100) / 100,
      min_order_value: minOrder,
      max_discount: maxBenefit,
      message:
        promo.discount_type === "percentage"
          ? `${val}% discount applied!`
          : `Flat ₹${val.toLocaleString("en-IN")} discount applied!`,
    };
  },
};

export default promotionController;
