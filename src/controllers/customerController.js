import { Customer, syncDatabase } from "@/models";

export const customerController = {
  async getAllCustomers() {
    await syncDatabase();
    const customers = await Customer.findAll({ order: [["created_at", "DESC"]] });
    return customers.map((c) => c.toJSON());
  },

  async createCustomer(data) {
    await syncDatabase();
    const created = await Customer.create({
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      total_orders: Number(data.total_orders) || 0,
      total_spent: data.total_spent || "₹ 0",
      status: data.status || "Active",
    });
    return created.toJSON();
  },
};

export default customerController;
