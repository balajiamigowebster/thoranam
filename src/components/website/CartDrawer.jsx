"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    totalCartCount,
  } = useCart();

  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percentage or fixed
  const [discountMsg, setDiscountMsg] = useState("");

  // Helper to parse price string or number (e.g., "Rs. 1,500.00" or "₹1,500" or 1500)
  const parsePrice = (priceVal) => {
    if (typeof priceVal === "number") return priceVal;
    if (!priceVal) return 1500; // sensible fallback
    const numeric = String(priceVal).replace(/[^0-9.]/g, "");
    return parseFloat(numeric) || 1500;
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = parsePrice(item.price);
    const qty = item.quantity || 1;
    return acc + price * qty;
  }, 0);

  const discountAmount = appliedDiscount > 0 ? (subtotal * appliedDiscount) / 100 : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    if (discountCode.trim().toUpperCase() === "THORANAM20" || discountCode.trim().toUpperCase() === "WELCOME") {
      setAppliedDiscount(20);
      setDiscountMsg("20% Boutique discount applied!");
    } else {
      setDiscountMsg("Invalid discount code");
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-[420px] bg-white shadow-2xl flex flex-col justify-between h-full animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-serif font-bold text-[#800F17] tracking-tight">
                Cart
              </h2>
              <span className="bg-rose-50 text-[#800F17] text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-100">
                {totalCartCount}
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors rounded-full hover:bg-stone-100"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-stone-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#800F17]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-stone-800">Your cart is empty</p>
                  <p className="text-xs text-stone-500">Discover our handcrafted sarees collection</p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800F17] text-white text-xs font-medium shadow-sm hover:bg-[#680b12] transition-colors"
                >
                  Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const itemPrice = parsePrice(item.price);
                const title = item.title || "Handcrafted Heritage Saree";
                const image = item.mainImage || item.image || "/images/product-1.jpg";
                const qty = item.quantity || 1;
                const itemId = item.id || `item-${index}`;

                return (
                  <div key={itemId} className="py-5 first:pt-2 flex gap-4 items-start">
                    {/* Saree Thumbnail */}
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60 shadow-xs">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.src = "/images/product-1.jpg";
                        }}
                      />
                    </div>

                    {/* Saree Details & Controls */}
                    <div className="flex-1 flex flex-col justify-between min-h-[96px]">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-stone-900 leading-snug line-clamp-2">
                            {title}
                          </h3>
                          <span className="text-xs font-semibold text-stone-900 shrink-0">
                            {formatCurrency(itemPrice * qty)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          {formatCurrency(itemPrice)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        {/* Quantity Pill */}
                        <div className="inline-flex items-center rounded-lg border border-[#800F17]/30 px-2 py-1 bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, -1)}
                            className="text-stone-500 hover:text-[#800F17] p-1 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[2]" />
                          </button>
                          <span className="text-xs font-semibold text-stone-800 px-3 min-w-[20px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, 1)}
                            className="text-stone-500 hover:text-[#800F17] p-1 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[2]" />
                          </button>
                        </div>

                        {/* Trash Delete */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(itemId)}
                          className="text-stone-400 hover:text-rose-700 p-1.5 transition-colors rounded-md hover:bg-rose-50"
                          aria-label="Remove item"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Summary */}
          {cartItems.length > 0 && (
            <div className="border-t border-stone-200/80 px-6 py-5 bg-stone-50/50 space-y-4">
              {/* Discount Accordion */}
              <div className="border-b border-stone-200/60 pb-3">
                <button
                  type="button"
                  onClick={() => setDiscountOpen(!discountOpen)}
                  className="w-full flex items-center justify-between text-xs font-medium text-stone-700 hover:text-[#800F17] transition-colors"
                >
                  <span className="font-semibold text-stone-800">Discount</span>
                  <span className="text-sm leading-none font-bold text-stone-500">
                    {discountOpen ? "−" : "+"}
                  </span>
                </button>

                {discountOpen && (
                  <form onSubmit={handleApplyDiscount} className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="e.g. THORANAM20"
                        className="flex-1 text-xs px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:border-[#800F17] text-stone-800"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-stone-800 text-white text-xs font-semibold rounded-lg hover:bg-[#800F17] transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {discountMsg && (
                      <p className={`text-[11px] ${appliedDiscount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {discountMsg}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Estimated Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-800">
                  Estimated total
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {formatCurrency(estimatedTotal)} INR
                </span>
              </div>

              <p className="text-[11px] text-stone-400">
                Taxes and shipping calculated at checkout.
              </p>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full block py-3.5 px-4 bg-[#800F17] hover:bg-[#6a0c13] active:scale-[0.99] text-white text-center font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_16px_rgba(128,15,23,0.3)] transition-all cursor-pointer"
              >
                CHECK OUT
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
