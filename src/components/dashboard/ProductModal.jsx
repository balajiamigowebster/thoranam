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
} from "lucide-react";

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct = null,
  categories = [],
}) {
  const [formData, setFormData] = useState(() => {
    if (editingProduct) {
      return {
        ...editingProduct,
        highlights: editingProduct.highlights || [""],
        galleryImages: editingProduct.galleryImages || [],
      };
    }
    return {
      title: "",
      category: categories[0]?.label || "Semi Silk Sarees",
      price: "",
      stock: 10,
      status: "Published",
      mainImage: "/images/product-1.jpg",
      galleryImages: ["/images/product-2.jpg"],
      description: "",
      highlights: [
        "Handloom woven with premium natural yarns",
        "Includes coordinated unstitched blouse fabric",
      ],
      closingDescription: "",
      material: "",
      size: "6.3 Meters (including 0.8m blouse piece)",
      washCare: "Dry Clean Only",
    };
  });

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

      const res = await fetch("/api/upload", {
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

      const res = await fetch("/api/upload", {
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
      price:
        formData.price.startsWith("₹") || formData.price.startsWith("Rs.")
          ? formData.price
          : `₹ ${formData.price}`,
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
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] bg-white"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id || c.label} value={c.label}>
                          {c.label}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Silk Sarees">Silk Sarees</option>
                        <option value="Semi Silk Sarees">Semi Silk Sarees</option>
                        <option value="Exotic Cotton Sarees">Exotic Cotton Sarees</option>
                        <option value="Pure Cotton">Pure Cotton</option>
                        <option value="Thoranam Collection">Thoranam Collection</option>
                        <option value="New Arrivals">New Arrivals</option>
                      </>
                    )}
                  </select>
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
                  <div className="relative w-36 h-48 rounded-2xl overflow-hidden border-2 border-[#800F17]/40 bg-white shadow-xs shrink-0 group">
                    <img
                      src={formData.mainImage || "/images/product-1.jpg"}
                      alt="Main Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/images/product-1.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                      Main Saree Cover
                    </div>
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
                        src={url}
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
                <label className="text-xs font-bold text-slate-800">Size & Dimensions</label>
                <input
                  type="text"
                  placeholder="e.g. 6.3 Meters (includes 0.8m running blouse piece)"
                  value={formData.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                />
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
              {activeTab !== "specs" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs = ["details", "description", "media", "specs"];
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
