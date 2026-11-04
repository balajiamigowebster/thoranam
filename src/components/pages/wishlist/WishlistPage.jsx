"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowLeft, Trash2, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlistItems, clearWishlist, totalCount, isMounted } = useWishlist();
  const { triggerAddToCartAnimation } = useCart();

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;
    wishlistItems.forEach((item) => {
      triggerAddToCartAnimation({
        image: item.image || item.mainImage || "/images/product-1.jpg",
        item,
        quantity: 1,
      });
    });
  };

  return (
    <div className="py-10 sm:py-16 bg-stone-50/50 min-h-[75vh]">
      <Container>
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#800F17] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          {isMounted && totalCount > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-[#800F17] ring-8 ring-rose-50/50 mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            My Saved Saree Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {isMounted && totalCount > 0
              ? `You have saved ${totalCount} handcrafted ${totalCount === 1 ? "saree" : "sarees"} to your boutique favorites.`
              : "Keep track of your favorite silk and handcrafted sarees in one place."}
          </p>
        </div>

        {/* Content */}
        {!isMounted || totalCount === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80 shadow-sm space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Your wishlist is empty
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore our festive silk sarees and handloom weaves, then tap the heart icon on any saree to save it here.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#800F17] hover:bg-[#680b12] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
            >
              <span>Explore Boutique Sarees</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/70 shadow-xs">
              <span className="text-xs font-semibold text-stone-700">
                Showing <strong className="text-stone-900">{totalCount}</strong> favorite {totalCount === 1 ? "item" : "items"}
              </span>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#800F17] hover:bg-[#680b12] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add All to Cart</span>
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlistItems.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  image={item.image || item.mainImage}
                  galleryImages={item.galleryImages || item.gallery_images}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

