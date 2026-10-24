// Orders Data Layer
// Connects with MySQL backend API /api/orders with resilient offline fallback to localStorage

import { getApiUrl } from "@/config";

export function getLocalOrders() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("thoranam_orders");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading local orders:", e);
  }
  return [];
}

export function saveLocalOrders(orders, notify = true) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thoranam_orders", JSON.stringify(orders));
    if (notify) {
      window.dispatchEvent(new Event("thoranam_orders_updated"));
    }
  } catch (e) {
    console.error("Error saving local orders:", e);
  }
}

export async function fetchOrdersFromDb() {
  let apiOrders = [];
  try {
    const res = await fetch(getApiUrl("/api/orders"));
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        apiOrders = json.data;
      }
    }
  } catch (err) {
    console.warn("Could not fetch orders from API, falling back to local storage:", err.message);
  }

  const local = getLocalOrders();
  const apiIds = new Set(apiOrders.map((o) => String(o.id)));
  const localOnly = local.filter((o) => !apiIds.has(String(o.id)));
  const merged = [...localOnly, ...apiOrders];

  // Keep local storage synchronized
  if (merged.length > 0) {
    saveLocalOrders(merged, false);
  }
  return merged;
}

export async function saveOrderToDb(orderData) {
  const id = orderData.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const finalOrder = {
    ...orderData,
    id,
    created_at: orderData.created_at || new Date().toISOString(),
  };

  // 1. Immediately store in localStorage so it appears instantly on the dashboard
  const current = getLocalOrders();
  const exists = current.some((o) => String(o.id) === String(id));
  const updated = exists
    ? current.map((o) => (String(o.id) === String(id) ? { ...o, ...finalOrder } : o))
    : [finalOrder, ...current];
  saveLocalOrders(updated, true);

  // 2. Post to backend API
  try {
    const res = await fetch(getApiUrl("/api/orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalOrder),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn("Could not post order to API, saved locally:", err.message);
  }

  return finalOrder;
}
