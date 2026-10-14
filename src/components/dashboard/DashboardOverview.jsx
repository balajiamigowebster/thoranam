import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";

const stats = [
  {
    title: "Total Sales Revenue",
    value: "₹ 4,82,900",
    change: "+18.2%",
    isPositive: true,
    subtitle: "vs last month",
    icon: CreditCard,
  },
  {
    title: "Orders Placed",
    value: "154",
    change: "+8.4%",
    isPositive: true,
    subtitle: "12 pending dispatch",
    icon: ShoppingBag,
  },
  {
    title: "Active Saree Inventory",
    value: "348",
    change: "-4 items",
    isPositive: false,
    subtitle: "Low stock on 8 products",
    icon: Package,
  },
  {
    title: "Registered Customers",
    value: "1,240",
    change: "+24.5%",
    isPositive: true,
    subtitle: "148 joined this week",
    icon: Users,
  },
];

const recentOrders = [
  {
    id: "#TH-9021",
    customer: "Priya Sundaram",
    item: "Semi Mangalagiri Saree - Royal Maroon",
    amount: "₹ 4,899",
    status: "Delivered",
    date: "12 Oct 2026",
  },
  {
    id: "#TH-9020",
    customer: "Ananya Sharma",
    item: "Kanchipuram Silk Saree - Golden Mustard",
    amount: "₹ 14,250",
    status: "Processing",
    date: "12 Oct 2026",
  },
  {
    id: "#TH-9019",
    customer: "Meenakshi Raman",
    item: "Pure Cotton Handloom Saree",
    amount: "₹ 2,450",
    status: "Shipped",
    date: "11 Oct 2026",
  },
  {
    id: "#TH-9018",
    customer: "Kavitha Rajan",
    item: "Thoranam Exclusive Semi Silk Zari",
    amount: "₹ 6,100",
    status: "Pending",
    date: "11 Oct 2026",
  },
];

const topProducts = [
  { name: "Semi Mangalagiri Saree", sales: "68 sold", stock: "14 in stock", status: "In Stock" },
  { name: "Pure Cotton Handloom", sales: "52 sold", stock: "6 in stock", status: "Low Stock" },
  { name: "Kanchipuram Traditional Silk", sales: "34 sold", stock: "18 in stock", status: "In Stock" },
  { name: "Exotic Chanderi Saree", sales: "29 sold", stock: "2 in stock", status: "Low Stock" },
];

export default function DashboardOverview() {
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
              <p className="text-xs text-slate-400">Transactions processed in the last 48 hours</p>
            </div>
            <button className="text-xs font-semibold text-[#800F17] hover:underline">
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase text-slate-400 bg-slate-50/70 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products In Demand */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Trending Sarees</h2>
              <p className="text-xs text-slate-400">Best selling collections this week</p>
            </div>
          </div>

          <div className="space-y-4">
            {topProducts.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-b-0"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.sales}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "In Stock"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
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
