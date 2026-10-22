"use client";

import React, { useState, useEffect } from "react";
import { Percent, Search, RefreshCw, Tag, Calendar, CheckCircle2 } from "lucide-react";
import { getApiUrl } from "@/config";

const samplePromotions = [
  {
    id: "PROMO-1",
    code: "DIWALI20",
    discount_type: "percentage",
    discount_value: 20,
    min_order_value: 5000,
    max_discount: 2000,
    expiry_date: "2026-11-30",
    status: "Active",
  },
  {
    id: "PROMO-2",
    code: "FIRST10",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 2000,
    max_discount: 1000,
    expiry_date: "2026-12-31",
    status: "Active",
  },
  {
    id: "PROMO-3",
    code: "THORANAM500",
    discount_type: "flat",
    discount_value: 500,
    min_order_value: 4000,
    max_discount: 500,
    expiry_date: "2026-10-31",
    status: "Active",
  },
];

export default function DashboardPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/promotions"));
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setPromotions(json.data);
      } else {
        setPromotions(samplePromotions);
      }
    } catch (e) {
      setPromotions(samplePromotions);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const filtered = promotions.filter((p) =>
    (p.code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#800F17] flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Discounts & Coupons ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500">Active store promotional codes and threshold limits</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#800F17]"
            />
          </div>

          <button
            onClick={fetchPromotions}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh Promotions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase text-slate-400 bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Max Benefit</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#800F17]">
                    <span className="bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                      {p.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `₹ ${p.discount_value} FLAT`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.min_order_value ? `₹ ${p.min_order_value}` : "No minimum"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {p.max_discount ? `₹ ${p.max_discount}` : "Unlimited"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {p.expiry_date || "No Expiry"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status || "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
