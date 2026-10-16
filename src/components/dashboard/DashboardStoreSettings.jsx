"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Plus,
  Trash2,
  Save,
  Globe,
  Sliders,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MoveUp,
  MoveDown,
  Smartphone,
  Monitor,
} from "lucide-react";
import { getApiUrl, getAssetUrl } from "@/config";

export default function DashboardStoreSettings() {
  const [activeSubTab, setActiveSubTab] = useState("hero"); // 'hero' | 'seo'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Hero Slides
  const [slides, setSlides] = useState([
    {
      id: "slide-1",
      imageSrc: "/images/hero-1.webp",
      mobileImageSrc: "",
      imageAlt: "Semi Mangalagiri Saree Collection Banner",
      title: "Semi Mangalagiri",
      subtitle: "Saree Collections - Upto 15% Off",
      link: "/products",
    },
    {
      id: "slide-2",
      imageSrc: "/images/hero-2.webp",
      mobileImageSrc: "",
      imageAlt: "Heirloom Festive Silk Sarees Banner",
      title: "Festive Silk & Cottons",
      subtitle: "Handcrafted Heritage Weaves",
      link: "/products",
    },
  ]);

  // SEO Settings
  const [seo, setSeo] = useState({
    siteTitle: "Thoranam | Luxury Saree Boutique",
    siteDescription: "Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique.",
    keywords: "saree boutique, silk sarees, mangalagiri sarees, pure cotton, handloom sarees, Indian ethnic wear, Thoranam",
    ogImage: "/images/hero-1.webp",
    socialLinks: {
      instagram: "https://instagram.com",
      whatsapp: "https://wa.me/",
      facebook: "",
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const slideFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);
  const [uploadTargetType, setUploadTargetType] = useState("desktop"); // 'desktop' | 'mobile'

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await fetch(getApiUrl("/api/settings"));
        const json = await res.json();
        if (json.success && json.data) {
          if (Array.isArray(json.data.hero_slides) && json.data.hero_slides.length > 0) {
            setSlides(json.data.hero_slides);
          }
          if (json.data.site_seo) {
            setSeo((prev) => ({ ...prev, ...json.data.site_seo }));
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      const res = await fetch(getApiUrl("/api/settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_slides: slides,
          site_seo: seo,
        }),
      });
      const json = await res.json();
      if (json.success) {
        try {
          localStorage.setItem("thoranam_hero_slides_cache", JSON.stringify(slides));
        } catch (err) {}
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save settings: " + (json.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Error saving settings:", e);
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Upload handler for slide image (desktop or mobile)
  const handleUploadSlideImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success && json.url) {
        if (editingSlideIndex !== null) {
          // Replace existing slide image (desktop or mobile)
          setSlides((prev) =>
            prev.map((s, idx) => {
              if (idx === editingSlideIndex) {
                return uploadTargetType === "mobile"
                  ? { ...s, mobileImageSrc: json.url }
                  : { ...s, imageSrc: json.url };
              }
              return s;
            })
          );
        } else {
          // Add new slide with this uploaded image
          const newSlide = {
            id: "slide-" + Date.now(),
            imageSrc: json.url,
            mobileImageSrc: "",
            imageAlt: `Thoranam Saree Banner ${slides.length + 1}`,
            title: "New Festive Collection",
            subtitle: "Handcrafted Luxury Weaves",
            link: "/products",
          };
          setSlides((prev) => [...prev, newSlide]);
        }
      } else {
        alert("Upload failed: " + (json.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Slide upload error:", err);
      alert("Image upload error.");
    } finally {
      setIsUploading(false);
      setEditingSlideIndex(null);
      if (slideFileInputRef.current) slideFileInputRef.current.value = "";
    }
  };

  const handleAddNewSlide = () => {
    setEditingSlideIndex(null);
    setUploadTargetType("desktop");
    if (slideFileInputRef.current) slideFileInputRef.current.click();
  };

  const handleReplaceDesktopImage = (index) => {
    setEditingSlideIndex(index);
    setUploadTargetType("desktop");
    if (slideFileInputRef.current) slideFileInputRef.current.click();
  };

  const handleReplaceMobileImage = (index) => {
    setEditingSlideIndex(index);
    setUploadTargetType("mobile");
    if (slideFileInputRef.current) slideFileInputRef.current.click();
  };

  const handleRemoveMobileImage = (index) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, mobileImageSrc: "" } : s))
    );
  };

  const handleRemoveSlide = (index) => {
    if (slides.length <= 1) {
      alert("Please keep at least 1 hero banner slide.");
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSlide = (index, delta) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setSlides(updated);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for uploading hero banner files to /public/uploads */}
      <input
        type="file"
        ref={slideFileInputRef}
        onChange={handleUploadSlideImage}
        accept="image/*"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#800F17]" />
            Homepage Slideshow & Global Store SEO
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your rotating hero showcase banners, image uploads, and Google/Social search metadata
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#800F17] hover:bg-[#660C12] text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Changes</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings successfully saved and published across the website!
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab("hero")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === "hero"
              ? "border-[#800F17] text-[#800F17] font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Homepage Hero Slideshow ({slides.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("seo")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === "seo"
              ? "border-[#800F17] text-[#800F17] font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          Global Store & Homepage SEO
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-[#800F17] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading store settings from database...</p>
        </div>
      ) : (
        <>
          {/* ================= TAB 1: HERO SLIDESHOW ================= */}
          {activeSubTab === "hero" && (
            <div className="space-y-6">
              {/* Instructions banner */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start justify-between gap-4">
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-[#800F17]">1920 × 700 Banner Aspect Ratio</p>
                  <p>
                    Uploaded banners are securely stored in your local <code>/public/uploads</code> directory with URLs saved to the MySQL database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewSlide}
                  disabled={isUploading}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#800F17] hover:bg-[#680C13] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Upload New Banner</span>
                </button>
              </div>

              {/* Slides List */}
              <div className="space-y-4">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id || index}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between"
                  >
                    {/* Slide Thumbnails: Desktop (1920x700) & Mobile */}
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 w-full lg:w-auto shrink-0">
                      {/* Desktop Banner (1920x700) */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-[#800F17]" /> Desktop Banner
                        </span>
                        <div className="relative w-full sm:w-60 lg:w-64 aspect-[1920/700] rounded-xl overflow-hidden bg-stone-100 border border-slate-200/80 shadow-2xs group">
                          <img
                            src={getAssetUrl(slide.imageSrc)}
                            alt={slide.imageAlt || `Banner ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/images/hero-1.webp";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleReplaceDesktopImage(index)}
                            className="absolute inset-0 bg-black/50 text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity backdrop-blur-2xs cursor-pointer"
                          >
                            <Upload className="w-3 h-3" /> Change Desktop
                          </button>
                        </div>
                      </div>

                      {/* Mobile View Banner (Portrait / Compact Ratio) */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-[#800F17]" /> Mobile View Banner
                        </span>
                        <div className="relative w-full sm:w-28 lg:w-32 aspect-[3/2] sm:aspect-square rounded-xl overflow-hidden bg-stone-100 border border-dashed border-slate-300 shadow-2xs group flex items-center justify-center">
                          {slide.mobileImageSrc ? (
                            <>
                              <img
                                src={getAssetUrl(slide.mobileImageSrc)}
                                alt="Mobile Banner"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = getAssetUrl(slide.imageSrc) || "/images/hero-1.webp";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity backdrop-blur-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleReplaceMobileImage(index)}
                                  className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-white flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="w-2.5 h-2.5" /> Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMobileImage(index)}
                                  className="text-rose-300 hover:text-rose-100 text-[10px] cursor-pointer"
                                >
                                  Reset
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReplaceMobileImage(index)}
                              className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400 hover:text-[#800F17] hover:bg-rose-50/40 transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4 mb-1" />
                              <span className="text-[10px] font-semibold leading-tight">
                                + Add Mobile Banner
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">
                                (Uses desktop if unset)
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Slide Metadata Inputs */}
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Slide Banner Title
                        </label>
                        <input
                          type="text"
                          value={slide.title || ""}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) =>
                                i === index ? { ...s, title: e.target.value } : s
                              )
                            )
                          }
                          placeholder="e.g. Semi Mangalagiri"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-[#800F17]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Subtitle / Promotion Tagline
                        </label>
                        <input
                          type="text"
                          value={slide.subtitle || ""}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) =>
                                i === index ? { ...s, subtitle: e.target.value } : s
                              )
                            )
                          }
                          placeholder="e.g. Saree Collections - Upto 15% Off"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-[#800F17]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Click Destination Link
                        </label>
                        <input
                          type="text"
                          value={slide.link || "/products"}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) =>
                                i === index ? { ...s, link: e.target.value } : s
                              )
                            )
                          }
                          placeholder="/products"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-[#800F17]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Image Alt Description (Accessibility & SEO)
                        </label>
                        <input
                          type="text"
                          value={slide.imageAlt || ""}
                          onChange={(e) =>
                            setSlides((prev) =>
                              prev.map((s, i) =>
                                i === index ? { ...s, imageAlt: e.target.value } : s
                              )
                            )
                          }
                          placeholder="Thoranam Saree Boutique Hero Banner"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-[#800F17]"
                        />
                      </div>
                    </div>

                    {/* Order & Delete Actions */}
                    <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSlide(index, -1)}
                          title="Move Up"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === slides.length - 1}
                          onClick={() => handleMoveSlide(index, 1)}
                          title="Move Down"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(index)}
                        title="Delete Slide"
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: GLOBAL & HOMEPAGE SEO ================= */}
          {activeSubTab === "seo" && (
            <div className="space-y-6">
              {/* Live Google Search Snippet Preview */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Google Search Snippet Preview (Homepage & Brand)
                </span>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-mono">https://thoranam.co</p>
                  <h4 className="text-lg font-medium text-blue-700 hover:underline cursor-pointer">
                    {seo.siteTitle || "Thoranam | Luxury Saree Boutique"}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                    {seo.siteDescription ||
                      "Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique."}
                  </p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Global Website Title (Meta Title)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {(seo.siteTitle || "").length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seo.siteTitle || ""}
                    onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                    placeholder="Thoranam | Luxury Saree Boutique"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Meta Description
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {(seo.siteDescription || "").length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seo.siteDescription || ""}
                    onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
                    placeholder="Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Primary Keywords & Search Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={seo.keywords || ""}
                    onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                    placeholder="saree boutique, silk sarees, mangalagiri sarees, pure cotton, handloom sarees"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Default Social Share Image (OG Image)
                  </label>
                  <input
                    type="text"
                    value={seo.ogImage || ""}
                    onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                    placeholder="/images/hero-1.webp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Banner shown when someone shares your main store link on WhatsApp, Facebook, Instagram, or iMessage.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
