"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit3, Check, X, Layers, Image as ImageIcon, Upload, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import {
  INITIAL_CATEGORIES,
  HOMEPAGE_BROWSE_CATEGORIES,
  getStoredCategories,
  saveStoredCategories,
  getStoredBrowseCategories,
  saveStoredBrowseCategories,
} from "@/lib/categories";
import { getApiUrl, getAssetUrl } from "@/config";
import { compressImageForUpload } from "@/lib/imageOptimizer";

export default function DashboardCategories() {
  const [activeTab, setActiveTab] = useState("browse"); // "browse" or "menu"
  const [categories, setCategories] = useState(getStoredCategories);
  const [selectedCat, setSelectedCat] = useState(() => {
    const list = getStoredCategories();
    return list.length > 0 ? list[0] : null;
  });

  // Homepage "Browse Our Categories" (8 circle items) state
  const [browseCategories, setBrowseCategories] = useState(getStoredBrowseCategories);
  const [selectedBrowseCat, setSelectedBrowseCat] = useState(() => {
    const list = getStoredBrowseCategories();
    return list.length > 0 ? list[0] : null;
  });
  const [newBrowseName, setNewBrowseName] = useState("");
  const [newBrowseHref, setNewBrowseHref] = useState("");
  const [newBrowseImage, setNewBrowseImage] = useState("");
  const [showAddBrowse, setShowAddBrowse] = useState(false);
  const browseFileInputRef = useRef(null);
  const newBrowseFileInputRef = useRef(null);
  const [newSubcatName, setNewSubcatName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const newCatFileRef = useRef(null);

  // Load from DB API on mount
  useEffect(() => {
    async function loadFromDB() {
      try {
        const [catRes, browseRes] = await Promise.all([
          fetch(getApiUrl("/api/categories")),
          fetch(getApiUrl("/api/categories/browse")),
        ]);
        const catJson = await catRes.json();
        if (catJson.success && Array.isArray(catJson.data) && catJson.data.length > 0) {
          setCategories(catJson.data);
          saveStoredCategories(catJson.data);
          setSelectedCat((prev) => {
            if (!prev) return catJson.data[0];
            return catJson.data.find((c) => c.id === prev.id) || catJson.data[0];
          });
        }
        const browseJson = await browseRes.json().catch(() => null);
        if (browseJson && browseJson.success && Array.isArray(browseJson.data) && browseJson.data.length > 0) {
          const clean = browseJson.data
            .filter((c) => !String(c.id || "").toLowerCase().includes("munga") && !String(c.label || c.name || "").toLowerCase().includes("munga"))
            .slice(0, 8);
          setBrowseCategories(clean);
          saveStoredBrowseCategories(clean);
          setSelectedBrowseCat((prev) => {
            if (!prev) return clean[0];
            return clean.find((c) => c.id === prev.id) || clean[0];
          });
        } else {
          // Fallback to settings endpoint where store_settings is hosted on cPanel
          try {
            const settingsRes = await fetch(getApiUrl("/api/settings"));
            const settingsJson = await settingsRes.json();
            const list = settingsJson?.data?.homepage_browse_categories;
            if (Array.isArray(list) && list.length > 0) {
              const clean = list
                .filter((c) => !String(c.id || "").toLowerCase().includes("munga") && !String(c.label || c.name || "").toLowerCase().includes("munga"))
                .slice(0, 8);
              setBrowseCategories(clean);
              saveStoredBrowseCategories(clean);
              setSelectedBrowseCat((prev) => {
                if (!prev) return clean[0];
                return list.find((c) => c.id === prev.id) || list[0];
              });
            }
          } catch (settErr) {}
        }
      } catch (e) {
        console.error("Failed to load categories from API:", e);
      }
    }
    loadFromDB();

    const handleSync = () => {
      const updated = getStoredCategories();
      setCategories(updated);
    };

    const handleBrowseSync = () => {
      const updated = getStoredBrowseCategories();
      setBrowseCategories(updated);
    };

    window.addEventListener("thoranam_categories_updated", handleSync);
    window.addEventListener("thoranam_browse_categories_updated", handleBrowseSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("storage", handleBrowseSync);
    return () => {
      window.removeEventListener("thoranam_categories_updated", handleSync);
      window.removeEventListener("thoranam_browse_categories_updated", handleBrowseSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Update categories state and sync directly to MySQL DB via /api/categories
  const handleUpdate = async (updatedList) => {
    setCategories(updatedList);
    saveStoredCategories(updatedList);
    if (selectedCat) {
      const current = updatedList.find((c) => c.id === selectedCat.id) || updatedList[0];
      setSelectedCat(current);
    }

    setIsSaving(true);
    try {
      await fetch(getApiUrl("/api/categories"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      });
    } catch (e) {
      console.error("Failed to sync categories to database:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Upload an image file to /api/upload
  const handleFileUpload = async (file, onUploaded) => {
    if (!file) return;
    setIsUploading(true);

    // Compress image to a high-quality lightweight JPEG/WebP (300x300 max for circular avatars)
    const compressImage = (imageFile) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxDim = 400; // ample for category circle icons
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
            resolve(compressedDataUrl);
          };
          img.onerror = () => resolve(event.target.result);
        };
        reader.onerror = () => resolve(null);
      });
    };

    try {
      try {
        const optimized = await compressImageForUpload(file, 400, 400, 0.85);
        const formData = new FormData();
        formData.append("files", optimized);
        const res = await fetch(getApiUrl("/api/upload"), {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          onUploaded(data.url);
          return;
        }
      } catch (err) {
        console.warn("Upload API error:", err);
      }

      // If network upload failed, fallback to local compressedDataUrl
      try {
        const compressedDataUrl = await compressImage(file);
        if (compressedDataUrl) {
          onUploaded(compressedDataUrl);
          return;
        }
      } catch (err) {
        console.warn("Client compression error:", err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newCategory = {
      id: slug,
      label: newCatName.trim(),
      name: newCatName.trim(),
      href: `/products?cat=${slug}`,
      image: newCatImage || "/images/product-1.jpg",
      sort_order: categories.length + 1,
      subcategories: [],
      showcase: [
        {
          title: `${newCatName.trim()} Saree Collection`,
          price: "Rs. 2,999.00",
          image: newCatImage || "/images/product-1.jpg",
        },
      ],
    };
    const updated = [...categories, newCategory];
    handleUpdate(updated);
    setSelectedCat(newCategory);
    setNewCatName("");
    setNewCatImage("");
    setShowAddCat(false);
  };

  const handleDeleteCategory = (catId, e) => {
    e.stopPropagation();
    if (categories.length <= 1) {
      alert("At least one category is required.");
      return;
    }
    if (!confirm("Are you sure you want to remove this category?")) return;
    const updated = categories.filter((c) => c.id !== catId);
    handleUpdate(updated);
    if (selectedCat?.id === catId) {
      setSelectedCat(updated[0]);
    }

    // Also remove from homepage browse categories if present
    if (browseCategories.some((b) => b.id === catId)) {
      handleBrowseUpdate(browseCategories.filter((b) => b.id !== catId));
    }
  };

  const handleMoveCategory = (index, direction, e) => {
    e.stopPropagation();
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const listCopy = [...categories];
    const [moved] = listCopy.splice(index, 1);
    listCopy.splice(newIndex, 0, moved);
    const reordered = listCopy.map((cat, idx) => ({
      ...cat,
      sort_order: idx + 1,
    }));
    handleUpdate(reordered);
  };

  const handleUpdateSelectedImage = (imageUrl) => {
    if (!selectedCat) return;
    const updated = categories.map((cat) => {
      if (cat.id === selectedCat.id) {
        return { ...cat, image: imageUrl };
      }
      return cat;
    });
    handleUpdate(updated);

    // Also sync image to browse categories if matching item exists
    if (browseCategories.some((b) => b.id === selectedCat.id)) {
      const updatedBrowse = browseCategories.map((b) =>
        b.id === selectedCat.id ? { ...b, image: imageUrl } : b
      );
      handleBrowseUpdate(updatedBrowse);
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubcatName.trim() || !selectedCat) return;
    const slug = newSubcatName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

  // Browse categories state update and sync to /api/categories/browse
  const handleBrowseUpdate = async (updatedList) => {
    setBrowseCategories(updatedList);
    saveStoredBrowseCategories(updatedList);
    if (selectedBrowseCat) {
      const current = updatedList.find((c) => c.id === selectedBrowseCat.id) || updatedList[0];
      setSelectedBrowseCat(current);
    }

    setIsSaving(true);
    try {
      // 1. Send to /api/categories/browse
      const res = await fetch(getApiUrl("/api/categories/browse"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList),
      });

      // 2. Also sync to /api/settings (store_settings on cPanel) so it's guaranteed saved
      if (!res.ok || res.status === 404) {
        await fetch(getApiUrl("/api/settings"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homepage_browse_categories: JSON.stringify(updatedList),
          }),
        });
      }
    } catch (e) {
      console.error("Failed to sync browse categories to database:", e);
      try {
        await fetch(getApiUrl("/api/settings"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homepage_browse_categories: JSON.stringify(updatedList),
          }),
        });
      } catch (innerE) {}
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSelectedBrowseImage = (imageUrl) => {
    if (!selectedBrowseCat) return;
    const updated = browseCategories.map((cat) => {
      if (cat.id === selectedBrowseCat.id) {
        return { ...cat, image: imageUrl };
      }
      return cat;
    });
    handleBrowseUpdate(updated);
  };

  const handleAddBrowseCategory = () => {
    if (!newBrowseName.trim()) return;
    const slug = newBrowseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newBrowseItem = {
      id: slug,
      name: newBrowseName.trim(),
      label: newBrowseName.trim(),
      href: newBrowseHref.trim() || `/products?cat=${slug}`,
      image: newBrowseImage || "/images/product-1.jpg",
    };
    const updated = [...browseCategories, newBrowseItem];
    handleBrowseUpdate(updated);
    setSelectedBrowseCat(newBrowseItem);
    setNewBrowseName("");
    setNewBrowseHref("");
    setNewBrowseImage("");
    setShowAddBrowse(false);
  };

  const handleDeleteBrowseCategory = (catId, e) => {
    e.stopPropagation();
    if (browseCategories.length <= 1) {
      alert("At least one homepage category is required.");
      return;
    }
    if (!confirm("Are you sure you want to remove this category from the homepage?")) return;
    const updated = browseCategories.filter((c) => c.id !== catId);
    handleBrowseUpdate(updated);
    if (selectedBrowseCat?.id === catId) {
      setSelectedBrowseCat(updated[0]);
    }
  };

  const handleMoveBrowseCategory = (index, direction, e) => {
    e.stopPropagation();
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= browseCategories.length) return;
    const listCopy = [...browseCategories];
    const [moved] = listCopy.splice(index, 1);
    listCopy.splice(newIndex, 0, moved);
    handleBrowseUpdate(listCopy);
  };

  const handleResetBrowseDefaults = () => {
    if (confirm("Reset homepage 'Browse Our Categories' back to original 8 saree boutique categories?")) {
      handleBrowseUpdate(HOMEPAGE_BROWSE_CATEGORIES);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset categories back to original boutique defaults (6 main header categories with dropdowns)?")) {
      handleUpdate(INITIAL_CATEGORIES);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#800F17]" />
              Category Management
              {isSaving && (
                <span className="inline-flex items-center gap-1 text-[11px] font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving to DB...
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage both the Homepage &ldquo;Browse Our Categories&rdquo; circular cards and the Header navigation categories.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "browse" ? (
              <>
                <button
                  onClick={handleResetBrowseDefaults}
                  className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setShowAddBrowse(!showAddBrowse)}
                  className="inline-flex items-center gap-1.5 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Homepage Category
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleResetDefaults}
                  className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setShowAddCat(!showAddCat)}
                  className="inline-flex items-center gap-1.5 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Main Category
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "browse"
                ? "bg-[#800F17] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Homepage &quot;Browse Our Categories&quot; Circles ({browseCategories.length})
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "menu"
                ? "bg-[#800F17] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Header & Navbar Categories ({categories.length})
          </button>
        </div>
      </div>

      {/* TAB 1: HOMEPAGE "BROWSE OUR CATEGORIES" CIRCULAR CARDS */}
      {activeTab === "browse" && (
        <>
          {/* Add Browse Category Form Drawer/Card */}
          {showAddBrowse && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Handloom Cotton Sarees)"
                  value={newBrowseName}
                  onChange={(e) => setNewBrowseName(e.target.value)}
                  className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:ring-2 focus:ring-[#800F17]"
                />
                <input
                  type="text"
                  placeholder="Link URL (e.g. /products?cat=exotic-cotton&sub=handloom-cotton)"
                  value={newBrowseHref}
                  onChange={(e) => setNewBrowseHref(e.target.value)}
                  className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:ring-2 focus:ring-[#800F17]"
                />
                <input
                  type="text"
                  placeholder="Image URL or upload (/images/product-1.jpg)"
                  value={newBrowseImage}
                  onChange={(e) => setNewBrowseImage(e.target.value)}
                  className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:ring-2 focus:ring-[#800F17]"
                />
                <input
                  type="file"
                  ref={newBrowseFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], (url) => setNewBrowseImage(url));
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => newBrowseFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 bg-white border border-amber-300 text-amber-900 px-3 py-2 rounded-xl text-xs font-medium hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload
                </button>
                <button
                  onClick={handleAddBrowseCategory}
                  className="bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors cursor-pointer"
                >
                  Save Item
                </button>
                <button
                  onClick={() => setShowAddBrowse(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Two Column Layout for Browse Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Homepage Circles List */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Homepage Circle Items ({browseCategories.length})
                </span>
                <span className="text-[11px] text-[#800F17] font-semibold">
                  Browse Section
                </span>
              </div>

              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {browseCategories.map((cat, idx) => {
                  const isSelected = selectedBrowseCat?.id === cat.id;
                  const label = cat.label || cat.name;
                  return (
                    <div
                      key={cat.id || idx}
                      onClick={() => setSelectedBrowseCat(cat)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-[#800F17]/5 border-[#800F17] text-[#800F17] font-semibold shadow-xs"
                          : "bg-slate-50/60 border-slate-100 hover:bg-slate-50 text-slate-700 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Circle Image Preview */}
                        <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-amber-300 bg-amber-50">
                          <img
                            src={getAssetUrl(cat.image) || "/images/product-1.jpg"}
                            alt={label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs truncate">{label}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Reorder Buttons */}
                        <button
                          onClick={(e) => handleMoveBrowseCategory(idx, "up", e)}
                          disabled={idx === 0}
                          title="Move up"
                          className="p-1 hover:text-[#800F17] disabled:opacity-20 text-slate-400 transition-opacity cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleMoveBrowseCategory(idx, "down", e)}
                          disabled={idx === browseCategories.length - 1}
                          title="Move down"
                          className="p-1 hover:text-[#800F17] disabled:opacity-20 text-slate-400 transition-opacity cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteBrowseCategory(cat.id, e)}
                          title="Delete homepage category"
                          className="p-1 hover:text-red-600 text-slate-400 opacity-60 hover:opacity-100 transition-opacity cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Browse Category Image & Appearance */}
            <div className="lg:col-span-2 space-y-6">
              {selectedBrowseCat ? (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Homepage Circle Category Image & Details
                        </h3>
                        <p className="text-xs text-slate-400">
                          This circular image updates directly in the Homepage &ldquo;BROWSE OUR CATEGORIES&rdquo; circle carousel/grid.
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-[#800F17] rounded-lg border border-rose-200">
                        Live Synced to Homepage
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                      {/* Circular Preview with Golden Gradient Border matching Homepage */}
                      <div className="relative w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] shadow-md shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden relative bg-amber-50/50 flex items-center justify-center">
                          <img
                            src={getAssetUrl(selectedBrowseCat.image) || "/images/product-1.jpg"}
                            alt={selectedBrowseCat.label || selectedBrowseCat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Image & Field Controls */}
                      <div className="flex-1 w-full space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Category Display Name
                          </label>
                          <input
                            type="text"
                            value={selectedBrowseCat.label || selectedBrowseCat.name || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = browseCategories.map((c) =>
                                c.id === selectedBrowseCat.id ? { ...c, label: val, name: val } : c
                              );
                              handleBrowseUpdate(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#800F17]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Link Destination (HREF)
                          </label>
                          <input
                            type="text"
                            value={selectedBrowseCat.href || ""}
                            placeholder="/products?cat=exotic-cotton&sub=handloom-cotton"
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = browseCategories.map((c) =>
                                c.id === selectedBrowseCat.id ? { ...c, href: val } : c
                              );
                              handleBrowseUpdate(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#800F17]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Circle Image URL or Upload New Photo
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={selectedBrowseCat.image || ""}
                              placeholder="e.g. /images/product-1.jpg or uploaded URL"
                              onChange={(e) => handleUpdateSelectedBrowseImage(e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#800F17]"
                            />
                            <input
                              type="file"
                              ref={browseFileInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  handleFileUpload(f, (url) => handleUpdateSelectedBrowseImage(url));
                                }
                                e.target.value = "";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => browseFileInputRef.current?.click()}
                              disabled={isUploading}
                              className="inline-flex items-center gap-1.5 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors cursor-pointer shrink-0"
                            >
                              {isUploading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              Upload Image
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Homepage Preview Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        Live Homepage Section Preview
                      </h3>
                      <p className="text-xs text-slate-400">
                        Exact appearance of &ldquo;BROWSE OUR CATEGORIES&rdquo; on the homepage
                      </p>
                    </div>

                    <div className="bg-stone-50/70 p-6 rounded-2xl border border-stone-200/60 flex items-center justify-center">
                      <div className="flex flex-wrap items-center justify-center gap-5">
                        {browseCategories.map((c, i) => {
                          const isCur = selectedBrowseCat?.id === c.id;
                          return (
                            <div
                              key={c.id || i}
                              onClick={() => setSelectedBrowseCat(c)}
                              className={`flex flex-col items-center text-center cursor-pointer p-1.5 rounded-2xl transition-all ${
                                isCur ? "bg-rose-100/60 ring-2 ring-[#800F17]" : "hover:scale-105"
                              }`}
                            >
                              <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] shadow-sm">
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                                  <img
                                    src={c.image || "/images/product-1.jpg"}
                                    alt={c.label || c.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <span className="mt-1.5 text-[10px] font-medium text-[#800F17] max-w-[80px] line-clamp-2">
                                {c.label || c.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Select a homepage category circle item from the left to edit its image and details.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: HEADER & NAVBAR CATEGORIES */}
      {activeTab === "menu" && (
        <>
          {/* Add Main Category Form Drawer/Card */}
          {showAddCat && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. Designer Festive Sarees, Banarasi Silk..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:ring-2 focus:ring-[#800F17]"
                />
                <input
                  type="text"
                  placeholder="Image URL or upload (e.g. /images/product-1.jpg)"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:ring-2 focus:ring-[#800F17]"
                />
                <input
                  type="file"
                  ref={newCatFileRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], (url) => setNewCatImage(url));
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => newCatFileRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 bg-white border border-amber-300 text-amber-900 px-3 py-2 rounded-xl text-xs font-medium hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload Image
                </button>
                <button
                  onClick={handleAddCategory}
                  className="bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors cursor-pointer"
                >
                  Save Category
                </button>
                <button
                  onClick={() => setShowAddCat(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Two Column Layout: Categories List on Left, Category Details & Image & Subcategories on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Categories List */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Header & Dropdown Categories ({categories.length})
                </span>
              </div>

              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {categories.map((cat, idx) => {
                  const isSelected = selectedCat?.id === cat.id;
                  return (
                    <div
                      key={cat.id || idx}
                      onClick={() => setSelectedCat(cat)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-[#800F17]/5 border-[#800F17] text-[#800F17] font-semibold shadow-xs"
                          : "bg-slate-50/60 border-slate-100 hover:bg-slate-50 text-slate-700 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Circle Image Preview */}
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-300 bg-amber-50">
                          <img
                            src={cat.image || "/images/product-1.jpg"}
                            alt={cat.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs truncate">{cat.label}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Reorder Buttons */}
                        <button
                          onClick={(e) => handleMoveCategory(idx, "up", e)}
                          disabled={idx === 0}
                          title="Move up"
                          className="p-1 hover:text-[#800F17] disabled:opacity-20 text-slate-400 transition-opacity cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleMoveCategory(idx, "down", e)}
                          disabled={idx === categories.length - 1}
                          title="Move down"
                          className="p-1 hover:text-[#800F17] disabled:opacity-20 text-slate-400 transition-opacity cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">
                          {cat.subcategories?.length || 0} sub
                        </span>
                        <button
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                          title="Delete category"
                          className="p-1 hover:text-red-600 text-slate-400 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Category Details, Image Editor, Subcategories & Live Preview */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCat ? (
                <>
                  {/* Category Circle Image & Label Settings Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Category Image & Appearance
                        </h3>
                        <p className="text-xs text-slate-400">
                          This circular image displays on the homepage &ldquo;Browse Our Categories&rdquo; section and in the database.
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-[#800F17] rounded-lg border border-rose-200">
                        Stored in MySQL DB
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Circular Preview with Gold Gradient Border */}
                      <div className="relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] shadow-md shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden relative bg-stone-100">
                          <img
                            src={selectedCat.image || "/images/product-1.jpg"}
                            alt={selectedCat.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Image Edit Controls */}
                      <div className="flex-1 w-full space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={selectedCat.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = categories.map((c) =>
                                c.id === selectedCat.id ? { ...c, label: val, name: val } : c
                              );
                              handleUpdate(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#800F17]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Circle Image URL or Upload New Image
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={selectedCat.image || ""}
                              placeholder="e.g. /images/product-1.jpg or uploaded URL"
                              onChange={(e) => handleUpdateSelectedImage(e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#800F17]"
                            />
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  handleFileUpload(f, (url) => handleUpdateSelectedImage(url));
                                }
                                e.target.value = "";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="inline-flex items-center gap-1.5 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors cursor-pointer shrink-0"
                            >
                              {isUploading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              Upload Image
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories Editor */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Subcategories for &quot;{selectedCat.label}&quot;
                        </h3>
                        <p className="text-xs text-slate-400">
                          These appear inside the Header Mega Menu dropdown when customers hover over {selectedCat.label}
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
                        placeholder="e.g. Traditional Handlooms, Artisan Border..."
                        value={newSubcatName}
                        onChange={(e) => setNewSubcatName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-[#800F17]"
                      />
                      <button
                        onClick={handleAddSubcategory}
                        className="inline-flex items-center gap-1 bg-[#800F17] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#660C12] transition-colors cursor-pointer"
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
                              className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                          No subcategories added yet. Use the input above to add items like{" "}
                          <span className="font-semibold text-slate-600">
                            &quot;Traditional Weaves&quot;
                          </span>{" "}
                          or{" "}
                          <span className="font-semibold text-slate-600">
                            &quot;Festive Collection&quot;
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

                    <div className="bg-white p-6 rounded-2xl border border-rose-100/70 shadow-xs">
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
                                    src={item.image || selectedCat.image || "/images/product-1.jpg"}
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
                  Select a category to edit its image, subcategories, and menu showcase.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
