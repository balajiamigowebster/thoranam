"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Check,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import { useQuickView } from "@/context/QuickViewContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getAssetUrl, getApiUrl } from "@/config";

// Global Rupee Formatter
function formatRupee(priceStr) {
  if (!priceStr) return "₹ 0";
  const str = String(priceStr).trim();
  const cleaned = str.replace(/^[?]|Rs\.?|₹|\s+/gi, "").trim();
  return `₹ ${cleaned}`;
}

function QuickViewModalContent({ product, closeQuickView }) {
  const { triggerAddToCartAnimation, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist() || {};
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [fullDetails, setFullDetails] = useState(null);

  // Fetch full details in background (for rich description & complete gallery)
  useEffect(() => {
    if (!product?.id) return;
    let active = true;
    fetch(getApiUrl(`/api/products/${product.id}`))
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && json.data) {
          setFullDetails(json.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [product?.id]);

  const activeProduct = fullDetails || product;

  // Resolve all images available for the gallery slider
  const images = useMemo(() => {
    if (!product) return ["/images/product-1.jpg"];
    const list = [];
    const mainImg = activeProduct?.mainImage || activeProduct?.image || product?.image;
    if (mainImg) list.push(mainImg);

    const gal = activeProduct?.galleryImages || activeProduct?.gallery_images || product?.galleryImages || product?.gallery_images;
    let parsedGal = [];
    if (Array.isArray(gal)) {
      parsedGal = gal;
    } else if (typeof gal === "string" && gal.trim()) {
      try {
        const parsed = JSON.parse(gal);
        if (Array.isArray(parsed)) parsedGal = parsed;
      } catch {
        parsedGal = [gal.trim()];
      }
    }

    parsedGal.forEach((img) => {
      if (img && !list.includes(img)) {
        list.push(img);
      }
    });

    return list.length > 0 ? list : ["/images/product-1.jpg"];
  }, [product, activeProduct]);

  const currentImage = images[selectedImageIdx] || images[0];
  const displayImage = getAssetUrl(currentImage) || "/images/product-1.jpg";
  const title = activeProduct?.title || product?.title || "Handcrafted Saree";
  const displayPrice = formatRupee(activeProduct?.price || product?.price);
  const originalPrice = activeProduct?.originalPrice || product?.originalPrice;
  const displayOriginalPrice = originalPrice ? formatRupee(originalPrice) : null;
  const productHref = product?.href || `/products/${product.id}`;

  const isWishlisted = isInWishlist && product.id ? isInWishlist(product.id) : false;

  const parsedStock =
    activeProduct?.stock !== undefined && activeProduct?.stock !== null
      ? Number(activeProduct.stock)
      : null;
  const isSoldOut = parsedStock !== null ? parsedStock <= 0 : false;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isSoldOut) return;

    setIsAdded(true);
    triggerAddToCartAnimation({
      startElementOrRect: e?.currentTarget,
      image: displayImage,
      item: {
        id: product.id,
        title,
        price: activeProduct?.price || product?.price,
        mainImage: displayImage,
        image: displayImage,
      },
      quantity,
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (isSoldOut) return;

    const itemToBuy = {
      id: product.id,
      title,
      price: activeProduct?.price || product?.price,
      mainImage: displayImage,
      image: displayImage,
      category: activeProduct?.category || product?.category,
    };

    // 1. Synchronously add product to cart with selected quantity
    if (addToCart) {
      addToCart(itemToBuy, quantity);
    }

    // 2. Close quick view modal
    closeQuickView();

    // 3. Check customer login state
    let isLoggedIn = false;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("thoranam_customer_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.email || parsed.id)) {
            isLoggedIn = true;
          }
        }
      } catch (err) {}
    }

    // 4. Immediate navigation
    if (isLoggedIn) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  const handleToggleWish = (e) => {
    e.preventDefault();
    if (toggleWishlist && product.id) {
      toggleWishlist({
        id: product.id,
        title,
        price: activeProduct?.price || product?.price,
        image: displayImage,
        mainImage: displayImage,
        category: activeProduct?.category || product?.category,
      });
    }
  };

  const description =
    activeProduct?.description ||
    product?.description ||
    "Handcrafted luxury saree woven with authentic heritage threads, featuring exquisite artistry, timeless drape, and premium festive grace.";

  return (
    <div
      className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-stone-200/80 dark:border-slate-800 my-auto text-stone-900 dark:text-stone-100 animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top-Right Close Button */}
      <button
        type="button"
        onClick={closeQuickView}
        aria-label="Close Quick View"
        className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-stone-100/90 dark:bg-slate-800/90 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-all cursor-pointer shadow-xs"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* ================= LEFT: Image Slider ================= */}
        <div className="relative aspect-[4/5] bg-stone-100 dark:bg-slate-800 overflow-hidden select-none">
          {/* Main Displayed Image */}
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover object-center transition-all duration-300"
            onError={(e) => {
              const currentSrc = e.currentTarget.getAttribute("src") || "";
              if (currentSrc.startsWith("/uploads/") && !e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = "true";
                e.currentTarget.src = `https://amigowebster.in/thoranam${currentSrc}`;
                return;
              }
              e.currentTarget.src = "/images/product-1.jpg";
            }}
          />

          {/* Discount / Tag Badge */}
          <div className="absolute top-3 left-3 z-20">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#800F17] text-white shadow-xs">
              {product?.tag || "-25% OFF"}
            </span>
          </div>

          {/* Carousel Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white text-stone-800 dark:text-stone-100 flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white text-stone-800 dark:text-stone-100 flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.2]" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === selectedImageIdx ? "w-5 bg-white shadow-xs" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT: Product Details & Fast Buy ================= */}
        <div className="p-5 sm:p-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Category Subtitle */}
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {activeProduct?.category || product?.category || "THORANAM EXCLUSIVE"}
            </p>

            {/* Title with Proza Libre font */}
            <h2
              style={{ fontFamily: '"Proza Libre", sans-serif' }}
              className="text-xl sm:text-2xl font-bold font-proza text-stone-900 dark:text-stone-50 leading-snug"
            >
              {title}
            </h2>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-0.5">
              {displayOriginalPrice && (
                <span className="text-sm sm:text-base text-stone-400 line-through">
                  {displayOriginalPrice}
                </span>
              )}
              <span className="text-xl sm:text-2xl font-bold text-[#800F17] dark:text-rose-300">
                {displayPrice}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Inclusive of all taxes
              </span>
            </div>

            {/* Saree Short Description */}
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
              {description}
            </p>

            {/* Stock Notice */}
            {isSoldOut ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Currently Sold Out</span>
              </div>
            ) : parsedStock !== null && parsedStock > 0 && parsedStock <= 10 ? (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Only {parsedStock} remaining in stock</span>
              </div>
            ) : null}

            {/* Quantity Selector */}
            {!isSoldOut && (
              <div className="pt-1 flex items-center gap-3">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Quantity:
                </span>
                <div className="inline-flex items-center border border-stone-200 dark:border-slate-700 rounded-lg bg-stone-50/80 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900 dark:text-stone-100">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        parsedStock ? Math.min(parsedStock, q + 1) : q + 1
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions: Add to Cart, Wishlist, BUY NOW, View Details */}
          <div className="space-y-2.5 pt-3 border-t border-stone-100 dark:border-slate-800">
            {/* Row: Add to Cart + Wishlist Heart */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  isSoldOut
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#800F17] hover:bg-[#680C13] text-white active:scale-[0.98]"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>ADDED TO CART</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isSoldOut ? "OUT OF STOCK" : "ADD TO CART"}</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={handleToggleWish}
                aria-label="Save to Wishlist"
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isWishlisted
                    ? "border-[#800F17] bg-[#800F17] text-white"
                    : "border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-600 hover:text-[#800F17] hover:border-[#800F17]"
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isWishlisted ? "fill-current scale-110" : ""
                  }`}
                />
              </button>
            </div>

            {/* Prominent BUY NOW Button (matching Screenshots 2 & 3) */}
            {!isSoldOut && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#941820] to-[#730D14] hover:from-[#7e141a] hover:to-[#5e0a10] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <span>BUY NOW</span>
                <div className="flex items-center gap-1.5 ml-2 opacity-90 text-[10px] font-normal lowercase">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                    Fast Checkout
                  </span>
                </div>
              </button>
            )}

            {/* View Full Details Link */}
            <div className="pt-2 text-center">
              <Link
                href={productHref}
                onClick={closeQuickView}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-[#800F17] dark:hover:text-rose-400 transition-colors"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickView();

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeQuickView();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeQuickView]);

  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={closeQuickView}
    >
      <QuickViewModalContent
        key={product.id || "qv-active"}
        product={product}
        closeQuickView={closeQuickView}
      />
    </div>
  );
}
