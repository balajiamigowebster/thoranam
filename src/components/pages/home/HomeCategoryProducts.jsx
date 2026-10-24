"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { getApiUrl } from "@/config";
import { INITIAL_CATEGORIES } from "@/lib/categories";

export default function HomeCategoryProducts() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          fetch(getApiUrl("/api/categories")),
          fetch(getApiUrl("/api/products")),
        ]);

        const catJson = await catRes.json();
        const prodJson = await prodRes.json();

        if (isMounted) {
          if (catJson.success && Array.isArray(catJson.data) && catJson.data.length > 0) {
            // Use all categories and ensure Fancy Sarees is placed at Collection 06
            let list = [...catJson.data];
            const fancyIdx = list.findIndex(
              (c) =>
                (c.id || "").toLowerCase() === "fancy-saree" ||
                (c.label || "").toLowerCase().includes("fancy")
            );
            if (fancyIdx >= 0) {
              const [fancyItem] = list.splice(fancyIdx, 1);
              fancyItem.label = fancyItem.label || "Fancy Sarees";
              list.splice(Math.min(5, list.length), 0, fancyItem);
            }
            setCategories(list);
          } else {
            setCategories(INITIAL_CATEGORIES);
          }
          if (prodJson.success && Array.isArray(prodJson.data)) {
            setProducts(prodJson.data);
          }
        }
      } catch (err) {
        console.error("Error loading category showcase data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    // Listen to admin category updates
    const handleCategoryUpdate = () => {
      loadData();
    };
    window.addEventListener("thoranam_categories_updated", handleCategoryUpdate);
    window.addEventListener("thoranam_products_updated", handleCategoryUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("thoranam_categories_updated", handleCategoryUpdate);
      window.removeEventListener("thoranam_products_updated", handleCategoryUpdate);
    };
  }, []);

  // Filter products strictly for each category (matching id, label, or name)
  const getCategoryProducts = (cat) => {
    const catLabel = (cat.label || cat.name || "").trim().toLowerCase();
    const catId = (cat.id || "").trim().toLowerCase();

    // Normalizer to handle singular/plural and spacing (e.g. "Fancy Saree" vs "Fancy Sarees")
    const norm = (s) =>
      (s || "")
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/sarees?$/, "saree")
        .replace(/\s+/g, " ")
        .trim();

    const catNorm = norm(catLabel);
    const catIdNorm = norm(catId);

    // Search products matching this category directly or through subcategories
    const subLabels = Array.isArray(cat.subcategories)
      ? cat.subcategories.map((s) => norm(s.label || s.name || ""))
      : [];

    const matched = products.filter((p) => {
      const pCat = (p.category || "").trim().toLowerCase();
      const pCatNorm = norm(pCat);

      if (
        pCatNorm === catNorm ||
        pCatNorm === catIdNorm ||
        subLabels.includes(pCatNorm)
      ) {
        return true;
      }

      // Keyword matching on product title for traditional saree weaves
      const pTitle = (p.title || "").toLowerCase();
      if ((catId === "fancy-saree" || catNorm.includes("fancy")) && (pCatNorm.includes("fancy") || pTitle.includes("fancy"))) return true;
      if (catId === "mangalagiri-cotton" && pTitle.includes("mangalagiri")) return true;
      if (catId === "chettinad-cotton" && pTitle.includes("chettinad")) return true;
      if (catId === "coimbatore-cotton" && pTitle.includes("coimbatore")) return true;
      if (catId === "illampillai-cotton" && pTitle.includes("illampillai")) return true;
      if (catId === "banarasi-silk-cotton" && pTitle.includes("banarasi")) return true;
      if (catId === "linen-cotton" && pTitle.includes("linen")) return true;
      if (catId === "garden-silk-saree" && (pTitle.includes("garden") || pTitle.includes("crepe"))) return true;
      if (catId === "crushed-organza-pure" && (pTitle.includes("organza") || pTitle.includes("kota"))) return true;
      if (catId === "cotton-printed-sarees" && (pTitle.includes("printed") || pCatNorm.includes("printed"))) return true;
      if (catId === "digital-print-saree-with-blouse" && (pTitle.includes("digital") || pTitle.includes("neem"))) return true;
      if (catId === "bengali-cotton-with-zari-border" && (pTitle.includes("bengali") || pTitle.includes("chanderi"))) return true;
      if (catId === "bamboo-cotton-silk" && (pTitle.includes("bamboo") || pTitle.includes("mul"))) return true;
      if (catId === "handloom-cotton-sarees" && pTitle.includes("handloom")) return true;
      if (catId === "pure-cotton" && (pCatNorm === "pure cotton" || pTitle.includes("pure cotton"))) return true;
      if (catId === "semi-silk-cotton" && (pCatNorm === "semi silk" || pTitle.includes("semi silk") || pTitle.includes("kanchipuram"))) return true;
      if (catId === "simple-silk-cottons" && (pCatNorm === "simple silk" || pTitle.includes("simple silk") || pTitle.includes("tussar"))) return true;

      return false;
    });

    if (matched.length > 0) {
      return matched.slice(0, 4);
    }

    // Fallback to category showcase if defined in admin
    if (Array.isArray(cat.showcase) && cat.showcase.length > 0) {
      return cat.showcase.slice(0, 4).map((s, idx) => ({
        id: `${cat.id}-showcase-${idx}`,
        title: s.title,
        price: s.price,
        mainImage: s.image || "/images/product-1.jpg",
        category: cat.label || cat.name,
        href: `/products?cat=${encodeURIComponent(cat.id || cat.label)}`,
      }));
    }

    // Default boutique showcase sarees for this category so all 17 submenus appear
    const sampleWeaves = [
      {
        id: `${cat.id}-sample-1`,
        title: `${cat.label || cat.name} Handcrafted Saree`,
        price: "₹ 3,499",
        mainImage: cat.image || "/images/product-1.jpg",
        category: cat.label || cat.name,
        href: `/products?cat=${encodeURIComponent(cat.id || cat.label)}`,
      },
      {
        id: `${cat.id}-sample-2`,
        title: `Royal ${cat.label || cat.name} Zari Border`,
        price: "₹ 4,250",
        mainImage: "/images/product-2.jpg",
        category: cat.label || cat.name,
        href: `/products?cat=${encodeURIComponent(cat.id || cat.label)}`,
      },
      {
        id: `${cat.id}-sample-3`,
        title: `Festive ${cat.label || cat.name} Weave`,
        price: "₹ 2,890",
        mainImage: "/images/product-3.jpg",
        category: cat.label || cat.name,
        href: `/products?cat=${encodeURIComponent(cat.id || cat.label)}`,
      },
      {
        id: `${cat.id}-sample-4`,
        title: `Heritage ${cat.label || cat.name} Traditional`,
        price: "₹ 5,100",
        mainImage: "/images/product-4.jpg",
        category: cat.label || cat.name,
        href: `/products?cat=${encodeURIComponent(cat.id || cat.label)}`,
      },
    ];

    return sampleWeaves;
  };

  return (
    <section className="py-12 sm:py-16 bg-stone-50/60 dark:bg-slate-900/60 space-y-16 sm:space-y-24">
      <Container>
        {categories.map((category, idx) => {
          const categoryName = category.label || category.name;
          const categoryHref =
            category.href ||
            `/products?cat=${encodeURIComponent(category.id || categoryName)}`;
          const categoryItems = getCategoryProducts(category);

          return (
            <div
              key={category.id || idx}
              className={`space-y-6 sm:space-y-8 ${
                idx > 0 ? "pt-12 sm:pt-16 border-t border-rose-100/70 dark:border-slate-800" : ""
              }`}
            >
              {/* Category Header Row: Title & Subtitle on Left, 'View More' Button on Right */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#800F17] bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-100/80 dark:border-rose-900/50">
                      <Sparkles className="w-3 h-3 text-[#AA771C]" />
                      Collection {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#800F17] dark:text-rose-100 uppercase font-serif">
                    {categoryName}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                    Handcrafted luxury sarees woven with timeless heritage and contemporary grace
                  </p>
                </div>

                {/* View More Button */}
                <Link
                  href={categoryHref}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#800F17] hover:bg-[#680C13] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 w-fit"
                >
                  <span>View More</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              {/* 3 to 4 Saree Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7">
                {categoryItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    image={item.mainImage || item.image || "/images/product-1.jpg"}
                    category={item.category || categoryName}
                    stock={item.stock}
                    href={item.href || `/products/${item.id}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
