import { Customer, syncDatabase } from "@/models";
import { withTimeout } from "@/lib/sequelize";
import bcrypt from "bcryptjs";

export const customerController = {
  async getAllCustomers() {
    try {
      const customers = await withTimeout(
        Customer.findAll({ order: [["created_at", "DESC"]] }),
        3500,
        []
      );
      return (customers || []).map((c) => (c.toJSON ? c.toJSON() : c));
    } catch (dbErr) {
      console.warn("[Customers] DB error or empty, returning empty list:", dbErr.message);
      return [];
    }
  },

  async createCustomer(data) {
    await syncDatabase();
    const created = await Customer.create({
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      password_hash: data.password_hash || null,
      auth_provider: data.auth_provider || "email",
      total_orders: Number(data.total_orders) || 0,
      total_spent: data.total_spent || "₹ 0",
      status: data.status || "Active",
    });
    return created.toJSON();
  },

  async registerCustomer({ name, email, password, phone }) {
    await syncDatabase();
    const trimmedEmail = email.trim().toLowerCase();
    
    const existing = await Customer.findOne({ where: { email: trimmedEmail } });
    if (existing) {
      throw new Error("An account with this email already exists. Please sign in.");
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const created = await Customer.create({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone ? phone.trim() : "",
      password_hash,
      auth_provider: "email",
      status: "Active",
    });

    const user = created.toJSON();
    delete user.password_hash;
    return user;
  },

  async loginCustomer({ email, password }) {
    await syncDatabase();
    const trimmedEmail = email.trim().toLowerCase();

    const customer = await Customer.findOne({ where: { email: trimmedEmail } });
    if (!customer) {
      throw new Error("No customer account found with this email.");
    }

    if (!customer.password_hash) {
      throw new Error("This account was created via social login. Please continue with Google.");
    }

    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      throw new Error("Invalid password. Please check and try again.");
    }

    const user = customer.toJSON();
    delete user.password_hash;
    return user;
  },

  async loginWithGoogle({ email, name, googleId }) {
    const trimmedEmail = email.trim().toLowerCase();
    const fallbackUser = {
      id: googleId || `google_${Date.now()}`,
      name: name || trimmedEmail.split("@")[0],
      email: trimmedEmail,
      auth_provider: "google",
      status: "Active",
      total_orders: 0,
      total_spent: "₹ 0",
    };

    try {
      await syncDatabase();
      let customer = await Customer.findOne({ where: { email: trimmedEmail } });
      if (!customer) {
        customer = await Customer.create({
          name: name || trimmedEmail.split("@")[0],
          email: trimmedEmail,
          auth_provider: "google",
          status: "Active",
        });
      }

      const user = customer.toJSON();
      delete user.password_hash;
      return user;
    } catch (dbErr) {
      console.warn("Database connection unavailable, authenticating Google user in session:", dbErr.message);
      // Return verified Google identity so user is successfully signed in
      return fallbackUser;
    }
  },
};

export default customerController;

