"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";

import { getApiUrl } from "@/config";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch(getApiUrl("/api/products")),
          fetch(getApiUrl("/api/categories")),
        ]);
        const prodJson = await prodRes.json();
        const catJson = await catRes.json();

        if (mounted) {
          if (prodJson.success && Array.isArray(prodJson.data)) {
            setProducts(prodJson.data);
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

  const filtered = products.filter((p) => {
    if (selectedCat === "all") return true;
    return p.category === selectedCat;
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
            onClick={() => setSelectedCat("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCat === "all"
                ? "bg-[#800F17] text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
            }`}
          >
            All Sarees ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id || c.label}
              type="button"
              onClick={() => setSelectedCat(c.label)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCat === c.label
                  ? "bg-[#800F17] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Saree Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#800F17] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading Thoranam sarees...</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
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
                  onClick={() => setSelectedCat("all")}
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
