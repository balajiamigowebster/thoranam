"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, X, ChevronDown, LogOut } from "lucide-react";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import ThoranamLogo from "@/components/ui/ThoranamLogo";
import { INITIAL_CATEGORIES, getStoredCategories } from "@/lib/categories";
import { MAIN_NAV_MENUS, buildNavMenus } from "@/lib/navigation";
import { useCart } from "@/context/CartContext";
import { getApiUrl } from "@/config";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState(() =>
    typeof window !== "undefined" ? getStoredCategories() : INITIAL_CATEGORIES
  );
  const [customer, setCustomer] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { totalCartCount, badgeBump, openCart, isMounted } = useCart();

  useEffect(() => {
    let timer = null;
    async function loadCats() {
      try {
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        if (controller) timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(getApiUrl("/api/categories"), {
          signal: controller?.signal,
        });
        if (timer) clearTimeout(timer);
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
        if (timer) clearTimeout(timer);
        // Silently use stored categories
      }
    }
    loadCats();

    const handleSync = () => {
      setCategories(getStoredCategories());
    };

    const syncCustomer = () => {
      try {
        const stored = localStorage.getItem("thoranam_customer_user");
        if (stored) {
          setCustomer(JSON.parse(stored));
        } else {
          setCustomer(null);
        }
      } catch (err) {
        setCustomer(null);
      }
    };

    syncCustomer();

    window.addEventListener("thoranam_categories_updated", handleSync);
    window.addEventListener("thoranam_customer_auth_changed", syncCustomer);
    window.addEventListener("storage", handleSync);
    window.addEventListener("storage", syncCustomer);

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("thoranam_categories_updated", handleSync);
      window.removeEventListener("thoranam_customer_auth_changed", syncCustomer);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("storage", syncCustomer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("thoranam_customer_token");
      localStorage.removeItem("thoranam_customer_user");
      document.cookie = "thoranam_customer_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {}
    setCustomer(null);
    setUserMenuOpen(false);
    window.dispatchEvent(new Event("thoranam_customer_auth_changed"));
  };

  const navMenus = buildNavMenus(categories);

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
            {isMounted && customer ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer max-w-[140px] sm:max-w-[180px]"
                  title={customer.name || customer.email}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {customer.name?.trim().split(" ")[0] || "MY ACCOUNT"}
                  </span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 text-stone-800">
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {customer.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {customer.email}
                      </p>
                    </div>

                    <Link
                      href="/checkout"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-3.5 py-2 text-xs text-stone-700 hover:bg-rose-50 hover:text-[#890e0e] flex items-center gap-2 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-stone-400" />
                      <span>My Cart / Checkout</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 transition-colors cursor-pointer text-left border-t border-stone-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                aria-label="Customer Login"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LOGIN</span>
              </Link>
            )}

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

      {/* 3. Category Navbar (Desktop / Tablet only - hidden on mobile view) */}
      <Suspense fallback={<div className="hidden md:block h-10 bg-white" />}>
        <div className="hidden md:block">
          <Navbar categories={categories} />
        </div>
      </Suspense>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[96px] bg-slate-900/60 z-50 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white w-[85%] max-w-sm h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-100">
                <span className="text-[11px] font-bold text-[#890e0e] uppercase tracking-widest">
                  Collections & Sarees
                </span>
                <span className="text-[10px] bg-rose-50 text-[#890e0e] px-2 py-0.5 rounded-full font-semibold">
                  {navMenus.length} Categories
                </span>
              </div>

              <ul className="space-y-1">
                {navMenus.map((item, idx) => (
                  <li key={item.id || idx} className="rounded-xl overflow-hidden border border-rose-50/60 bg-stone-50/30">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 text-stone-800 hover:text-[#890e0e] hover:bg-rose-50/60 transition-colors font-medium text-xs sm:text-sm"
                    >
                      <span className="font-semibold text-stone-900">{item.label}</span>
                      <span className="text-[10px] text-[#890e0e] bg-rose-50 px-2 py-0.5 rounded-full">
                        {item.subcategories?.length || 0}
                      </span>
                    </Link>

                    {item.subcategories && item.subcategories.length > 0 && (() => {
                      const isCapped = item.id === "thoranam-collection" || item.subcategories.length > 10;
                      const subs = isCapped ? item.subcategories.slice(0, 10) : item.subcategories;

                      return (
                        <div className="bg-white/70 px-3 py-1.5 border-t border-rose-50 space-y-1">
                          {subs.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-1 px-1.5 text-[11px] sm:text-xs text-stone-600 hover:text-[#890e0e] hover:translate-x-1 transition-all"
                            >
                              • {sub.label}
                            </Link>
                          ))}
                          {isCapped && (
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-1.5 px-2 text-center text-[11px] font-semibold text-[#890e0e] bg-rose-50/80 hover:bg-rose-100/80 rounded-lg mt-1 transition-colors"
                            >
                              Browse All {item.label} ({item.subcategories.length}) →
                            </Link>
                          )}
                        </div>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              {isMounted && customer ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    Hi, {customer.name || "Customer"}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate mb-2">
                    {customer.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-900 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
                >
                  Sign In / Register
                </Link>
              )}
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
