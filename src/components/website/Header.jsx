"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import ThoranamLogo from "@/components/ui/ThoranamLogo";
import { INITIAL_CATEGORIES, getStoredCategories } from "@/lib/categories";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const { totalCartCount, badgeBump } = useCart();

  useState(() => {
    if (typeof window !== "undefined") {
      setCategories(getStoredCategories());
    }
  });

  return (
    <header className="w-full sticky top-0 z-40 bg-white shadow-xs">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Deep Maroon Luxury Header Band */}
      <div className="bg-[#800F17] text-white py-3 sm:py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Mobile hamburger & Search Icon */}
          <div className="flex items-center gap-3 w-1/3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-white/90 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-white/90 hover:text-white transition-colors cursor-pointer"
              aria-label="Search sarees"
            >
              <Search className="w-5 h-5 sm:w-5 sm:h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* Center: Thoranam Luxury Saree Boutique Logo */}
          <div className="flex justify-center w-1/3">
            <ThoranamLogo />
          </div>

          {/* Right: Account & Cart Icons */}
          <div className="flex items-center justify-end gap-4 sm:gap-5 w-1/3">
            <Link
              href="/dashboard"
              className="text-white/90 hover:text-white transition-colors p-1"
              aria-label="Admin Dashboard"
            >
              <User className="w-5 h-5 stroke-[1.8]" />
            </Link>

            <Link
              id="header-cart-icon-btn"
              href="/products"
              className={`relative text-white/90 hover:text-white transition-all p-1.5 rounded-full ${
                badgeBump
                  ? "scale-125 bg-white/20 text-amber-300 ring-2 ring-amber-400/50"
                  : "hover:scale-105"
              }`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag
                className={`w-5 h-5 stroke-[1.8] transition-transform duration-300 ${
                  badgeBump ? "rotate-[-12deg] scale-110" : ""
                }`}
              />
              <span
                className={`absolute -top-1 -right-1 bg-amber-400 text-[#800F17] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  badgeBump
                    ? "scale-140 bg-amber-300 ring-4 ring-amber-400/50 animate-bounce"
                    : ""
                }`}
              >
                {totalCartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="max-w-md mx-auto mt-3 px-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Silk, Mangalagiri, Cotton..."
                className="w-full bg-white text-slate-800 text-sm px-4 py-2 rounded-full outline-none placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Navbar */}
      <Suspense fallback={<div className="h-10 bg-white" />}>
        <Navbar />
      </Suspense>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[110px] bg-slate-900/60 z-50 backdrop-blur-xs">
          <div className="bg-white w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Collections
              </p>
              <ul className="space-y-3">
                {categories.map((item) => (
                  <li key={item.id || item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-base font-medium text-slate-800 hover:text-[#800F17] py-1 border-b border-slate-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Need assistance?</p>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl bg-[#800F17] text-white text-sm font-medium"
              >
                Contact Boutique
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
