import { StoreSetting, syncDatabase } from "@/models";
import { withTimeout } from "@/lib/sequelize";
import { unstable_cache, revalidateTag } from "next/cache";

let settingsCache = null;
let settingsCacheExpiry = 0;

const getCachedDbSettings = unstable_cache(
  async () => {
    try {
      const rows = await withTimeout(StoreSetting.findAll(), 6000, []);
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
      return settings;
    } catch (e) {
      return {};
    }
  },
  ["thoranam-db-settings-global-v1"],
  {
    revalidate: 300,
    tags: ["settings"],
  }
);

export const settingsController = {
  async getSettings() {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    if (settingsCache && now < settingsCacheExpiry) {
      return settingsCache;
    }

    try {
      const cached = await getCachedDbSettings();
      if (cached && Object.keys(cached).length > 0) {
        settingsCache = cached;
        settingsCacheExpiry = now + 60000;
        return cached;
      }
    } catch (e) {}

    return settingsCache || {};
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
    try {
      revalidateTag("settings");
    } catch (e) {}
    return { success: true };
  },
};

export default settingsController;
