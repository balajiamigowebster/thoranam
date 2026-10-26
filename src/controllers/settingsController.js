import { StoreSetting, syncDatabase } from "@/models";
import { withTimeout } from "@/lib/sequelize";

let settingsCache = null;
let settingsCacheExpiry = 0;

export const settingsController = {
  async getSettings() {
    const now = Date.now();
    if (settingsCache && now < settingsCacheExpiry) {
      return settingsCache;
    }

    try {
      const rows = await withTimeout(StoreSetting.findAll(), 3500, []);
      const settings = {};
      rows.forEach((r) => {
        const data = r.toJSON ? r.toJSON() : r;
        try {
          settings[data.setting_key] =
            typeof data.setting_value === "string"
              ? JSON.parse(data.setting_value)
              : data.setting_value;
        } catch {
          settings[data.setting_key] = data.setting_value;
        }
      });
      settingsCache = settings;
      settingsCacheExpiry = now + 60000; // 60s cache
      return settings;
    } catch (dbErr) {
      console.warn("[Settings] DB error, returning empty settings:", dbErr.message);
      return settingsCache || {};
    }
  },

  async updateSettings(settingsObject) {
    await syncDatabase();
    for (const [key, val] of Object.entries(settingsObject)) {
      const existing = await StoreSetting.findByPk(key);
      if (existing) {
        await existing.update({ setting_value: val });
      } else {
        await StoreSetting.create({
          setting_key: key,
          setting_value: val,
        });
      }
    }
    settingsCache = null;
    settingsCacheExpiry = 0;
    return { success: true };
  },
};

export default settingsController;
