import { Wishlist, Customer, syncDatabase } from "@/models";
import { withTimeout } from "@/lib/sequelize";

export const wishlistController = {
  /**
   * Get all wishlist items for a customer by email
   */
  async getWishlist(customerEmail) {
    if (!customerEmail) return [];
    try {
      await syncDatabase();
      const items = await withTimeout(
        Wishlist.findAll({
          where: { customer_email: customerEmail.trim().toLowerCase() },
          order: [["created_at", "DESC"]],
        }),
        4000
      );
      return items.map((it) => it.toJSON());
    } catch (error) {
      console.error("[Wishlist] getWishlist error:", error);
      return [];
    }
  },

  /**
   * Add a product to customer's wishlist
   */
  async addToWishlist(customerEmail, product) {
    if (!customerEmail || !product || !product.id) {
      throw new Error("Customer email and product are required");
    }

    const email = customerEmail.trim().toLowerCase();
    const productId = String(product.id);

    try {
      await syncDatabase();

      // Find customer if exists
      const customer = await Customer.findOne({ where: { email } });

      const [item, created] = await Wishlist.findOrCreate({
        where: {
          customer_email: email,
          product_id: productId,
        },
        defaults: {
          customer_id: customer ? customer.id : null,
          customer_email: email,
          product_id: productId,
          product_title: product.title || "",
          product_price: String(product.price || ""),
          product_image: product.image || product.mainImage || "",
          product_category: product.category || "",
        },
      });

      return { success: true, created, item: item.toJSON() };
    } catch (error) {
      console.error("[Wishlist] addToWishlist error:", error);
      throw error;
    }
  },

  /**
   * Remove a product from customer's wishlist
   */
  async removeFromWishlist(customerEmail, productId) {
    if (!customerEmail || !productId) {
      throw new Error("Customer email and product ID are required");
    }

    const email = customerEmail.trim().toLowerCase();
    const pId = String(productId);

    try {
      await syncDatabase();
      const deleted = await Wishlist.destroy({
        where: {
          customer_email: email,
          product_id: pId,
        },
      });
      return { success: true, removedCount: deleted };
    } catch (error) {
      console.error("[Wishlist] removeFromWishlist error:", error);
      throw error;
    }
  },

  /**
   * Sync a batch of wishlist items (e.g., when a guest logs in)
   */
  async syncBatch(customerEmail, items = []) {
    if (!customerEmail || !Array.isArray(items)) {
      return { success: false, items: [] };
    }

    const email = customerEmail.trim().toLowerCase();
    try {
      await syncDatabase();
      const customer = await Customer.findOne({ where: { email } });

      for (const prod of items) {
        if (!prod || !prod.id) continue;
        const productId = String(prod.id);
        await Wishlist.findOrCreate({
          where: {
            customer_email: email,
            product_id: productId,
          },
          defaults: {
            customer_id: customer ? customer.id : null,
            customer_email: email,
            product_id: productId,
            product_title: prod.title || "",
            product_price: String(prod.price || ""),
            product_image: prod.image || prod.mainImage || "",
            product_category: prod.category || "",
          },
        });
      }

      // Return refreshed full wishlist
      const fullList = await this.getWishlist(email);
      return { success: true, items: fullList };
    } catch (error) {
      console.error("[Wishlist] syncBatch error:", error);
      return { success: false, error: error.message };
    }
  },
};

export default wishlistController;

