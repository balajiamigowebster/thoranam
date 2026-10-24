import { Order, syncDatabase } from "@/models";

// In-memory orders store fallback when MySQL is disconnected or on serverless
let memoryOrders = [];

export const orderController = {
  async getAllOrders() {
    try {
      await syncDatabase();
      const orders = await Order.findAll({ order: [["created_at", "DESC"]] });
      if (orders && orders.length > 0) {
        const list = orders.map((o) => o.toJSON());
        const dbIds = new Set(list.map((o) => String(o.id)));
        const memOnly = memoryOrders.filter((o) => !dbIds.has(String(o.id)));
        return [...memOnly, ...list];
      }
    } catch (dbErr) {
      console.warn("[Orders] DB error or empty, returning resilient memory store:", dbErr.message);
    }
    return memoryOrders;
  },

  async createOrder(data) {
    const id = data.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id,
      customer_name: data.customer_name || data.customerName || "Boutique Customer",
      customer_email: data.customer_email || data.customerEmail || "",
      customer_phone: data.customer_phone || data.customerPhone || "",
      total_amount: data.total_amount || data.totalAmount || "₹ 0",
      items_count: Number(data.items_count || data.itemsCount) || 1,
      payment_status: data.payment_status || data.paymentStatus || "Paid",
      order_status: data.order_status || data.orderStatus || "New",
      shipping_address: data.shipping_address || data.shippingAddress || "",
      items_details: Array.isArray(data.items_details) ? data.items_details : (data.itemsDetails || []),
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await syncDatabase();
      const created = await Order.create(newOrder);
      const json = created.toJSON();
      memoryOrders.unshift(json);
      return json;
    } catch (err) {
      console.warn("[Orders] DB createOrder error, saving to memory fallback:", err.message);
      memoryOrders.unshift(newOrder);
      return newOrder;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      await syncDatabase();
      const order = await Order.findByPk(id);
      if (order) {
        await order.update({ order_status: status });
        const json = order.toJSON();
        const idx = memoryOrders.findIndex((o) => String(o.id) === String(id));
        if (idx >= 0) memoryOrders[idx] = json;
        return json;
      }
    } catch (err) {
      console.warn("[Orders] DB updateOrderStatus error, updating memory store:", err.message);
    }
    const idx = memoryOrders.findIndex((o) => String(o.id) === String(id));
    if (idx >= 0) {
      memoryOrders[idx].order_status = status;
      return memoryOrders[idx];
    }
    return { id, order_status: status };
  },
};

export default orderController;
