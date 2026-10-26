"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { MAIN_NAV_MENUS } from "@/lib/navigation";
import { getApiUrl } from "@/config";

export default function Navbar({ className = "" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navMenus, setNavMenus] = useState(MAIN_NAV_MENUS);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  useEffect(() => {
    // Defer non-critical category showcase enrichment until main thread is idle
    const idleTimer = setTimeout(() => {
      async function enrichCategories() {
        let timer = null;
        try {
          const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
          if (controller) timer = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(getApiUrl("/api/categories"), {
            signal: controller?.signal,
          });
          if (timer) clearTimeout(timer);
          const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Keep the 6 main menus as top-level and enrich subcategories or showcases
          const catMap = new Map();
          json.data.forEach((c) => {
            catMap.set(c.id, c);
            catMap.set(c.label?.toLowerCase(), c);
          });

          setNavMenus((prev) =>
            prev.map((menu) => {
              const enrichedSub = (menu.subcategories || []).map((sub) => {
                const match = catMap.get(sub.label?.toLowerCase());
                return {
                  ...sub,
                  image: match?.image || "",
                  count: match?.product_count,
                };
              });

              // Also collect showcase items
              const showcase = [];
              enrichedSub.forEach((sub) => {
                if (sub.image && showcase.length < 3) {
                  showcase.push({
                    title: sub.label,
                    image: sub.image,
                    href: sub.href,
                  });
                }
              });

              return {
                ...menu,
                subcategories: enrichedSub,
                showcase: showcase.length > 0 ? showcase : undefined,
              };
            })
          );
        }
      } catch (err) {
        console.warn("Could not enrich navbar menus:", err);
      }
    }
    enrichCategories();
    }, 4500);

    return () => clearTimeout(idleTimer);
  }, []);

  return (
    <nav
      className={`hidden md:block w-full bg-white border-b border-rose-100/70 shadow-xs relative ${className}`}
      onMouseLeave={() => setHoveredMenu(null)}
    >
      {/* 
        Container:
        - Mobile/Tablet: Horizontal smooth swipe with scrollbar hidden
        - Desktop: Centered, balanced spacing displaying only the 6 primary menus
      */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-start md:justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 py-3 overflow-x-auto no-scrollbar scroll-smooth">
          {navMenus.map((item) => {
            const currentCat = searchParams.get("cat");
            const itemCat = item.href?.split("cat=")[1];
            const isActive = currentCat === itemCat;
            const isHovered = hoveredMenu?.id === item.id;
            const hasSub = item.subcategories && item.subcategories.length > 0;

            return (
              <li
                key={item.id || item.label}
                onMouseEnter={() => setHoveredMenu(item)}
                className="shrink-0 relative py-1"
              >
                <Link
                  href={item.href}
                  className={`text-xs sm:text-sm font-semibold tracking-normal transition-all relative py-1.5 px-2.5 sm:px-3 rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
                    isActive || isHovered
                      ? "text-[#890e0e] bg-rose-50/80"
                      : "text-stone-700 hover:text-[#890e0e] hover:bg-stone-50"
                  }`}
                >
                  <span>{item.label}</span>
                  {hasSub && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 opacity-60 ${
                        isHovered ? "rotate-180 text-[#890e0e]" : ""
                      }`}
                    />
                  )}
                  {(isActive || isHovered) && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#890e0e] rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Luxury Dropdown Mega Menu for Submenus */}
      {hoveredMenu && hoveredMenu.subcategories && hoveredMenu.subcategories.length > 0 && (
        <div
          className="hidden md:block absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-rose-100 shadow-2xl z-50 transition-all duration-200 animate-in fade-in slide-in-from-top-1"
          onMouseEnter={() => setHoveredMenu(hoveredMenu)}
          onMouseLeave={() => setHoveredMenu(null)}
        >
          <div className="max-w-7xl mx-auto px-8 py-7">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#890e0e]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#890e0e]">
                  {hoveredMenu.label} Collections
                </h3>
                <span className="text-xs bg-rose-50 text-[#890e0e] px-2.5 py-0.5 rounded-full font-semibold border border-rose-200/60">
                  {hoveredMenu.subcategories.length} varieties
                </span>
              </div>
              <Link
                href={hoveredMenu.href}
                className="text-xs text-[#890e0e] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Browse All {hoveredMenu.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Submenu Links Grid */}
            <div
              className={`grid gap-x-8 gap-y-3 ${
                hoveredMenu.subcategories.length > 8
                  ? "grid-cols-3"
                  : hoveredMenu.subcategories.length > 4
                  ? "grid-cols-2"
                  : "grid-cols-2 max-w-2xl"
              }`}
            >
              {hoveredMenu.subcategories.map((sub, idx) => (
                <Link
                  key={idx}
                  href={sub.href}
                  className="group flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-rose-100 hover:bg-rose-50/50 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-300 group-hover:bg-[#890e0e] transition-colors" />
                    <span className="text-xs sm:text-sm font-medium text-stone-700 group-hover:text-[#890e0e] group-hover:font-semibold transition-colors">
                      {sub.label}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#890e0e] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
