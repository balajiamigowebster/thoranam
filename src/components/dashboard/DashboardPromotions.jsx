"use client";

import React, { useState, useEffect } from "react";
import {
  Percent,
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Check,
  Copy,
  X,
  Calendar,
  AlertCircle,
  Tag,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { getApiUrl } from "@/config";

// Preset templates for quick 1-click discount setup
const DISCOUNT_PRESETS = [
  {
    name: "10% Welcome Offer",
    code: "WELCOME10",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 2000,
    max_discount: 1000,
    daysValid: 60,
  },
  {
    name: "20% Festive Silk Sale",
    code: "FESTIVE20",
    discount_type: "percentage",
    discount_value: 20,
    min_order_value: 5000,
    max_discount: 2500,
    daysValid: 30,
  },
  {
    name: "Flat ₹500 Privilege Off",
    code: "THORANAM500",
    discount_type: "flat",
    discount_value: 500,
    min_order_value: 3999,
    max_discount: 500,
    daysValid: 45,
  },
  {
    name: "Flat ₹1,000 VIP Bridal Off",
    code: "BRIDAL1000",
    discount_type: "flat",
    discount_value: 1000,
    min_order_value: 8000,
    max_discount: 1000,
    daysValid: 90,
  },
];

export default function DashboardPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Form State
  const initialForm = {
    id: "",
    code: "",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 0,
    max_discount: "",
    expiry_date: "",
    status: "Active",
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchPromotions = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/promotions"));
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPromotions(json.data);
      }
    } catch (e) {
      console.error("Failed to load promotions:", e);
      showToast("Failed to fetch promotions from server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const res = await fetch(getApiUrl("/api/promotions"));
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) {
          setPromotions(json.data);
        }
      } catch (e) {
        console.error("Failed to load promotions:", e);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = (code) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setFormData({
      ...initialForm,
      code: `SAVE${Math.floor(10 + Math.random() * 90)}`,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo) => {
    setModalMode("edit");
    setFormData({
      id: promo.id,
      code: promo.code || "",
      discount_type: promo.discount_type || "percentage",
      discount_value: promo.discount_value || 0,
      min_order_value: promo.min_order_value || 0,
      max_discount: promo.max_discount || "",
      expiry_date: promo.expiry_date || "",
      status: promo.status || "Active",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset) => {
    const today = new Date();
    today.setDate(today.getDate() + (preset.daysValid || 30));
    const expiryStr = today.toISOString().split("T")[0];

    setFormData((prev) => ({
      ...prev,
      code: preset.code,
      discount_type: preset.discount_type,
      discount_value: preset.discount_value,
      min_order_value: preset.min_order_value,
      max_discount: preset.max_discount,
      expiry_date: expiryStr,
    }));
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) {
      errors.code = "Coupon code is required";
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.code.trim())) {
      errors.code = "Only letters, numbers, hyphens, and underscores allowed";
    }

    const val = Number(formData.discount_value);
    if (!val || isNaN(val) || val <= 0) {
      errors.discount_value = "Discount value must be greater than 0";
    } else if (formData.discount_type === "percentage" && val > 90) {
      errors.discount_value = "Percentage discount cannot exceed 90%";
    }

    if (formData.min_order_value && Number(formData.min_order_value) < 0) {
      errors.min_order_value = "Minimum order cannot be negative";
    }

    if (formData.max_discount && Number(formData.max_discount) < 0) {
      errors.max_discount = "Max discount cap cannot be negative";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePromotion = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_value: Number(formData.discount_value),
      min_order_value: Number(formData.min_order_value) || 0,
      max_discount: formData.max_discount ? Number(formData.max_discount) : null,
      expiry_date: formData.expiry_date || null,
    };

    try {
      const url = getApiUrl("/api/promotions");
      const method = modalMode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        showToast(
          modalMode === "create"
            ? `Coupon ${payload.code} created successfully!`
            : `Coupon ${payload.code} updated successfully!`
        );
        setIsModalOpen(false);
        fetchPromotions(false);
      } else {
        showToast(result.message || "Failed to save coupon", "error");
      }
    } catch (err) {
      console.error("Save promotion error:", err);
      showToast("Error saving coupon to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (promo) => {
    const newStatus = promo.status === "Active" ? "Disabled" : "Active";
    try {
      const res = await fetch(getApiUrl("/api/promotions"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: promo.id,
          code: promo.code,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon ${promo.code} set to ${newStatus}`);
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, status: newStatus } : p))
        );
      } else {
        showToast(data.message || "Could not update status", "error");
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      showToast("Network error updating status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsSubmitting(true);
    try {
      const targetId = deleteConfirmTarget.id || deleteConfirmTarget.code;
      const res = await fetch(getApiUrl(`/api/promotions?id=${encodeURIComponent(targetId)}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon ${deleteConfirmTarget.code} deleted successfully`);
        setPromotions((prev) => prev.filter((p) => p.id !== targetId && p.code !== targetId));
        setDeleteConfirmTarget(null);
      } else {
        showToast(data.message || "Failed to delete coupon", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Error deleting coupon", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = promotions.filter((p) =>
    (p.code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-3 ${
            toastMsg.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {toastMsg.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toastMsg.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#800F17] flex items-center justify-center font-bold ring-4 ring-amber-50/50">
            <Percent className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Discounts & Offers ({promotions.length})
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live Store Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, configure, and manage promotional coupon codes and order discounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
            />
          </div>

          <button
            onClick={() => fetchPromotions(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#800F17] hover:bg-[#680b12] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Guide Banner for eCommerce Discount Setup */}
      <div className="bg-gradient-to-r from-amber-50/80 via-rose-50/50 to-stone-50 border border-amber-200/70 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-[#800F17] rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
              How Top Luxury Boutiques Structure Offers:
            </h4>
            <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px] sm:text-xs">
              <span className="font-semibold text-slate-800">1. Minimum Order:</span> Keeps order values high before discounts kick in.{" "}
              <span className="font-semibold text-slate-800">2. Max Benefit Cap:</span> Protects profits on expensive handloom silks.{" "}
              <span className="font-semibold text-slate-800">3. Expiry:</span> Creates festive urgency for shoppers.
            </p>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Min Order</th>
                <th className="py-3.5 px-4">Max Benefit</th>
                <th className="py-3.5 px-4">Expiry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">No discount coupons found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click &quot;+ Create Coupon&quot; above to add your first promotional offer.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isExpired = p.expiry_date && p.expiry_date < new Date().toISOString().split("T")[0];
                  return (
                    <tr key={p.id || p.code} className="hover:bg-slate-50/60 transition-colors">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#800F17] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80 tracking-wide text-xs">
                            {p.code}
                          </span>
                          <button
                            onClick={() => handleCopy(p.code)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            title="Copy Code"
                          >
                            {copiedCode === p.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount value */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">
                          {p.discount_type === "percentage"
                            ? `${p.discount_value}% OFF`
                            : `₹ ${Number(p.discount_value).toLocaleString("en-IN")} FLAT`}
                        </span>
                        <span className="block text-[10px] text-slate-400 capitalize">
                          {p.discount_type} discount
                        </span>
                      </td>

                      {/* Min Order */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {p.min_order_value && Number(p.min_order_value) > 0 ? (
                          `₹ ${Number(p.min_order_value).toLocaleString("en-IN")}`
                        ) : (
                          <span className="text-slate-400">No minimum</span>
                        )}
                      </td>

                      {/* Max Benefit */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {p.max_discount && Number(p.max_discount) > 0 ? (
                          `₹ ${Number(p.max_discount).toLocaleString("en-IN")}`
                        ) : (
                          <span className="text-slate-400">Unlimited</span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4">
                        {p.expiry_date ? (
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              isExpired ? "text-rose-600" : "text-slate-600"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            {p.expiry_date}
                            {isExpired && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 rounded font-bold">
                                Expired
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400">No Expiry</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            p.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {p.status || "Active"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-[#800F17] hover:bg-rose-50 rounded-lg transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTarget(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#800F17] flex items-center justify-center font-bold">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {modalMode === "create" ? "Create New Promotional Offer" : `Edit Coupon: ${formData.code}`}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure customer discount rules and basket thresholds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Selector (for Create Mode) */}
            {modalMode === "create" && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Quick 1-Click Templates:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DISCOUNT_PRESETS.map((pst) => (
                    <button
                      type="button"
                      key={pst.code}
                      onClick={() => handleApplyPreset(pst)}
                      className="text-left p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-amber-50/70 hover:border-amber-300 transition-all text-xs group"
                    >
                      <div className="font-semibold text-stone-900 group-hover:text-[#800F17]">
                        {pst.name}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        Code: <span className="font-mono font-bold text-stone-700">{pst.code}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSavePromotion} className="space-y-4">
              {/* Row 1: Code & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. SILK20"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                        })
                      }
                      className={`w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border outline-none ${
                        formErrors.code
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-stone-200 focus:border-[#800F17]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          code: `FESTIVE${Math.floor(10 + Math.random() * 90)}`,
                        })
                      }
                      className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[10px] font-bold shrink-0 transition-colors"
                      title="Auto-generate memorable code"
                    >
                      Generate
                    </button>
                  </div>
                  {formErrors.code && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-[#800F17] bg-white"
                  >
                    <option value="Active">Active (Redeemable)</option>
                    <option value="Disabled">Disabled (Paused)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discount_type: "percentage" })}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formData.discount_type === "percentage"
                          ? "bg-white text-[#800F17] shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discount_type: "flat" })}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formData.discount_type === "flat"
                          ? "bg-white text-[#800F17] shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Flat (₹)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Discount Value <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder={formData.discount_type === "percentage" ? "e.g. 15" : "e.g. 500"}
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_value: e.target.value })
                      }
                      className={`w-full px-3 py-2 text-xs font-bold rounded-xl border outline-none ${
                        formErrors.discount_value
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-stone-200 focus:border-[#800F17]"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 pointer-events-none">
                      {formData.discount_type === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                  {formErrors.discount_value && (
                    <p className="text-[11px] text-rose-500 mt-0.5">
                      {formErrors.discount_value}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Minimum Order & Max Benefit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2500 (0 for none)"
                    value={formData.min_order_value}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_value: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-[#800F17]"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Customer must have this minimum subtotal
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500 (optional)"
                    value={formData.max_discount}
                    onChange={(e) =>
                      setFormData({ ...formData, max_discount: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-[#800F17]"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Limits discount on high-value silk sarees
                  </p>
                </div>
              </div>

              {/* Row 4: Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-[#800F17] bg-white"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Leave empty if this offer should never expire
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                    Live Shopper Preview
                  </span>
                  <div className="text-sm font-bold text-stone-900 mt-0.5">
                    {formData.discount_type === "percentage"
                      ? `${formData.discount_value || 0}% OFF`
                      : `₹${Number(formData.discount_value || 0).toLocaleString("en-IN")} FLAT OFF`}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    {formData.min_order_value && Number(formData.min_order_value) > 0
                      ? `On orders above ₹${Number(formData.min_order_value).toLocaleString("en-IN")}`
                      : "No minimum purchase required"}
                    {formData.max_discount && Number(formData.max_discount) > 0
                      ? ` • Up to ₹${Number(formData.max_discount).toLocaleString("en-IN")}`
                      : ""}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-[#800F17] bg-white px-2.5 py-1 rounded-md border border-amber-300 shadow-2xs">
                    {formData.code || "COUPON"}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#800F17] hover:bg-[#680b12] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{modalMode === "create" ? "Save & Activate" : "Update Coupon"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-50/60">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Delete Coupon?</h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to delete coupon{" "}
                <span className="font-mono font-bold text-stone-800">
                  {deleteConfirmTarget.code}
                </span>
                ? Shoppers will no longer be able to redeem this discount.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
