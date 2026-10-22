import { StoreSetting, syncDatabase } from "@/models";

export const settingsController = {
  async getSettings() {
    try {
      await syncDatabase();
      const rows = await StoreSetting.findAll();
      const settings = {};
      rows.forEach((r) => {
        const data = r.toJSON();
        settings[data.setting_key] =
          typeof data.setting_value === "string"
            ? JSON.parse(data.setting_value)
            : data.setting_value;
      });
      return settings;
    } catch (dbErr) {
      console.warn("[Settings] DB error, returning empty settings:", dbErr.message);
      return {};
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
    return { success: true };
  },
};

export default settingsController;
