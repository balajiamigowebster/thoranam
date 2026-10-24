"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { getApiUrl } from "@/config";
import { INITIAL_PRODUCTS } from "@/lib/initial-products";
import { getStoredProducts, fetchProductsFromDb } from "@/lib/products";
import { getLocalOrders, fetchOrdersFromDb } from "@/lib/orders";

export default function DashboardOverview({ setActiveTab }) {
  const [products, setProducts] = useState(getStoredProducts);
  const [orders, setOrders] = useState(getLocalOrders);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [pData, oData] = await Promise.all([
        fetchProductsFromDb(),
        fetchOrdersFromDb(),
      ]);
      if (Array.isArray(pData) && pData.length > 0) setProducts(pData);
      if (Array.isArray(oData)) setOrders(oData);

      const cRes = await fetch(getApiUrl("/api/customers"));
      const cJson = await cRes.json();
      if (cJson.success && Array.isArray(cJson.data)) {
        setCustomers(cJson.data);
      }
    } catch (err) {
      console.warn("Could not load full dashboard metrics from API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [pData, oData] = await Promise.all([
          fetchProductsFromDb(),
          fetchOrdersFromDb(),
        ]);
        if (!ignore) {
          if (Array.isArray(pData) && pData.length > 0) setProducts(pData);
          if (Array.isArray(oData)) setOrders(oData);
        }

        const cRes = await fetch(getApiUrl("/api/customers"));
        const cJson = await cRes.json();
        if (!ignore && cJson.success && Array.isArray(cJson.data)) {
          setCustomers(cJson.data);
        }
      } catch (err) {
        console.warn("Could not load full dashboard metrics:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();

    const handleSync = () => {
      if (!ignore) {
        setProducts(getStoredProducts());
        setOrders(getLocalOrders());
      }
    };

    window.addEventListener("thoranam_orders_updated", handleSync);
    window.addEventListener("thoranam_products_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      ignore = true;
      window.removeEventListener("thoranam_orders_updated", handleSync);
      window.removeEventListener("thoranam_products_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Compute Live Metrics from real loaded data
  const totalStockCount = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter((p) => (Number(p.stock) || 0) <= 5).length;

  const totalOrdersCount = orders.length;
  const newOrdersCount = orders.filter((o) => (o.order_status || "").toLowerCase() === "new").length;

  const totalRegisteredClients =
    customers.length > 0
      ? customers.length
      : new Set(
          orders
            .map((o) => (o.customer_email || o.customer_name || "").trim().toLowerCase())
            .filter((c) => c && !c.includes("guest"))
        ).size;

  // Calculate live revenue from orders if available
  const revenueTotalNumber = orders.reduce((acc, o) => {
    const numeric = Number(String(o.total_amount || "").replace(/[^0-9.]/g, "")) || 0;
    return acc + numeric;
  }, 0);

  const displayRevenue = `₹ ${revenueTotalNumber.toLocaleString("en-IN")}`;

  const stats = [
    {
      title: "Total Sales Revenue",
      value: displayRevenue,
      change: orders.length > 0 ? "+100%" : "₹ 0",
      isPositive: revenueTotalNumber > 0,
      subtitle: "Lifetime revenue",
      icon: CreditCard,
    },
    {
      title: "Orders Placed",
      value: String(totalOrdersCount),
      change: orders.length > 0 ? `${orders.length} orders` : "0 orders",
      isPositive: totalOrdersCount > 0,
      subtitle: `${newOrdersCount} pending dispatch`,
      icon: ShoppingBag,
    },
    {
      title: "Active Saree Inventory",
      value: String(totalStockCount),
      change: `${products.length} saree models`,
      isPositive: lowStockCount === 0,
      subtitle: `${lowStockCount} items in low stock`,
      icon: Package,
    },
    {
      title: "Registered Customers",
      value: String(totalRegisteredClients),
      change: customers.length > 0 ? `${customers.length} users` : "0 users",
      isPositive: totalRegisteredClients > 0,
      subtitle: "Verified boutique accounts",
      icon: Users,
    },
  ];

  const formatCurrency = (val) => {
    if (!val) return "₹ 0";
    const cleaned = String(val).replace(/^[?Rs.\s]+/, "").trim();
    if (!cleaned) return "₹ 0";
    return `₹ ${cleaned}`;
  };

  // Map recent orders
  const displayOrders = orders.slice(0, 5).map((o) => {
    let details = o.items_details;
    if (typeof details === "string") {
      try { details = JSON.parse(details); } catch { details = []; }
    }
    const firstTitle = Array.isArray(details) && details.length > 0 ? details[0]?.title : null;
    return {
      id: o.id,
      customer: o.customer_name || "Guest Customer",
      item: firstTitle || `${o.items_count || 1} Item(s)`,
      amount: formatCurrency(o.total_amount),
      status: o.order_status || "Processing",
    };
  });

  // Map real products to trending / demand list
  const trendingList = products.slice(0, 4).map((p) => ({
    name: p.title,
    sales: orders.length > 0 ? "Catalog favorite" : "Available in catalog",
    stock: `${p.stock || 12} in stock`,
    status: (Number(p.stock) || 10) > 5 ? "In Stock" : "Low Stock",
  }));

  return (
    <div className="space-y-6">
      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#800F17] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span
                    className={`inline-flex items-center font-semibold ${
                      stat.isPositive ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-slate-400">{stat.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of Tables: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - 2 Cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-400">Transactions processed in the boutique store</p>
            </div>
            {setActiveTab && (
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs font-semibold text-[#800F17] hover:underline"
              >
                View All Orders
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase text-slate-400 bg-slate-50/70 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Product / Details</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No orders placed yet. Orders will appear here in real-time when customers purchase.
                    </td>
                  </tr>
                ) : (
                  displayOrders.map((order, i) => (
                    <tr key={order.id || i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">{order.id}</td>
                      <td className="py-3 px-3 text-slate-600">{order.customer}</td>
                      <td className="py-3 px-3 text-slate-700 max-w-[200px] truncate">
                        {order.item}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{order.amount}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : order.status === "Processing"
                              ? "bg-blue-50 text-blue-700"
                              : order.status === "Shipped"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products In Demand */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Trending Sarees</h2>
              <p className="text-xs text-slate-400">Live products in highest customer demand</p>
            </div>
            {setActiveTab && (
              <button
                onClick={() => setActiveTab("products")}
                className="text-xs font-semibold text-[#800F17] hover:underline"
              >
                Catalog
              </button>
            )}
          </div>

          <div className="space-y-4">
            {trendingList.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-b-0"
              >
                <div className="pr-2">
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.sales}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "In Stock"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
