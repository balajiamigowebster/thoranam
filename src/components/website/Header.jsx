"use client";

import { Suspense, useState, useEffect } from "react";
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
  const { totalCartCount, badgeBump, openCart, isMounted } = useCart();

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
          try {
            localStorage.setItem("thoranam_categories", JSON.stringify(json.data));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCats();

    const handleSync = () => {
      setCategories(getStoredCategories());
    };
    window.addEventListener("thoranam_categories_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("thoranam_categories_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  return (
    <header className="w-full sticky top-0 z-40 bg-white shadow-xs">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Luxury Header Band */}
      <div className="bg-[#890e0e] text-white py-3.5 sm:py-4 px-4 sm:px-8">
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
          <div className="flex items-center justify-end gap-3 sm:gap-4 w-1/3">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              aria-label="Customer Login"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGIN</span>
            </Link>

            <button
              id="header-cart-icon-btn"
              type="button"
              onClick={openCart}
              className={`relative text-white/90 hover:text-white transition-all p-1.5 rounded-full cursor-pointer ${
                badgeBump
                  ? "scale-125 bg-white/20 text-amber-300 ring-2 ring-amber-400/50"
                  : "hover:scale-105"
              }`}
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag
                className={`w-5 h-5 stroke-[1.8] transition-transform duration-300 ${
                  badgeBump ? "rotate-[-12deg] scale-110" : ""
                }`}
              />
              <span
                suppressHydrationWarning
                className={`absolute -top-1 -right-1 bg-amber-400 text-[#890e0e] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  badgeBump
                    ? "scale-140 bg-amber-300 ring-4 ring-amber-400/50 animate-bounce"
                    : ""
                }`}
              >
                {isMounted ? totalCartCount : 1}
              </span>
            </button>
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
        <div className="md:hidden fixed inset-0 top-[110px] bg-slate-900/60 z-50 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-[85%] max-w-sm h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-100">
                <span className="text-[11px] font-bold text-[#890e0e] uppercase tracking-widest">
                  Collections & Sarees
                </span>
                <span className="text-[10px] bg-rose-50 text-[#890e0e] px-2 py-0.5 rounded-full font-semibold">
                  {categories.length} Categories
                </span>
              </div>

              <ul className="space-y-1.5">
                {categories.map((item, idx) => (
                  <li key={item.id || item.label || idx}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2 rounded-xl text-stone-800 hover:text-[#890e0e] hover:bg-rose-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-300 shrink-0 bg-stone-100">
                          <img
                            src={item.image || `/images/product-${(idx % 4) + 1}.jpg`}
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium capitalize">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-stone-400 text-xs font-bold">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 mb-2">Need boutique assistance?</p>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-xl bg-[#890e0e] hover:bg-[#6e0a0a] text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
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
