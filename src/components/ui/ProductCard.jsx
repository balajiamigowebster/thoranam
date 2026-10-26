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

  // Safe stock calculation
  const parsedStock =
    stock !== undefined && stock !== null && !isNaN(Number(stock))
      ? Number(stock)
      : null;
  const isSoldOut = parsedStock !== null ? parsedStock <= 0 : false;
  const isLowStock = !isSoldOut && parsedStock !== null && parsedStock > 0 && parsedStock <= 10;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) return;

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
      className={`group relative bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-stone-200/80 dark:border-slate-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(128,15,23,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer ${className}`}
    >
      {/* Luxury Subtle Gold Glow on Hover */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-amber-300/50 pointer-events-none transition-colors duration-300 z-30" />

      {/* Top Product Image Container */}
      <div className="relative aspect-[4/5] w-full rounded-lg sm:rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-800">
        <Link href={productHref} prefetch={false} className="block w-full h-full relative">
          <img
            src={displayImage}
            alt={title || "Thoranam Saree"}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ease-out ${
              isSoldOut ? "opacity-85 grayscale-[15%]" : ""
            }`}
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

          {/* Vignette on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* Top-Right Badge: SOLD OUT takes precedence */}
        {isSoldOut ? (
          <div className="absolute top-2 right-2 z-20">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-stone-800/90 text-white shadow-xs backdrop-blur-xs">
              SOLD OUT
            </span>
          </div>
        ) : displayTag ? (
          <div className="absolute top-2 left-2 z-20">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 text-[#800F17] dark:text-rose-300 shadow-xs border border-stone-200/50 backdrop-blur-xs">
              {displayTag}
            </span>
          </div>
        ) : null}

        {/* Top-Right: Wishlist Button (only when not sold out) */}
        {!isSoldOut && (
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2 right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-90 ${
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
        )}
      </div>

      {/* Saree Meta / Info Area matching Screenshots 1 & 2 */}
      <div className="pt-2.5 sm:pt-3 pb-1 px-1 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {/* Subtitle: Category or Brand */}
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
            {category ? category.toUpperCase() : "THORANAM SAREES"}
          </p>

          {/* Title */}
          <Link
            href={productHref}
            prefetch={false}
            className="block group-hover:text-[#800F17] transition-colors duration-200"
          >
            <h3 className="text-xs sm:text-sm font-serif font-medium text-stone-800 dark:text-stone-100 line-clamp-1 leading-snug">
              {title}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {displayPrice}
            </span>
            {displayOriginalPrice && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                {displayOriginalPrice}
              </span>
            )}
          </div>

          {/* Availability / Urgency Warning Row */}
          <div className="min-h-[18px] flex items-center">
            {isSoldOut ? (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                <span>Sold Out</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-700 dark:text-amber-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>Only {parsedStock} left</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Button: Full-width matching Screenshots 1 & 2 */}
        <div className="pt-1">
          {isSoldOut ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full py-2.5 px-3 rounded-lg bg-[#800F17]/45 text-white/90 text-xs font-bold uppercase tracking-wider cursor-not-allowed text-center select-none shadow-none"
            >
              SOLD OUT
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${
                isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-[#800F17] hover:bg-[#680C13] text-white"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>ADD TO CART</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
