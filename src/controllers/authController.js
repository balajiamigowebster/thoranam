import { AdminUser, syncDatabase } from "@/models";
import bcrypt from "bcryptjs";

export const authController = {
  // Returns currently configured admin credentials from environment (.env / .env.local)
  getEnvAdminCredentials() {
    return {
      userId: process.env.ADMIN_USER_ID || "admin",
      password: process.env.ADMIN_PASSWORD || "admin",
    };
  },

  // Synchronize the environment credentials into database table with bcrypt hash
  async seedAdminUserIfNeeded() {
    await syncDatabase();

    const { userId: envUserId, password: envPassword } = this.getEnvAdminCredentials();

    // Check if user with envUserId exists
    let user = await AdminUser.findOne({
      where: { user_id: envUserId },
    });

    if (!user) {
      // Check if any admin exists (for instance, if user changed ADMIN_USER_ID in .env)
      user = await AdminUser.findOne({ order: [["id", "ASC"]] });
    }

    if (!user) {
      // First time initialization
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(envPassword, salt);
      await AdminUser.create({
        user_id: envUserId,
        name: "Thoranam Administrator",
        password_hash: hash,
        role: "superadmin",
      });
      console.log(`[Auth] Seeded admin user (${envUserId}) from .env with bcrypt hash`);
    } else {
      // If user ID or password in .env has been changed, update it with new bcrypt hash
      const isPasswordSame = await bcrypt.compare(envPassword, user.password_hash);
      const isUserIdSame = user.user_id === envUserId;

      if (!isUserIdSame || !isPasswordSame) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(envPassword, salt);
        await user.update({
          user_id: envUserId,
          password_hash: hash,
        });
        console.log(`[Auth] Updated admin credentials for (${envUserId}) from .env with fresh bcrypt hash`);
      }
    }
  },

  // Verify credentials and update last login
  async verifyLogin(userId, password) {
    await this.seedAdminUserIfNeeded();

    const user = await AdminUser.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      return { success: false, message: "Invalid User ID or Password" };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return { success: false, message: "Invalid User ID or Password" };
    }

    // Update last_login
    await user.update({ last_login: new Date() });

    return {
      success: true,
      user: {
        id: user.id,
        userId: user.user_id,
        name: user.name,
        role: user.role,
        lastLogin: user.last_login,
      },
    };
  },
};

export default authController;
