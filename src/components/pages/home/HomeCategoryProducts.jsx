"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { INITIAL_CATEGORIES } from "@/lib/categories";
import { getStoredProducts, fetchProductsFromDb } from "@/lib/products";

// Top-level umbrella parent menu categories that should NOT appear as collection sections
const PARENT_CATEGORY_KEYS = [
  "semi-silk",
  "semi-silk-sarees",
  "pure-cotton",
  "silk-sarees",
  "new-arrivals",
  "exotic-cotton",
  "exotic-cotton-sarees",
  "thoranam-collection",
  "thoranam-exclusive",
];

// Single Category Showcase Row with Premium Carousel & Navigation Arrows
function CategorySection({ submenu, items, idx }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    // Allow slight tolerance of 6px
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    // Timeout to recalculate when cards and images mount
    const timer = setTimeout(checkScroll, 350);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [items]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const firstCard = container.querySelector(":scope > div");
    const gap = window.innerWidth >= 1024 ? 28 : window.innerWidth >= 768 ? 24 : 14;
    const cardWidth = firstCard ? firstCard.offsetWidth : 280;
    // On desktop slide 2 cards, on mobile/tablet slide 1-2 cards
    const isDesktop = window.innerWidth >= 1024;
    const scrollStep = (cardWidth + gap) * (isDesktop ? 2 : 1);

    container.scrollBy({
      left: direction === "next" ? scrollStep : -scrollStep,
      behavior: "smooth",
    });
  };

  const submenuName = submenu.label || submenu.name;
  const submenuHref =
    submenu.href ||
    `/products?cat=${encodeURIComponent(submenu.id || submenuName)}`;

  const hasMultipleProducts = items.length > 4;

  return (
    <div
      className={`space-y-6 sm:space-y-8 ${
        idx > 0 ? "pt-12 sm:pt-16 border-t border-rose-100/70 dark:border-slate-800" : ""
      }`}
    >
      {/* Submenu Header Row: Title & Subtitle on Left, Arrows & 'View More' on Right */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#800F17] bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-100/80 dark:border-rose-900/50">
              <Sparkles className="w-3 h-3 text-[#AA771C]" />
              Collection {String(idx + 1).padStart(2, "0")}
            </span>
            {items.length > 4 && (
              <span className="text-[11px] font-semibold text-rose-800/80 bg-rose-100/70 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full">
                {items.length} Designs
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#800F17] dark:text-rose-100 uppercase font-serif">
            {submenuName}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            Handcrafted luxury sarees woven with timeless heritage and contemporary grace
          </p>
        </div>

        {/* Right side: Premium Carousel Arrows + View More Button */}
        <div className="flex items-center gap-3 self-start sm:self-end">
          {/* Left / Right Carousel Arrows (Active whenever products exceed screen or 4+) */}
          {(hasMultipleProducts || canScrollLeft || canScrollRight) && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleScroll("prev")}
                disabled={!canScrollLeft}
                aria-label={`Previous ${submenuName} products`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#800F17] dark:text-rose-200 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-slate-700 hover:border-[#800F17] disabled:opacity-25 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Previous products"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("next")}
                disabled={!canScrollRight}
                aria-label={`Next ${submenuName} products`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-rose-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#800F17] dark:text-rose-200 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-slate-700 hover:border-[#800F17] disabled:opacity-25 disabled:cursor-not-allowed shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Next products"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </button>
            </div>
          )}

          {/* View More Button */}
          <Link
            href={submenuHref}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#800F17] hover:bg-[#680C13] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 w-fit shrink-0"
          >
            <span>View More</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Product Cards Row / Carousel Track */}
      <div className="relative group/carousel">
        {/* Floating Side Arrow - Left (desktop hover) */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("prev")}
            aria-label="Previous products"
            className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-[#800F17] dark:text-rose-200 border border-rose-200/90 dark:border-slate-700 shadow-lg items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-xs opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}

        {/* Floating Side Arrow - Right (desktop hover) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("next")}
            aria-label="Next products"
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-[#800F17] dark:text-rose-200 border border-rose-200/90 dark:border-slate-700 shadow-lg items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-xs opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}

        {/* Horizontally scrollable product card track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3.5 sm:gap-6 lg:gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 -mx-1 px-1 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[calc((100%-0.875rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-5.25rem)/4)]"
            >
              <ProductCard
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.mainImage || item.image || "/images/product-1.jpg"}
                category={item.category || submenuName}
                stock={item.stock}
                href={item.href || `/products/${item.id}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeCategoryProducts({ initialProducts = [] }) {
  const [products, setProducts] = useState(() =>
    initialProducts.length > 0 ? initialProducts : getStoredProducts()
  );
  const [isLoading, setIsLoading] = useState(() => initialProducts.length === 0 && products.length === 0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const prodData = await fetchProductsFromDb(true);
        if (isMounted && Array.isArray(prodData) && prodData.length > 0) {
          setProducts(prodData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading products for home showcase:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    // Always fetch fresh products on mount to reflect newly added dashboard products immediately
    loadData();

    const handleSync = () => loadData();
    window.addEventListener("thoranam_products_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("thoranam_products_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Filter REAL products strictly matching each submenu (NO slicing, return all)
  const getSubmenuProducts = (submenu) => {
    const subLabel = (submenu.label || submenu.name || "").trim().toLowerCase();
    const subId = (submenu.id || "").trim().toLowerCase();

    const norm = (s) =>
      (s || "")
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/sarees?$/, "saree")
        .replace(/\s+/g, " ")
        .trim();

    const subNorm = norm(subLabel);
    const subIdNorm = norm(subId);

    const matched = products.filter((p) => {
      const pCat = (p.category || "").trim().toLowerCase();
      const pCatNorm = norm(pCat);

      if (pCatNorm === subNorm || pCatNorm === subIdNorm) {
        return true;
      }

      // Exact submenu matches
      const pTitle = (p.title || "").toLowerCase();
      if ((subId === "fancy-saree" || subNorm.includes("fancy")) && (pCatNorm.includes("fancy") || pTitle.includes("fancy"))) return true;
      if ((subId === "bamboo-cotton-silk" || subNorm.includes("bamboo")) && (pCatNorm.includes("bamboo") || pTitle.includes("bamboo"))) return true;
      if (subId === "mangalagiri-cotton" && (pCatNorm.includes("mangalagiri") || pTitle.includes("mangalagiri"))) return true;
      if (subId === "chettinad-cotton" && (pCatNorm.includes("chettinad") || pTitle.includes("chettinad"))) return true;
      if (subId === "coimbatore-cotton" && (pCatNorm.includes("coimbatore") || pTitle.includes("coimbatore"))) return true;
      if (subId === "illampillai-cotton" && (pCatNorm.includes("illampillai") || pTitle.includes("illampillai"))) return true;
      if (subId === "banarasi-silk-cotton" && (pCatNorm.includes("banarasi") || pTitle.includes("banarasi"))) return true;
      if (subId === "linen-cotton" && (pCatNorm.includes("linen") || pTitle.includes("linen"))) return true;
      if (subId === "garden-silk-saree" && (pCatNorm.includes("garden") || pTitle.includes("garden") || pTitle.includes("crepe"))) return true;
      if (subId === "crushed-organza-pure" && (pCatNorm.includes("organza") || pTitle.includes("organza") || pTitle.includes("kota"))) return true;
      if (subId === "cotton-printed-sarees" && (pCatNorm.includes("printed") || pTitle.includes("printed"))) return true;
      if (subId === "digital-print-saree-with-blouse" && (pCatNorm.includes("digital") || pTitle.includes("digital"))) return true;
      if (subId === "bengali-cotton-with-zari-border" && (pCatNorm.includes("bengali") || pTitle.includes("bengali"))) return true;
      if (subId === "handloom-cotton-sarees" && (pCatNorm.includes("handloom") || pTitle.includes("handloom"))) return true;
      if (subId === "pure-cotton" && (pCatNorm === "pure cotton" || pCatNorm === "pure-cotton")) return true;
      if (subId === "semi-silk-cotton" && (pCatNorm === "semi silk" || pCatNorm === "semi silk cotton")) return true;
      if (subId === "simple-silk-cottons" && (pCatNorm === "simple silk" || pCatNorm === "simple silk cottons")) return true;

      return false;
    });

    // Return ALL matching products without artificial limit
    return matched;
  };

  // Group products strictly into UNIQUE category collections (NO duplicates)
  const activeSubmenus = useMemo(() => {
    const submenus = INITIAL_CATEGORIES.filter((c) => {
      const id = (c.id || "").toLowerCase();
      const label = (c.label || c.name || "").toLowerCase();
      return !PARENT_CATEGORY_KEYS.includes(id) && !PARENT_CATEGORY_KEYS.includes(label);
    });

    const coveredProductIds = new Set();
    const result = [];

    submenus.forEach((submenu) => {
      const allMatched = getSubmenuProducts(submenu);
      // Ensure products already assigned to a collection aren't repeated
      const items = allMatched.filter((p) => !coveredProductIds.has(p.id));
      if (items && items.length > 0) {
        items.forEach((p) => coveredProductIds.add(p.id));
        result.push({
          submenu,
          items,
        });
      }
    });

    // Also include any custom category from Dashboard that has products in MySQL
    const remainingProducts = products.filter((p) => !coveredProductIds.has(p.id));
    if (remainingProducts.length > 0) {
      const customGrouped = {};
      remainingProducts.forEach((p) => {
        const catName = (p.category || "").trim();
        const catKey = catName.toLowerCase();
        if (!PARENT_CATEGORY_KEYS.includes(catKey) && catName) {
          if (!customGrouped[catName]) customGrouped[catName] = [];
          customGrouped[catName].push(p);
        }
      });

      Object.entries(customGrouped).forEach(([catName, items]) => {
        // If this category already exists in result, merge the items
        const existing = result.find(
          (r) =>
            (r.submenu.label || r.submenu.name || "").trim().toLowerCase() ===
            catName.toLowerCase()
        );
        if (existing) {
          existing.items.push(...items);
        } else {
          result.push({
            submenu: {
              id: catName.toLowerCase().replace(/\s+/g, "-"),
              label: catName,
              name: catName,
              href: `/products?cat=${encodeURIComponent(catName)}`,
            },
            items,
          });
        }
      });
    }

    return result;
  }, [products]);

  // Shimmer skeleton cards while loading
  if (isLoading && products.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-stone-50/60 dark:bg-slate-900/60 space-y-16">
        <Container>
          <div className="space-y-6 sm:space-y-8 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
              <div className="space-y-2">
                <div className="h-5 w-28 bg-rose-100 dark:bg-rose-950/60 rounded-full" />
                <div className="h-7 sm:h-9 w-60 bg-stone-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-4 w-72 bg-stone-100 dark:bg-slate-800/60 rounded" />
              </div>
              <div className="h-9 w-28 bg-stone-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border border-stone-200/80 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="aspect-[4/5] w-full rounded-lg sm:rounded-xl bg-stone-200 dark:bg-slate-800 animate-pulse relative overflow-hidden" />
                  <div className="pt-3 space-y-2">
                    <div className="h-4 w-3/4 bg-stone-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-1/3 bg-rose-200/70 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // If no submenus have real products from MySQL, hide section
  if (activeSubmenus.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-stone-50/60 dark:bg-slate-900/60 border-t border-stone-100 dark:border-slate-800 space-y-12 sm:space-y-16">
      <Container>
        {/* ================= Shop Our Bestsellers ================= */}
        <div className="text-center max-w-2xl mx-auto space-y-2 pb-8 sm:pb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#800F17]">
            Shop Our Bestsellers
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-rose-950/80 dark:text-rose-200/80 font-normal">
            Discover Thoranam&apos;s most loved sarees. Browse now and find your favorite!
          </p>
        </div>

        {/* Categories Showcase with Premium Carousel Tracks */}
        {activeSubmenus.map(({ submenu, items }, idx) => (
          <CategorySection
            key={submenu.id || idx}
            submenu={submenu}
            items={items}
            idx={idx}
          />
        ))}
      </Container>
    </section>
  );
}
