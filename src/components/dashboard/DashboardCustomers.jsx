"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCw, Mail, Phone, ShoppingBag, ShieldCheck } from "lucide-react";
import { getApiUrl } from "@/config";

const sampleCustomers = [
  {
    id: 1,
    name: "Ananya Sharma",
    email: "ananya.s@gmail.com",
    phone: "+91 98450 12345",
    total_orders: 3,
    total_spent: "₹ 32,500",
    status: "VIP",
  },
  {
    id: 2,
    name: "Priya Sundaram",
    email: "priya.sundar@yahoo.com",
    phone: "+91 98840 98765",
    total_orders: 1,
    total_spent: "₹ 4,899",
    status: "Active",
  },
  {
    id: 3,
    name: "Meenakshi Iyer",
    email: "meenakshi@gmail.com",
    phone: "+91 99401 54321",
    total_orders: 2,
    total_spent: "₹ 17,980",
    status: "Active",
  },
];

export default function DashboardCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/customers"));
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setCustomers(json.data);
      } else {
        setCustomers(sampleCustomers);
      }
    } catch (e) {
      setCustomers(sampleCustomers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#800F17] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Registered Clients ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500">Profiles, contact details, and lifetime spending</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#800F17]"
            />
          </div>

          <button
            onClick={fetchCustomers}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase text-slate-400 bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#800F17]/10 text-[#800F17] font-bold flex items-center justify-center text-xs">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          <span className="text-[10px] text-slate-400">ID #{c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {c.total_orders || 0} orders
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.total_spent || "₹ 0"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "VIP"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {c.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
