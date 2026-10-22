"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  INITIAL_CATEGORIES,
  getStoredCategories,
} from "@/lib/categories";
import { getApiUrl } from "@/config";

export default function Navbar({ className = "" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState(getStoredCategories);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    // 1. Fetch live categories directly from Database
    async function fetchDbCategories() {
      try {
        const res = await fetch(getApiUrl("/api/categories"));
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
          try {
            localStorage.setItem("thoranam_categories", JSON.stringify(json.data));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchDbCategories();

    // 2. Listen for live updates when modified in Admin Dashboard
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
    <nav
      className={`w-full bg-white border-b border-rose-100/70 shadow-xs relative ${className}`}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      {/* 
        Container:
        - Mobile/Tablet: Horizontal smooth swipe with scrollbar hidden
        - Desktop: Centered, auto-fitting flex layout with compact gaps so every category (first to last) is 100% fully visible without clipping
      */}
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4">
        <ul className="flex items-center justify-start lg:justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-3.5 xl:gap-5 py-2.5 sm:py-3 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((item) => {
            const currentCat = searchParams.get("cat");
            const itemCat = item.href?.split("cat=")[1];
            const isActive = currentCat === itemCat;
            const isHovered = hoveredCategory?.id === item.id;

            return (
              <li
                key={item.id || item.label}
                onMouseEnter={() => setHoveredCategory(item)}
                className="shrink-0 relative py-0.5"
              >
                <Link
                  href={item.href}
                  className={`text-[11px] sm:text-xs lg:text-[11.5px] xl:text-[12.5px] font-medium tracking-normal transition-all relative py-1 px-1 sm:px-1.5 md:px-2 rounded-md whitespace-nowrap flex items-center capitalize ${
                    isActive || isHovered
                      ? "text-[#890e0e] font-bold bg-rose-50/80"
                      : "text-stone-700 hover:text-[#890e0e] hover:bg-stone-50"
                  }`}
                >
                  {item.label}
                  {(isActive || isHovered) && (
                    <span className="absolute -bottom-1 left-1.5 right-1.5 h-[2px] bg-[#890e0e] rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Luxury Mega Menu Dropdown */}
      {hoveredCategory && (hoveredCategory.subcategories?.length > 0 || hoveredCategory.showcase?.length > 0) && (
        <div
          className="hidden md:block absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-rose-100 shadow-xl z-50 transition-all duration-200 animate-in fade-in slide-in-from-top-1"
          onMouseEnter={() => setHoveredCategory(hoveredCategory)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Left Column: Subcategories List */}
              <div className="col-span-4 border-r border-rose-100/70 pr-6 space-y-3">
                <div className="border-b border-rose-100 pb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#890e0e]">
                    {hoveredCategory.label}
                  </h4>
                  <Link
                    href={hoveredCategory.href}
                    className="text-[11px] text-[#890e0e] hover:underline font-semibold"
                  >
                    View All
                  </Link>
                </div>

                <ul className="space-y-2 pt-1">
                  {hoveredCategory.subcategories?.map((sub, idx) => (
                    <li key={idx}>
                      <Link
                        href={sub.href || `${hoveredCategory.href}&sub=${sub.label.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-xs sm:text-sm font-normal text-rose-950/80 hover:text-[#890e0e] hover:font-semibold hover:translate-x-1 transition-all inline-flex items-center gap-1.5 py-0.5"
                      >
                        <ChevronRight className="w-3 h-3 text-[#890e0e]/50" />
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Featured Saree Showcase */}
              <div className="col-span-8 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Featured Handpicked Sarees
                  </span>
                  <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Boutique Exclusives
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-5 pt-1">
                  {(hoveredCategory.showcase || []).slice(0, 3).map((item, idx) => (
                    <Link
                      key={idx}
                      href={hoveredCategory.href}
                      className="group block bg-stone-50/60 rounded-xl p-2.5 border border-rose-50 hover:border-rose-200 hover:shadow-md transition-all"
                    >
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 relative mb-2.5">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h5 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-[#890e0e] transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-xs font-bold text-[#890e0e] mt-1">
                        {item.price}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
