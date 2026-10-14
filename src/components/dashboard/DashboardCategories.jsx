"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Check, X, Layers, Image as ImageIcon } from "lucide-react";
import {
  INITIAL_CATEGORIES,
  getStoredCategories,
  saveStoredCategories,
} from "@/lib/categories";

export default function DashboardCategories() {
  const [categories, setCategories] = useState(getStoredCategories);
  const [selectedCat, setSelectedCat] = useState(() => {
    const list = getStoredCategories();
    return list.length > 0 ? list[0] : null;
  });
  const [newSubcatName, setNewSubcatName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      const updated = getStoredCategories();
      setCategories(updated);
    };

    window.addEventListener("thoranam_categories_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("thoranam_categories_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleUpdate = (updatedList) => {
    setCategories(updatedList);
    saveStoredCategories(updatedList);
    if (selectedCat) {
      const current = updatedList.find((c) => c.id === selectedCat.id) || updatedList[0];
      setSelectedCat(current);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/\s+/g, "-");
    const newCategory = {
      id: slug,
      label: newCatName.trim(),
      href: `/products?cat=${slug}`,
      subcategories: [],
      showcase: [
        {
          title: `${newCatName.trim()} Saree Collection`,
          price: "Rs. 2,999.00",
          image: "/images/product-1.jpg",
        },
      ],
    };
    const updated = [...categories, newCategory];
    handleUpdate(updated);
    setSelectedCat(newCategory);
    setNewCatName("");
    setShowAddCat(false);
  };

  const handleDeleteCategory = (catId, e) => {
    e.stopPropagation();
    if (categories.length <= 1) {
      alert("At least one category is required.");
      return;
    }
    const updated = categories.filter((c) => c.id !== catId);
    handleUpdate(updated);
    if (selectedCat?.id === catId) {
      setSelectedCat(updated[0]);
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubcatName.trim() || !selectedCat) return;
    const slug = newSubcatName.toLowerCase().replace(/\s+/g, "-");
    const newSub = {
      label: newSubcatName.trim(),
      href: `${selectedCat.href}&sub=${slug}`,
    };
    const updated = categories.map((cat) => {
      if (cat.id === selectedCat.id) {
        return {
          ...cat,
          subcategories: [...(cat.subcategories || []), newSub],
        };
      }
      return cat;
    });
    handleUpdate(updated);
    setNewSubcatName("");
  };

  const handleDeleteSubcategory = (subLabel) => {
    if (!selectedCat) return;
    const updated = categories.map((cat) => {
      if (cat.id === selectedCat.id) {
        return {
          ...cat,
          subcategories: (cat.subcategories || []).filter((s) => s.label !== subLabel),
        };
      }
      return cat;
    });
    handleUpdate(updated);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset categories back to original boutique defaults?")) {
      handleUpdate(INITIAL_CATEGORIES);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#800F17]" />
            Product Categories & Navigation Sync
          </h2>
          <p className="text-xs text-slate-400">
            Categories modified here instantly update the boutique Header & Navbar dropdowns in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2 border border-slate-200 rounded-xl transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="inline-flex items-center gap-1.5 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Main Category
          </button>
        </div>
      </div>

      {/* Add Main Category Form Drawer/Card */}
      {showAddCat && (
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
          <input
            type="text"
            placeholder="e.g. Designer Festive Sarees, Banarasi Silk..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:ring-2 focus:ring-[#800F17]"
          />
          <button
            onClick={handleAddCategory}
            className="bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors"
          >
            Save Category
          </button>
          <button
            onClick={() => setShowAddCat(false)}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Column Layout: Categories on Left, Subcategories & Mega Menu Showcase on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Categories List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Header Menu Categories ({categories.length})
            </span>
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const isSelected = selectedCat?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCat(cat)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#800F17]/5 border-[#800F17] text-[#800F17] font-semibold shadow-xs"
                      : "bg-slate-50/60 border-slate-100 hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-[#800F17]" : "bg-slate-300"
                      }`}
                    />
                    <span className="text-xs">{cat.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                      {cat.subcategories?.length || 0} sub
                    </span>
                    <button
                      onClick={(e) => handleDeleteCategory(cat.id, e)}
                      title="Delete category"
                      className="p-1 hover:text-red-600 text-slate-400 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Subcategories & Showcase items for Selected Category */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCat ? (
            <>
              {/* Subcategories Editor */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Subcategories for &quot;{selectedCat.label}&quot;
                    </h3>
                    <p className="text-xs text-slate-400">
                      These appear inside the Header Mega Menu dropdown when customers hover over{" "}
                      {selectedCat.label}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                    Live Synced to Header
                  </span>
                </div>

                {/* Add Subcategory input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Chettinad Cotton, Handloom cotton sarees, Linen Cotton..."
                    value={newSubcatName}
                    onChange={(e) => setNewSubcatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#800F17]"
                  />
                  <button
                    onClick={handleAddSubcategory}
                    className="inline-flex items-center gap-1 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Subcategories List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {selectedCat.subcategories?.length > 0 ? (
                    selectedCat.subcategories.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#800F17]" />
                          <span className="font-medium text-rose-900">{sub.label}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteSubcategory(sub.label)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      No subcategories added yet. Use the input above to add items like{" "}
                      <span className="font-semibold text-slate-600">
                        &quot;Chettinad Cotton&quot;
                      </span>{" "}
                      or{" "}
                      <span className="font-semibold text-slate-600">
                        &quot;Mangalagiri Cotton&quot;
                      </span>
                      .
                    </div>
                  )}
                </div>
              </div>

              {/* Mega Menu Live Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Dropdown Mega Menu Live Preview
                    </h3>
                    <p className="text-xs text-slate-400">
                      How this category appears to customers when hovering on the Website Header
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-rose-100/70 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Subcategories column */}
                    <div className="border-r border-slate-100 pr-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-3 pb-1 border-b border-rose-100">
                        {selectedCat.label}
                      </p>
                      <ul className="space-y-2">
                        {selectedCat.subcategories?.map((sub, idx) => (
                          <li
                            key={idx}
                            className="text-xs font-medium text-rose-900/80 hover:text-rose-950 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="text-rose-300">›</span> {sub.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: Featured Showcase Cards */}
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Featured Saree Highlights
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedCat.showcase?.map((item, idx) => (
                          <div
                            key={idx}
                            className="group bg-slate-50/50 rounded-xl p-2 border border-slate-100 flex flex-col justify-between"
                          >
                            <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden mb-2 relative">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-slate-800 line-clamp-2 leading-tight">
                                {item.title}
                              </p>
                              <p className="text-[11px] font-bold text-[#800F17] mt-1">
                                {item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              Select a category to edit its subcategories and menu showcase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
