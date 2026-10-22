"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, Eye, Sparkles, Database } from "lucide-react";
import ProductModal from "./ProductModal";
import {
  getStoredProducts,
  fetchProductsFromDb,
  saveProductToDb,
  deleteProductFromDb,
} from "@/lib/products";
import { getStoredCategories } from "@/lib/categories";
import { getAssetUrl } from "@/config";

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
  const [isDbLive, setIsDbLive] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      const data = await fetchProductsFromDb();
      if (active && data) {
        setProducts(data);
        setIsDbLive(true);
      }
    }
    loadProducts();

    const handleProductSync = async () => {
      const data = await fetchProductsFromDb();
      if (active && data) setProducts(data);
    };
    const handleCategorySync = () => {
      if (active) setCategories(getStoredCategories());
    };

    window.addEventListener("thoranam_products_updated", handleProductSync);
    window.addEventListener("thoranam_categories_updated", handleCategorySync);
    window.addEventListener("storage", handleProductSync);
    return () => {
      active = false;
      window.removeEventListener("thoranam_products_updated", handleProductSync);
      window.removeEventListener("thoranam_categories_updated", handleCategorySync);
      window.removeEventListener("storage", handleProductSync);
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
    await saveProductToDb(productData);
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
      selectedCategory === "all" || p.category === selectedCategory;
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
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#800F17] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#660C12] transition-colors shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add New Saree
          </button>
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
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#800F17]/20"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.label} value={c.label}>
                {c.label}
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
                        <p className="font-semibold text-slate-800 truncate" title={item.title}>
                          {item.title}
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

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No sarees found matching your search.
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
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        categories={categories}
      />
    </div>
  );
}
