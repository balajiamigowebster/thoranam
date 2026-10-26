"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Heart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getAssetUrl } from "@/config";

// Global Rupee Formatter to fix ? or corrupted currency strings
function formatRupee(priceStr) {
  if (!priceStr) return "₹ 0";
  const str = String(priceStr).trim();
  const cleaned = str.replace(/^[?]|Rs\.?|₹|\s+/gi, "").trim();
  return `₹ ${cleaned}`;
}

export default function ProductCard({
  id,
  title,
  price,
  originalPrice,
  image,
  tag,
  category,
  stock,
  href,
  className = "",
}) {
  const { triggerAddToCartAnimation } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productHref = href || `/products/${id}`;
  const displayImage = getAssetUrl(image) || "/images/product-1.jpg";
  const displayTag = tag || category;
  const displayPrice = formatRupee(price);
  const displayOriginalPrice = originalPrice ? formatRupee(originalPrice) : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdded(true);
    triggerAddToCartAnimation({
      startElementOrRect: e?.currentTarget,
      image: displayImage,
      item: {
        id,
        title,
        price,
        mainImage: displayImage,
        image: displayImage,
      },
      quantity: 1,
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border border-stone-200/80 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(128,15,23,0.14)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer ${className}`}
    >
      {/* Luxury Golden Border Glow on Hover */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-amber-300/60 pointer-events-none transition-colors duration-300 z-30" />

      {/* Top Product Image Showcase Frame (Tall Luxury 4:5 Portrait Aspect Ratio with Lazy Loading) */}
      <div className="relative aspect-[4/5] w-full rounded-lg sm:rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-800">
        <Link href={productHref} prefetch={false} className="block w-full h-full relative">
          <img
            src={displayImage}
            alt={title || "Thoranam Saree"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={(e) => {
              e.currentTarget.src = "/images/product-1.jpg";
            }}
          />

          {/* Luxury soft vignette gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Top-Left: Badge Tag */}
        {displayTag && (
          <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 z-20">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-[#800F17] dark:text-rose-300 shadow-sm border border-stone-200/50 dark:border-slate-700/50 backdrop-blur-md">
              {displayTag}
            </span>
          </div>
        )}

        {/* Top-Right: Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 ${
            isWishlisted
              ? "bg-[#800F17] text-white opacity-100"
              : "bg-white/90 dark:bg-slate-900/90 text-stone-600 dark:text-stone-300 hover:text-[#800F17] opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
              isWishlisted ? "fill-current scale-110" : ""
            }`}
          />
        </button>

        {/* Bottom-Right: Floating Add-To-Cart Circular Action Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label="Add saree to cart"
          title="Add to Cart"
          className={`absolute bottom-1.5 sm:bottom-2.5 right-1.5 sm:right-2.5 z-20 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 shadow-md cursor-pointer border ${
            isAdded
              ? "bg-emerald-600 text-white border-emerald-500 ring-2 sm:ring-4 ring-emerald-400/30 scale-105"
              : "bg-white dark:bg-slate-900 text-stone-800 dark:text-stone-100 hover:bg-[#800F17] hover:text-white border-stone-200/80 dark:border-slate-700 group/cartbtn"
          }`}
        >
          {isAdded ? (
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-in zoom-in duration-200" />
          ) : (
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.9] transition-transform duration-300 group-hover/cartbtn:scale-110" />
          )}
        </button>
      </div>

      {/* Saree Meta / Info Section */}
      <div className="pt-2 sm:pt-3.5 pb-1 sm:pb-2 px-1 sm:px-1.5 flex-1 flex flex-col justify-between space-y-1 sm:space-y-2">
        <Link
          href={productHref}
          prefetch={false}
          className="group-hover:text-[#800F17] transition-colors duration-200"
        >
          <h3 className="text-[11px] sm:text-[14px] font-medium text-stone-800 dark:text-stone-100 line-clamp-2 leading-tight sm:leading-snug">
            {title}
          </h3>
        </Link>

        {/* Price & Optional Stock / Availability */}
        <div className="flex items-center justify-between pt-0.5 sm:pt-1">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
            <span className="text-xs sm:text-base font-extrabold text-[#800F17] dark:text-rose-400 tracking-tight">
              {displayPrice}
            </span>
            {displayOriginalPrice && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                {displayOriginalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
