"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Search,
  Globe,
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/config";
import { INITIAL_CATEGORIES, getStoredCategories } from "@/lib/categories";

const getInitialFormData = (product, categories = []) => {
  const catList = categories && categories.length >= 10 ? categories : INITIAL_CATEGORIES;
  if (product) {
    return {
      ...product,
      category: product.category || catList[0]?.label || catList[0]?.name || "Bamboo Cotton Silk",
      highlights: product.highlights || [],
      galleryImages: product.galleryImages || [],
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      seoKeywords: product.seoKeywords || "",
      ogImage: product.ogImage || product.mainImage || "",
      isFeatured: Boolean(product.isFeatured),
    };
  }
  return {
    title: "",
    category: catList[0]?.label || catList[0]?.name || "Bamboo Cotton Silk",
    price: "",
    stock: 10,
    status: "Published",
    isFeatured: false,
    mainImage: "",
    galleryImages: [],
    description: "",
    highlights: [
      "Handloom woven with premium natural yarns",
      "Includes coordinated unstitched blouse fabric",
    ],
    closingDescription: "",
    material: "Satin Crepe",
    size: "Saree Size – Free Size\nBlouse Size 38 – Fit up to size 40\nBlouse Size 42 – Fit up to size 44",
    washCare: "Dry clean only",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    ogImage: "",
  };
};

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct = null,
  categories = [],
}) {
  const [formData, setFormData] = useState(() =>
    getInitialFormData(editingProduct, categories)
  );

  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'description' | 'media' | 'specs'
  const [newHighlightInput, setNewHighlightInput] = useState("");
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const mainFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlightInput.trim()],
    }));
    setNewHighlightInput("");
  };

  const handleRemoveHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Upload main image file
  const handleMainFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMain(true);
      const data = new FormData();
      data.append("files", file);

      const res = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, mainImage: json.url }));
      } else {
        alert(json.message || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setIsUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  };

  // Upload multiple gallery images files
  const handleGalleryFilesUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append("files", files[i]);
      }

      const res = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success && json.urls) {
        setFormData((prev) => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), ...json.urls],
        }));
      } else {
        alert(json.message || "Failed to upload gallery images");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading gallery images");
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a Product Title.");
      return;
    }

    const cleanedData = {
      ...formData,
      // Only keep existing ID if editing an existing product; for new products leave undefined so MySQL auto-increments
      id: editingProduct?.id ? editingProduct.id : undefined,
      stock: Number(formData.stock) || 0,
      price: (() => {
        const raw = String(formData.price || "").trim();
        const num = raw.replace(/^[?]|Rs\.?|₹|\s+/gi, "").trim();
        return `₹ ${num}`;
      })(),
    };

    onSave(cleanedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-stone-50 via-white to-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#800F17]/10 flex items-center justify-center text-[#800F17]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? "Edit Saree Product" : "Add New Saree Product"}
              </h2>
              <p className="text-xs text-slate-500">
                Upload images directly to /uploads, set descriptions, highlights, and specs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 gap-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: "details", label: "Basic Info & Pricing" },
            { id: "description", label: "Story, Highlights & Closing" },
            { id: "media", label: "Main & Gallery Images" },
            { id: "specs", label: "Material, Size & Care" },
            { id: "seo", label: "SEO & Social Share" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#800F17] text-[#800F17] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO & PRICING */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-800">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanchipuram Pure Zari Silk Saree in Crimson Red"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Category</label>
                  {(() => {
                    const categoryOptions =
                      categories && categories.length >= 10
                        ? categories
                        : getStoredCategories();
                    return (
                      <select
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] bg-white"
                      >
                        {formData.category &&
                          !categoryOptions.some(
                            (c) => (c.label || c.name) === formData.category
                          ) && (
                            <option value={formData.category}>{formData.category}</option>
                          )}
                        {categoryOptions.map((c) => {
                          const name = c.label || c.name;
                          return (
                            <option key={c.id || name} value={name}>
                              {name}
                            </option>
                          );
                        })}
                      </select>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4,899 or ₹ 4,899"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Stock Inventory (Units) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 15"
                      value={formData.stock}
                      onChange={(e) => handleChange("stock", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      Units
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Publish Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] bg-white"
                  >
                    <option value="Published">Published (Live in catalog)</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>

                {/* Handpicked Favorites / Best of the Bunch Checkbox */}
                <div className="md:col-span-2 pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 cursor-pointer transition-colors group">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isFeatured)}
                      onChange={(e) => handleChange("isFeatured", e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#800F17] rounded border-slate-300 focus:ring-[#800F17] cursor-pointer accent-[#800F17]"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-[#800F17] transition-colors">
                        ⭐ Show in &quot;Discover the Best of the Bunch – Shop Our Handpicked Favorites Today!&quot;
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        Check this box to highlight this saree on the homepage in the handpicked favorites showcase section.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESCRIPTION, HIGHLIGHTS & CLOSING */}
          {activeTab === "description" && (
            <div className="space-y-5">
              {/* Product Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Product Description (Paragraph Form)
                    <span className="text-slate-400 font-normal">
                      — Explains the product in paragraph form
                    </span>
                  </label>
                </div>
                <textarea
                  rows={4}
                  placeholder="Describe the saree's weave, touch, aesthetics, origins, and design narrative in flowing paragraph form..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] leading-relaxed"
                />
              </div>

              {/* Product Highlights */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Product Highlights (Bullet Points)
                    <span className="text-slate-400 font-normal">
                      — Lists key distinct features
                    </span>
                  </label>
                  <span className="text-[11px] text-[#800F17] font-semibold">
                    {formData.highlights?.length || 0} features added
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Pure silver tested zari border with intricate temple motif"
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 bg-[#800F17] hover:bg-[#660C12] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Feature
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {formData.highlights?.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-stone-50 border border-stone-200/80 px-3.5 py-2 rounded-xl text-xs text-slate-800 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#800F17] shrink-0" />
                        <span>{point}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove highlight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!formData.highlights || formData.highlights.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No bullet points added yet.</p>
                  )}
                </div>
              </div>

              {/* Product Summary / Closing Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  Product Summary / Closing Description
                  <span className="text-slate-400 font-normal">
                    — Final paragraph on quality, heritage, elegance & occasions
                  </span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize the product's royal heritage, fabric longevity, elegance, and suitable occasions (e.g. weddings, temple visits, banquets)..."
                  value={formData.closingDescription}
                  onChange={(e) => handleChange("closingDescription", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA (MAIN & GALLERY) - UPLOAD DRIVEN */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Main Image Upload Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Main Display Image <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Saved to <code className="text-[#800F17] font-semibold">/public/uploads/</code>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start bg-stone-50/70 p-4 rounded-2xl border border-slate-200">
                  <div className="relative w-36 h-48 rounded-2xl overflow-hidden border-2 border-dashed border-[#800F17]/40 bg-white shadow-xs shrink-0 group flex items-center justify-center">
                    {formData.mainImage ? (
                      <>
                        <img
                          src={getAssetUrl(formData.mainImage)}
                          alt="Main Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                          Main Saree Cover
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <span className="text-[10px] block">No image selected</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={mainFileInputRef}
                      accept="image/*"
                      onChange={handleMainFileUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => mainFileInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-[#800F17]/30 hover:border-[#800F17] hover:bg-[#800F17]/5 rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2"
                    >
                      {isUploadingMain ? (
                        <>
                          <Loader2 className="w-6 h-6 text-[#800F17] animate-spin" />
                          <p className="text-xs font-semibold text-[#800F17]">
                            Uploading image to server...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#800F17]/10 text-[#800F17] flex items-center justify-center">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              Click to Upload Main Saree Image
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              PNG, JPG, WEBP up to 10MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-500">
                        Uploaded File Path:
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.mainImage}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-600 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Images Upload Box */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Gallery Images
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Upload multiple images: close-ups, border, pallu, pleats & blouse details
                    </span>
                  </div>
                  <span className="text-[11px] text-[#800F17] font-bold">
                    {formData.galleryImages?.length || 0} images in gallery
                  </span>
                </div>

                {/* Hidden Native Multiple File Input */}
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFilesUpload}
                  className="hidden"
                />

                <div
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-[#800F17] hover:bg-stone-50 rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2"
                >
                  {isUploadingGallery ? (
                    <>
                      <Loader2 className="w-6 h-6 text-[#800F17] animate-spin" />
                      <p className="text-xs font-semibold text-[#800F17]">
                        Uploading gallery photos to /public/uploads...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to Select & Upload Multiple Gallery Images
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          You can choose multiple saree shots at once
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Gallery List Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {formData.galleryImages?.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[3/4] bg-stone-100 shadow-2xs"
                    >
                      <img
                        src={getAssetUrl(url)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/images/product-2.jpg";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1.5 py-0.5 truncate text-center">
                        Image #{idx + 1}
                      </div>
                    </div>
                  ))}
                  {(!formData.galleryImages || formData.galleryImages.length === 0) && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                      <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-400">No gallery images uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MATERIAL, SIZE & WASH CARE */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Material & Fabric Specifications
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Kanchipuram Mulberry Silk with Pure Gold Zari Weft"
                  value={formData.material}
                  onChange={(e) => handleChange("material", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Size & Dimensions (One per line for bullet points)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        "size",
                        "Saree Size – Free Size\nBlouse Size 38 – Fit up to size 40\nBlouse Size 42 – Fit up to size 44"
                      )
                    }
                    className="text-[11px] font-semibold text-[#800F17] hover:underline cursor-pointer"
                  >
                    + Use Saree & Blouse Template
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder={`Saree Size – Free Size\nBlouse Size 38 – Fit up to size 40\nBlouse Size 42 – Fit up to size 44`}
                  value={formData.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] font-mono text-xs leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Tip: Put each size item on a new line. They will render as clean bullet points under Size on the product details page.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Wash & Care Instructions</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Dry clean strictly recommended. Store in moisture-free muslin cloth away from direct sunlight."
                  value={formData.washCare}
                  onChange={(e) => handleChange("washCare", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                />
              </div>

              {/* Summary review preview box */}
              <div className="bg-stone-50 border border-amber-200/60 rounded-2xl p-4 mt-4">
                <div className="flex items-center gap-2 text-[#800F17] font-bold text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Saree Product Summary Snapshot
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="font-semibold block text-slate-800">Title:</span>
                    {formData.title || "—"}
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-800">Category:</span>
                    {formData.category}
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-800">Price:</span>
                    {formData.price || "—"}
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-800">Stock Units:</span>
                    {formData.stock}
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-800">Highlights:</span>
                    {formData.highlights?.length || 0} features
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-800">Total Images:</span>
                    {1 + (formData.galleryImages?.length || 0)} photos
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO & SOCIAL SHARE */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#800F17] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-[#800F17]">Next.js Native Search Engine Optimization</p>
                  <p>
                    These tags directly power the Google search result snippet, WhatsApp link previews, Facebook, and Instagram shares for this product.
                  </p>
                </div>
              </div>

              {/* Live Google Search Result Preview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Google Search Snippet Preview
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-mono">
                    https://thoranam.co/products/{formData.id || "new-saree"}
                  </p>
                  <h4 className="text-base font-medium text-blue-700 hover:underline cursor-pointer line-clamp-1">
                    {formData.seoTitle || formData.title || "Handcrafted Luxury Saree | Thoranam Boutique"}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {formData.seoDescription ||
                      formData.description?.slice(0, 160) ||
                      "Explore heirloom weaves, pure silk, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique."}
                  </p>
                </div>
              </div>

              {/* SEO Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      SEO Meta Title
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {(formData.seoTitle || "").length}/60 chars recommended
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Pure Kanchipuram Silk Saree in Crimson Red | Thoranam Boutique"
                    value={formData.seoTitle || ""}
                    onChange={(e) => handleChange("seoTitle", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Leave blank to auto-use Product Title + Boutique Name
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      SEO Meta Description
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {(formData.seoDescription || "").length}/160 chars recommended
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="e.g. Shop our authentic handloom Kanchipuram silk saree with intricate zari pallu and matching unstitched blouse piece. Free express shipping across India."
                    value={formData.seoDescription || ""}
                    onChange={(e) => handleChange("seoDescription", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Concise summary displayed in search engines and social cards
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Keywords & Search Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. silk saree, wedding saree, kanchipuram, handloom, festive wear"
                    value={formData.seoKeywords || ""}
                    onChange={(e) => handleChange("seoKeywords", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Social Share Image (OG Image) URL
                  </label>
                  <input
                    type="text"
                    placeholder="Defaults to Main Saree Image if left empty"
                    value={formData.ogImage || ""}
                    onChange={(e) => handleChange("ogImage", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Image preview rendered when sharing on WhatsApp, iMessage, Facebook or Twitter
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {activeTab !== "seo" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ["details", "description", "media", "specs", "seo"];
                    const nextIdx = (tabs.indexOf(activeTab) + 1) % tabs.length;
                    setActiveTab(tabs[nextIdx]);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Next Tab →
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-[#800F17] hover:bg-[#660C12] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                {editingProduct ? "Save Product Changes" : "Create Saree Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
