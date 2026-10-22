"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { HOMEPAGE_BROWSE_CATEGORIES, getStoredBrowseCategories } from "@/lib/categories";
import { getApiUrl } from "@/config";

export default function HomeCategory() {
  const [categories, setCategories] = useState(getStoredBrowseCategories);

  useEffect(() => {
    // 1. Fetch live categories from database
    async function loadBrowseCategories() {
      try {
        const res = await fetch(getApiUrl("/api/categories/browse"));
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
          try {
            localStorage.setItem("thoranam_browse_categories", JSON.stringify(json.data));
          } catch (e) {}
        }
      } catch (e) {
        console.error("Failed to load browse categories from API:", e);
      }
    }
    loadBrowseCategories();

    // 2. Keep 8 saree circular categories synchronized from localStorage if edited in dashboard
    const syncCategories = () => {
      try {
        const stored = localStorage.getItem("thoranam_browse_categories");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener("thoranam_browse_categories_updated", syncCategories);
    window.addEventListener("storage", syncCategories);
    return () => {
      window.removeEventListener("thoranam_browse_categories_updated", syncCategories);
      window.removeEventListener("storage", syncCategories);
    };
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-slate-950 overflow-hidden">
      <Container>
        {/* Section Heading & Subheading */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1 sm:space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-[#800F17] uppercase">
            BROWSE OUR CATEGORIES
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Explore our collections and find your perfect saree for every occasion
          </p>
        </div>

        {/* 
          Mobile Responsive:
          - Mobile / Tablet: Smooth horizontal carousel with scrollbar hidden and touch snapping
          - Desktop (lg+): 8-column grid perfectly aligned
        */}
        <div className="w-full overflow-x-auto no-scrollbar scroll-smooth pb-3 px-1">
          <div className="flex lg:grid lg:grid-cols-8 items-start justify-start lg:justify-items-center gap-4 sm:gap-6 lg:gap-3 min-w-max lg:min-w-0">
            {categories.map((cat, idx) => {
              const categoryImage = cat.image || `/images/product-${(idx % 4) + 1}.jpg`;
              const label = cat.label || cat.name;

              return (
                <Link
                  key={cat.id || idx}
                  href={cat.href || `/products?cat=${cat.id}`}
                  className="group flex flex-col items-center text-center w-[84px] sm:w-24 md:w-28 lg:w-full focus:outline-none transition-transform duration-300"
                >
                  {/* Circular Image Container with Gold Gradient Border */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-22 lg:h-22 xl:w-24 xl:h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] shadow-sm group-hover:shadow-[0_8px_25px_rgba(128,15,23,0.3)] group-hover:scale-105 transition-all duration-300 ease-out cursor-pointer">
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-amber-50/50 flex items-center justify-center">
                      <Image
                        src={categoryImage}
                        alt={label}
                        fill
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 110px"
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                        priority={idx < 4}
                      />
                      {/* Subtle hover golden highlight */}
                      <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none" />
                    </div>
                  </div>

                  {/* Category Title matching reference */}
                  <span className="mt-2 text-[11px] sm:text-xs font-medium text-[#800F17] dark:text-rose-300 leading-tight group-hover:text-rose-950 dark:group-hover:text-white group-hover:font-semibold transition-all duration-200 text-center line-clamp-2 px-0.5 capitalize">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

