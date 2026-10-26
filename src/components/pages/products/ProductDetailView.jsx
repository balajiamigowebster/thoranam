"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Share2,
  Check,
  ShoppingBag,
  RotateCcw,
  Truck,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
  Copy,
  Info,
  ArrowRight,
  FileText,
} from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/context/CartContext";
import { getApiUrl, getAssetUrl } from "@/config";
import { getProductFromCache, getStoredProducts, fetchProductsFromDb } from "@/lib/products";

// Global Rupee Formatter to fix ? or corrupted currency strings
function formatRupee(priceStr) {
  if (!priceStr) return "₹ 0";
  const str = String(priceStr).trim();
  const cleaned = str.replace(/^[?]|Rs\.?|₹|\s+/gi, "").trim();
  return `₹ ${cleaned}`;
}

export default function ProductDetailView({ productId, initialProduct = null }) {
  const { triggerAddToCartAnimation } = useCart();

  const cachedProduct =
    initialProduct ||
    (typeof window !== "undefined" ? getProductFromCache(productId) : null);

  const initialMainImage =
    cachedProduct?.mainImage && cachedProduct.mainImage.length !== 65535
      ? cachedProduct.mainImage
      : (cachedProduct?.galleryImages?.[0] || "/images/product-1.jpg");

  const [product, setProduct] = useState(
    cachedProduct ? { ...cachedProduct, mainImage: initialMainImage } : null
  );
  const [selectedImage, setSelectedImage] = useState(initialMainImage);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(!cachedProduct);
  const [copied, setCopied] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [addedItems, setAddedItems] = useState({});

  const [relatedProducts, setRelatedProducts] = useState(() => {
    const stored = getStoredProducts();
    return stored.filter((p) => String(p.id) !== String(productId)).slice(0, 4);
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        // Fast fetch single product
        const res = await fetch(getApiUrl(`/api/products/${productId}`));
        if (res.ok) {
          const json = await res.json();
          if (mounted && json.success && json.data) {
            const validMain =
              json.data.mainImage && json.data.mainImage.length !== 65535
                ? json.data.mainImage
                : (json.data.galleryImages?.[0] || "/images/product-1.jpg");
            setProduct({ ...json.data, mainImage: validMain });
            setSelectedImage((prev) => prev || validMain);
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.warn("Product fetch notice:", e);
      } finally {
        if (mounted && !cachedProduct) {
          setIsLoading(false);
        }
      }

      // Fetch related products in background without blocking main view
      if (relatedProducts.length === 0) {
        try {
          const prodList = await fetchProductsFromDb();
          if (mounted && Array.isArray(prodList)) {
            const related = prodList
              .filter((p) => String(p.id) !== String(productId))
              .slice(0, 4);
            setRelatedProducts(related);
          }
        } catch (e) {}
      }
    }

    if (productId) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [productId, cachedProduct]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#800F17] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading Thoranam saree collection...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <Container className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Saree Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested saree may have been updated or moved in the boutique catalog.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#800F17] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#660C12] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </Container>
    );
  }

  // Combine main image + gallery images
  const allImages = [
    product.mainImage,
    ...(Array.isArray(product.galleryImages) ? product.galleryImages : []),
  ].filter(Boolean);

  const parsedStock =
    product?.stock !== undefined && product?.stock !== null && !isNaN(Number(product.stock))
      ? Number(product.stock)
      : null;
  const isSoldOut = parsedStock !== null ? parsedStock <= 0 : false;
  const isLowStock = !isSoldOut && parsedStock !== null && parsedStock > 0 && parsedStock <= 10;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== "undefined") {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Check out this ${product.title} on Thoranam: ` + window.location.href
      )}`;
      window.open(url, "_blank");
    }
  };

  const handleAddToCart = (e) => {
    if (isSoldOut) return;
    setIsAddedToCart(true);
    triggerAddToCartAnimation({
      startElementOrRect: e?.currentTarget,
      image: selectedImage || product?.mainImage || "/images/product-1.jpg",
      item: product,
      quantity: quantity || 1,
    });
    setTimeout(() => setIsAddedToCart(false), 2500);
  };

  const handleAddRelatedToCart = (relProduct, e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = relProduct.id;
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    triggerAddToCartAnimation({
      startElementOrRect: e?.currentTarget,
      image: relProduct.mainImage || "/images/product-1.jpg",
      item: relProduct,
      quantity: 1,
    });
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Top Free shipping promo banner matching Thoranam website */}
      <div className="bg-rose-50/60 border-b border-rose-100/60 text-center py-2 px-4 text-xs font-medium text-slate-700 flex items-center justify-center gap-2">
        <span>Complimentary express shipping on orders above ₹2,999</span>
      </div>

      <Container className="pt-6 sm:pt-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-slate-700">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-slate-700">Products</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* ================= MAIN PRODUCT ROW ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* LEFT COLUMN: Main Image & Gallery Downward */}
          <div className="lg:col-span-6 space-y-4">
            {/* Big Main Image Container */}
            <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-stone-100 border border-slate-200/80 shadow-xs group">
              <img
                src={getAssetUrl(selectedImage || product.mainImage || "/images/product-1.jpg")}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
                onError={(e) => {
                  const currentSrc = e.currentTarget.getAttribute("src") || "";
                  if (currentSrc.startsWith("/uploads/") && !e.currentTarget.dataset.retried) {
                    e.currentTarget.dataset.retried = "true";
                    e.currentTarget.src = `https://amigowebster.in/thoranam${currentSrc}`;
                    return;
                  }
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/product-1.jpg";
                }}
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-[#800F17] shadow-xs backdrop-blur-xs">
                  {product.category || "Exclusive Saree"}
                </span>
              </div>
              {isSoldOut && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-stone-800/90 text-white shadow-xs backdrop-blur-xs">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Down Gallery Thumbnails */}
            {allImages.length > 1 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Saree Gallery Views ({allImages.length})
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 sm:w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-stone-100 cursor-pointer ${
                        selectedImage === img
                          ? "border-[#800F17] ring-2 ring-[#800F17]/30 scale-102"
                          : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={getAssetUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const currentSrc = e.currentTarget.getAttribute("src") || "";
                          if (currentSrc.startsWith("/uploads/") && !e.currentTarget.dataset.retried) {
                            e.currentTarget.dataset.retried = "true";
                            e.currentTarget.src = `https://amigowebster.in/thoranam${currentSrc}`;
                            return;
                          }
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/product-2.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Title, Pricing, Actions, Highlights & Specs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title & Share Icons */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Share & Social Row matching screenshot */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy link"
                  className="w-9 h-9 rounded-full bg-[#800F17] text-white flex items-center justify-center hover:bg-[#660B12] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  title="Share to WhatsApp"
                  className="w-9 h-9 rounded-full bg-[#800F17] text-white flex items-center justify-center hover:bg-[#660B12] transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy direct product link"
                  className="w-9 h-9 rounded-full bg-[#800F17] text-white flex items-center justify-center hover:bg-[#660B12] transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    Link copied!
                  </span>
                )}
              </div>
            </div>

            {/* Price & Offer badge */}
            <div className="space-y-2 border-y border-slate-100 py-4">
              <div className="text-3xl sm:text-4xl font-bold text-[#800F17]">
                {formatRupee(product.price)}
              </div>
              <div className="inline-block">
                <span className="bg-[#800F17] text-white text-xs font-semibold px-3 py-1 rounded-md">
                  Offer Ends 22nd March
                </span>
              </div>
            </div>

            {/* Availability / Urgency Warning Row */}
            {isSoldOut ? (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-slate-700 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
                <span>Sold Out – This saree is currently out of stock</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>Hurry! Only {parsedStock} {parsedStock === 1 ? 'saree' : 'sarees'} left in stock</span>
              </div>
            ) : null}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div
                  className={`inline-flex items-center justify-between border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 w-full sm:w-36 shrink-0 ${
                    isSoldOut ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {isSoldOut ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isSoldOut || (parsedStock !== null && quantity >= parsedStock)}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {isSoldOut ? (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#800F17]/45 text-white/90 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider select-none shadow-none"
                  >
                    SOLD OUT
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#800F17] hover:bg-[#660B12] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {isAddedToCart ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> ADD TO CART
                      </>
                    )}
                  </button>
                )}
              </div>

              {!isSoldOut && (
                <button
                  type="button"
                  onClick={() => {
                    triggerAddToCartAnimation({
                      image: selectedImage || product?.mainImage || "/images/product-1.jpg",
                      item: product,
                      quantity: quantity || 1,
                    });
                    setTimeout(() => {
                      window.location.href = "/checkout";
                    }, 300);
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase cursor-pointer"
                >
                  BUY IT NOW
                </button>
              )}
            </div>

            {/* 3 Trust Badges matching screenshot */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="border border-amber-200/60 bg-amber-50/20 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-1.5">
                <RotateCcw className="w-6 h-6 text-[#800F17]" />
                <span className="text-xs font-bold text-slate-900">3-day returns</span>
              </div>
              <div className="border border-amber-200/60 bg-amber-50/20 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-1.5">
                <Truck className="w-6 h-6 text-[#800F17]" />
                <span className="text-xs font-bold text-slate-900">Free shipping</span>
              </div>
              <div className="border border-amber-200/60 bg-amber-50/20 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-1.5">
                <ShieldCheck className="w-6 h-6 text-[#800F17]" />
                <span className="text-xs font-bold text-slate-900">Quality checked</span>
              </div>
            </div>

            {/* Story Paragraph */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 text-sm">
                Thoranam {product.title}
              </p>
              <p>{product.description || "Handcrafted pure boutique saree woven with precision and care."}</p>
            </div>

            {/* Product Highlights Bullet Points */}
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-sm text-[#800F17]">Product Highlights:</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {product.highlights && product.highlights.length > 0 ? (
                  product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#800F17] font-bold mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-[#800F17] font-bold">•</span>
                      <span>Handloom woven with rich artisan border motifs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#800F17] font-bold">•</span>
                      <span>Breathable fabric providing seamless comfort</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Product Closing Description */}
            {product.closingDescription && (
              <div className="pt-2 text-xs sm:text-sm text-slate-700 italic border-l-2 border-[#800F17] pl-3 py-1">
                {product.closingDescription}
              </div>
            )}

            {/* PRODUCT DETAILS SPECIFICATIONS CARD */}
            <div className="pt-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                PRODUCT DETAILS
              </h2>

              <div className="border border-slate-200/90 rounded-2xl p-5 space-y-3 bg-stone-50/40">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <ShoppingBag className="w-4 h-4 text-[#800F17]" />
                  COLLECTION
                </div>
                <p className="text-xs text-slate-600">
                  This product is from the collection <strong className="text-slate-900">{product.category}</strong>
                </p>
                <Link
                  href={`/products?cat=${product.category?.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-xs font-bold text-[#800F17] hover:underline inline-flex items-center gap-1"
                >
                  View the {product.category} collection →
                </Link>
              </div>

              <div className="border border-slate-200/90 rounded-2xl p-5 space-y-3 bg-white text-xs text-slate-700 shadow-2xs">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-[#800F17]" />
                  SPECIFICATIONS
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <strong className="text-slate-900">• Material: </strong>
                    <span className="text-slate-700">{product.material || "Satin Crepe"}</span>
                  </div>

                  <div>
                    <strong className="text-slate-900">• Size:</strong>
                    {(() => {
                      const rawSize = product.size || "Saree Size – Free Size\nBlouse Size 38 – Fit up to size 40\nBlouse Size 42 – Fit up to size 44";
                      // Check if multi-line or delimited with newline or bullet or comma
                      let lines = [];
                      if (rawSize.includes("\n")) {
                        lines = rawSize.split("\n").map(s => s.trim().replace(/^[•\-*]\s*/, "")).filter(Boolean);
                      } else if (rawSize.includes("Blouse Size") && rawSize.includes("Saree Size")) {
                        // Split intelligent by "Blouse Size" or "Saree Size"
                        lines = rawSize
                          .split(/(?=(?:Saree Size|Blouse Size))/i)
                          .map(s => s.trim().replace(/^[•\-*]\s*/, ""))
                          .filter(Boolean);
                      } else {
                        lines = [rawSize.trim()];
                      }

                      return (
                        <ul className="mt-1.5 ml-4 space-y-1.5 text-slate-600">
                          {lines.map((line, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#800F17] font-bold">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>

                  <div>
                    <strong className="text-slate-900">• Wash & Care: </strong>
                    <span className="text-slate-700">{product.washCare || "Dry clean only"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>BRAND</span>
                  <strong className="text-slate-900">Thoranam Sarees</strong>
                </div>
              </div>

              {/* ================= IMPORTANT NOTE CARD (Matching screenshot 1) ================= */}
              <div className="border border-slate-200/90 rounded-2xl p-5 bg-white shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <Info className="w-4 h-4 text-[#800F17]" />
                  IMPORTANT NOTE
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-100 pt-3">
                  Note: There might be mild colour variation in the blouse and saree due to colour reproduction in camera and screen. There may be slight variations in the size & colour. Sizes mentioned are in inches.
                </p>
              </div>

              {/* ================= DISCOVER MORE BANNER (Matching screenshot 1) ================= */}
              <div className="border border-slate-200/90 rounded-2xl p-5 bg-gradient-to-r from-stone-50 via-white to-rose-50/20 shadow-2xs flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-block bg-[#800F17] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                    DISCOVER MORE
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    View more in <strong className="text-[#800F17]">{product.category}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Handpicked styles waiting for you
                  </p>
                </div>
                <Link
                  href={`/products?cat=${product.category?.toLowerCase().replace(/\s+/g, "-")}`}
                  className="w-11 h-11 rounded-full bg-[#800F17] hover:bg-[#660B12] text-white flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  title={`View ${product.category}`}
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM: YOU MAY ALSO LIKE (Matching screenshot 2) ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-200/80 space-y-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              You may also like
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  image={item.mainImage || "/images/product-1.jpg"}
                  category={item.category || "Exclusive"}
                  stock={item.stock}
                  href={`/products/${item.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
