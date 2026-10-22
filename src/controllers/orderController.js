import { Order, syncDatabase } from "@/models";

export const orderController = {
  async getAllOrders() {
    try {
      await syncDatabase();
      const orders = await Order.findAll({ order: [["created_at", "DESC"]] });
      return orders.map((o) => o.toJSON());
    } catch (dbErr) {
      console.warn("[Orders] DB error or empty, returning empty list:", dbErr.message);
      return [];
    }
  },

  async createOrder(data) {
    await syncDatabase();
    const id = data.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = await Order.create({
      id,
      customer_name: data.customer_name || "Guest Customer",
      customer_email: data.customer_email || "",
      customer_phone: data.customer_phone || "",
      total_amount: data.total_amount || "₹ 0",
      items_count: Number(data.items_count) || 1,
      payment_status: data.payment_status || "Paid",
      order_status: data.order_status || "New",
      shipping_address: data.shipping_address || "",
      items_details: data.items_details || [],
    });
    return created.toJSON();
  },

  async updateOrderStatus(id, status) {
    await syncDatabase();
    const order = await Order.findByPk(id);
    if (!order) throw new Error("Order not found");
    await order.update({ order_status: status });
    return order.toJSON();
  },
};

export default orderController;
