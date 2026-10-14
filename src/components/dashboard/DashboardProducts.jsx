import React, { useState } from "react";
import { Plus, Search, Edit3, Trash2, Filter } from "lucide-react";

const initialProducts = [
  {
    id: 1,
    title: "Semi Mangalagiri Saree",
    category: "Semi Silk Sarees",
    price: "₹ 4,899",
    stock: 14,
    status: "Published",
  },
  {
    id: 2,
    title: "Kanchipuram Silk Saree",
    category: "Silk Sarees",
    price: "₹ 14,250",
    stock: 18,
    status: "Published",
  },
  {
    id: 3,
    title: "Exotic Chanderi Saree",
    category: "Exotic Cotton Sarees",
    price: "₹ 3,499",
    stock: 2,
    status: "Low Stock",
  },
  {
    id: 4,
    title: "Pure Cotton Handloom Saree",
    category: "Pure Cotton",
    price: "₹ 2,450",
    stock: 26,
    status: "Published",
  },
  {
    id: 5,
    title: "Thoranam Exclusive Zari Weave",
    category: "Thoranam Collection",
    price: "₹ 8,990",
    stock: 9,
    status: "Published",
  },
];

export default function DashboardProducts() {
  const [products] = useState(initialProducts);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Saree Products Catalog</h2>
          <p className="text-xs text-slate-400">Manage boutique inventory and pricing</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors shadow-xs">
          <Plus className="w-4 h-4" />
          Add New Saree
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase text-slate-400 bg-slate-50/70 border-y border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">Inventory</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3 font-semibold text-slate-800">{item.title}</td>
                <td className="py-3 px-3 text-slate-600">{item.category}</td>
                <td className="py-3 px-3 font-semibold text-slate-900">{item.price}</td>
                <td className="py-3 px-3 text-slate-700">{item.stock} units</td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "Published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="p-1 hover:text-[#800F17] text-slate-400 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-red-600 text-slate-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
