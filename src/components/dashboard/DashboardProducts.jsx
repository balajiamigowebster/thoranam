"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, Eye, Sparkles, Database, Loader2, CheckCircle2 } from "lucide-react";
import ProductModal from "./ProductModal";
import {
  getStoredProducts,
  fetchProductsFromDb,
  saveProductToDb,
  deleteProductFromDb,
} from "@/lib/products";
import { getStoredCategories, INITIAL_CATEGORIES, getUnifiedCategories } from "@/lib/categories";
import { getApiUrl, getAssetUrl } from "@/config";

// Helper to format price with proper Indian Rupee symbol
export function formatRupeePrice(priceStr) {
  if (!priceStr) return "₹ 0";
  // Replace corrupted encoding like '?' or 'Rs.' or missing spaces
  const cleaned = String(priceStr).replace(/^[?]|Rs\.?|\s+/gi, "").trim();
  // If already starts with ₹
  if (String(priceStr).trim().startsWith("₹")) {
    return priceStr;
  }
  return `₹ ${cleaned}`;
}

export default function DashboardProducts() {
  const [products, setProducts] = useState(getStoredProducts);
  const [categories, setCategories] = useState(getStoredCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [isDbLive, setIsDbLive] = useState(true);
  const [isLoading, setIsLoading] = useState(() => {
    const init = getStoredProducts();
    return !init || init.length === 0;
  });

  // Small loading progress indicator area state (left side of Add New Saree button)
  const [uploadState, setUploadState] = useState({ isUploading: false, percent: 0, message: "" });

  // Unified category list combining DB categories, 17 baseline weaves, and all products' categories
  const filterCategoryOptions = React.useMemo(() => {
    return getUnifiedCategories(categories, products.map((p) => p.category));
  }, [categories, products]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const data = await fetchProductsFromDb();
        if (active && data) {
          setProducts(data);
          setIsDbLive(true);
        }
      } catch (e) {
        console.warn("Failed to fetch products:", e);
      } finally {
        if (active) setIsLoading(false);
      }

      try {
        const catRes = await fetch(getApiUrl("/api/categories"));
        const catJson = await catRes.json();
        if (active && catJson.success && Array.isArray(catJson.data) && catJson.data.length > 0) {
          setCategories(catJson.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("thoranam_categories", JSON.stringify(catJson.data));
          }
        }
      } catch (err) {
        console.warn("Could not fetch categories in DashboardProducts:", err);
      }
    }
    loadData();

    const handleProductSync = async () => {
      const data = await fetchProductsFromDb();
      if (active && data) setProducts(data);
    };
    const handleCategorySync = () => {
      if (active) setCategories(getStoredCategories());
    };

    window.addEventListener("thoranam_products_updated", handleProductSync);
    window.addEventListener("thoranam_categories_updated", handleCategorySync);
    return () => {
      active = false;
      window.removeEventListener("thoranam_products_updated", handleProductSync);
      window.removeEventListener("thoranam_categories_updated", handleCategorySync);
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    // If filtering by a category that differs, switch filter to all so user sees their new saree immediately
    if (selectedCategory !== "all" && productData.category !== selectedCategory) {
      setSelectedCategory("all");
    }
    
    // Animate progress on the small indicator next to the Add Saree button
    setUploadState({ isUploading: true, percent: 18, message: "Saving Saree..." });

    const interval = setInterval(() => {
      setUploadState((prev) => {
        if (!prev.isUploading) return prev;
        if (prev.percent < 85) return { ...prev, percent: prev.percent + 14 };
        return prev;
      });
    }, 180);

    try {
      await saveProductToDb(productData);
      clearInterval(interval);
      setUploadState({ isUploading: true, percent: 100, message: "Published!" });
      const refreshed = await fetchProductsFromDb();
      setProducts(refreshed);
      setTimeout(() => {
        setUploadState({ isUploading: false, percent: 0, message: "" });
      }, 2000);
    } catch (err) {
      clearInterval(interval);
      setUploadState({ isUploading: false, percent: 0, message: "" });
      alert(err.message || "Failed to save product");
    }
  };

  const handleToggleFeatured = async (product) => {
    const updated = {
      ...product,
      isFeatured: !product.isFeatured,
    };
    await saveProductToDb(updated);
    const refreshed = await fetchProductsFromDb();
    setProducts(refreshed);
  };

  const handleDeleteProduct = async (productId) => {
    if (confirm("Are you sure you want to remove this product from the database?")) {
      await deleteProductFromDb(productId);
      const refreshed = await fetchProductsFromDb();
      setProducts(refreshed);
      if (viewProduct?.id === productId) {
        setViewProduct(null);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory.toLowerCase().startsWith("fancy") && p.category?.toLowerCase().startsWith("fancy"));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Area */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Saree Products Catalog</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Database className="w-3 h-3 text-emerald-600 animate-pulse" />
                MySQL: thoranam-db
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage boutique inventory, descriptions, highlights, and gallery assets (synced with phpMyAdmin)
            </p>
          </div>

          {/* Right Action Container: Small Loading Progress Area + Add New Saree Button */}
          <div className="flex items-center gap-3">
            {uploadState.isUploading && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-stone-50 to-amber-50/70 border border-amber-200/90 shadow-2xs animate-in fade-in duration-200">
                {uploadState.percent < 100 ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#800F17] animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <div className="flex flex-col min-w-[90px]">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 leading-none">
                    <span>{uploadState.message}</span>
                    <span className={uploadState.percent === 100 ? "text-emerald-700 font-mono text-[10px]" : "text-[#800F17] font-mono text-[10px]"}>
                      {uploadState.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-1 mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        uploadState.percent === 100
                          ? "bg-emerald-600"
                          : "bg-gradient-to-r from-[#800F17] to-amber-600"
                      }`}
                      style={{ width: `${uploadState.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-[#800F17] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#660C12] transition-colors shadow-xs active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add New Saree
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sarees by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            {filterCategoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase text-slate-400 bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Inventory</th>
                <th className="py-2.5 px-3">Specs & Highlights</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg bg-stone-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={getAssetUrl(item.mainImage)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/images/product-1.jpg";
                          }}
                        />
                      </div>
                      <div className="max-w-[220px]">
                        <p className="font-semibold text-slate-800 truncate flex items-center gap-1.5" title={item.title}>
                          <span>{item.title}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFeatured(item);
                            }}
                            className={`shrink-0 inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                              item.isFeatured
                                ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-xs hover:bg-amber-200"
                                : "bg-slate-100 text-slate-400 border border-slate-200 hover:text-amber-700 hover:bg-amber-50"
                            }`}
                            title={
                              item.isFeatured
                                ? "★ Active in Handpicked Favorites (Click to unfeature)"
                                : "Click to feature in Handpicked Favorites"
                            }
                          >
                            ★ {item.isFeatured ? "Handpicked" : "Feature"}
                          </button>
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.galleryImages?.length || 0} gallery photos • {item.material || "Silk blend"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{item.category}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {formatRupeePrice(item.price)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`font-medium ${
                        Number(item.stock) <= 3 ? "text-amber-600 font-bold" : "text-slate-700"
                      }`}
                    >
                      {item.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      <Sparkles className="w-3 h-3 text-[#800F17]" />
                      {item.highlights?.length || 0} bullets
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "Published"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "Low Stock"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setViewProduct(item)}
                        className="p-1.5 hover:text-[#800F17] hover:bg-stone-100 text-slate-400 rounded-lg transition-colors"
                        title="View Full Saree Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 hover:text-[#800F17] hover:bg-stone-100 text-slate-400 rounded-lg transition-colors"
                        title="Edit Saree Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="p-1.5 hover:text-red-600 hover:bg-red-50 text-slate-400 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {isLoading && products.length === 0 && (
                [1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-20 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3"><div className="w-24 h-3 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="w-16 h-3 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="w-16 h-3 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="w-14 h-3 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                    <td className="py-3 px-3 text-right"><div className="w-12 h-4 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No sarees found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Detail Viewer Slide-over / Card */}
      {viewProduct && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#800F17]" />
              <h3 className="text-sm font-bold text-slate-900">
                Detailed Product Preview: {viewProduct.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEditModal(viewProduct)}
                className="text-xs font-semibold text-[#800F17] hover:underline"
              >
                Edit In Popup Form
              </button>
              <button
                onClick={() => setViewProduct(null)}
                className="text-xs text-slate-400 hover:text-slate-600 ml-3"
              >
                ✕ Close Preview
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Images display */}
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[3/4] bg-stone-100">
                <img
                  src={getAssetUrl(viewProduct.mainImage)}
                  alt={viewProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {viewProduct.galleryImages && viewProduct.galleryImages.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1.5">Gallery Photos:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {viewProduct.galleryImages.map((g, i) => (
                      <div
                        key={i}
                        className="w-14 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-stone-100"
                      >
                        <img src={getAssetUrl(g)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description, Highlights & Closing */}
            <div className="md:col-span-2 space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800F17]">
                  Product Description
                </span>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  {viewProduct.description || "No description provided."}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800F17]">
                  Product Highlights
                </span>
                <ul className="mt-1.5 space-y-1">
                  {viewProduct.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-[#800F17] font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                  {(!viewProduct.highlights || viewProduct.highlights.length === 0) && (
                    <li className="text-slate-400 italic">No highlights recorded.</li>
                  )}
                </ul>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#800F17]">
                  Product Summary / Closing Description
                </span>
                <p className="text-slate-700 mt-1 leading-relaxed italic bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                  {viewProduct.closingDescription || "Heritage quality crafted for memorable celebrations."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-slate-600">
                <div className="bg-stone-50 p-2.5 rounded-xl">
                  <span className="font-bold text-slate-800 block">Material</span>
                  {viewProduct.material || "Silk / Cotton blend"}
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl">
                  <span className="font-bold text-slate-800 block mb-1">Size</span>
                  <div className="text-xs whitespace-pre-line text-slate-700">
                    {viewProduct.size || "Saree Size – Free Size"}
                  </div>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl">
                  <span className="font-bold text-slate-800 block">Wash & Care</span>
                  {viewProduct.washCare || "Dry clean recommended"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Popup Modal Form */}
      {isModalOpen && (
        <ProductModal
          key={editingProduct ? `edit-${editingProduct.id}` : "create-new"}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          editingProduct={editingProduct}
          categories={categories}
        />
      )}
    </div>
  );
}
