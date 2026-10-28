"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";

import { getApiUrl } from "@/config";
import { getStoredProducts, fetchProductsFromDb } from "@/lib/products";

export default function Products() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCat = searchParams.get("cat");

  const [products, setProducts] = useState(getStoredProducts);
  const [categories, setCategories] = useState([]);
  const [customSelectedCat, setCustomSelectedCat] = useState(null);
  const [isLoading, setIsLoading] = useState(() => getStoredProducts().length === 0);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [prodData, catRes] = await Promise.all([
          fetchProductsFromDb(),
          fetch(getApiUrl("/api/categories")),
        ]);
        const catJson = await catRes.json();

        if (mounted) {
          if (Array.isArray(prodData)) {
            setProducts(prodData);
          }
          if (catJson.success && Array.isArray(catJson.data)) {
            setCategories(catJson.data);
          }
        }
      } catch (err) {
        console.error("Error loading products catalog:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Derive active category from URL search parameter or user clicks
  const selectedCat = (() => {
    if (customSelectedCat !== null) return customSelectedCat;
    if (!urlCat || urlCat.toLowerCase() === "thoranam-collection") return "all";
    const found = categories.find(
      (c) =>
        c.id?.toLowerCase() === urlCat.toLowerCase() ||
        c.label?.toLowerCase() === urlCat.toLowerCase() ||
        c.name?.toLowerCase() === urlCat.toLowerCase()
    );
    return found ? (found.label || found.name || found.id) : urlCat;
  })();

  const handleSelectCat = (catValue) => {
    setCustomSelectedCat(null);
    if (catValue === "all") {
      router.push("/products", { scroll: false });
    } else {
      const catObj = categories.find((c) => c.label === catValue || c.id === catValue || c.name === catValue);
      const queryId = catObj?.id || catValue;
      router.push(`/products?cat=${encodeURIComponent(queryId)}`, { scroll: false });
    }
  };

  const filtered = products.filter((p) => {
    if (selectedCat === "all" || selectedCat.toLowerCase() === "thoranam-collection") return true;
    const catLow = selectedCat.toLowerCase();
    const pCatLow = (p.category || "").toLowerCase();
    // Check direct equality or match against category id/label
    if (pCatLow === catLow) return true;
    const matchedCategory = categories.find(
      (c) =>
        c.id?.toLowerCase() === catLow ||
        c.label?.toLowerCase() === catLow ||
        c.name?.toLowerCase() === catLow
    );
    if (matchedCategory) {
      return (
        pCatLow === (matchedCategory.label || "").toLowerCase() ||
        pCatLow === (matchedCategory.id || "").toLowerCase() ||
        pCatLow === (matchedCategory.name || "").toLowerCase()
      );
    }
    return false;
  });

  return (
    <div className="py-10 sm:py-16 bg-stone-50/50 min-h-screen">
      <Container>
        {/* Boutique Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-10">
          <span className="text-[#800F17] font-semibold text-xs uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            Handcrafted Saree Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-slate-900">
            Thoranam Boutique Catalog
          </h1>
          <p className="text-sm text-slate-600">
            Explore our curated selection of handloom silks, exotic cottons, and heirloom festive weaves.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          <button
            type="button"
            onClick={() => handleSelectCat("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCat === "all"
                ? "bg-[#800F17] text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
            }`}
          >
            All Sarees ({products.length})
          </button>
          {categories.map((c) => {
            const isCatSelected =
              selectedCat === c.label ||
              selectedCat === c.id ||
              selectedCat === c.name;
            return (
              <button
                key={c.id || c.label}
                type="button"
                onClick={() => handleSelectCat(c.label || c.name || c.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isCatSelected
                    ? "bg-[#800F17] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
                }`}
              >
                {c.label || c.name}
              </button>
            );
          })}
        </div>

        {/* Saree Grid */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border border-stone-200/80 dark:border-slate-800"
              >
                <div className="aspect-[4/5] w-full rounded-lg sm:rounded-xl bg-stone-200 dark:bg-slate-800" />
                <div className="pt-3 space-y-2">
                  <div className="h-4 w-3/4 bg-stone-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-1/3 bg-rose-200/70 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
              {filtered.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  image={item.mainImage || "/images/product-1.jpg"}
                  category={item.category || "Exclusive"}
                  stock={item.stock}
                  href={`/products/${item.id}`}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <p className="text-base font-bold text-slate-700">No sarees found in this category.</p>
                <button
                  onClick={() => handleSelectCat("all")}
                  className="text-xs font-semibold text-[#800F17] hover:underline cursor-pointer"
                >
                  View All Sarees
                </button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
