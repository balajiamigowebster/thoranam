"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Heart, Sparkles, Filter } from "lucide-react";
import Container from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";

export default function Products() {
  const { triggerAddToCartAnimation } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
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

  const handleAddToCart = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = item.id;
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    triggerAddToCartAnimation({
      startElementOrRect: e?.currentTarget,
      image: item.mainImage || "/images/product-1.jpg",
      item: item,
      quantity: 1,
    });
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
            {filtered.map((item) => {
              const isAdded = addedItems[item.id];
              return (
                <div
                  key={item.id}
                  className="group relative bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(128,15,23,0.12)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col"
                >
                  {/* Image Frame */}
                  <Link
                    href={`/products/${item.id}`}
                    className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 block"
                  >
                    <img
                      src={item.mainImage || "/images/product-1.jpg"}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-106 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.target.src = "/images/product-1.jpg";
                      }}
                    />

                    {/* Category Tag */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-[#800F17] shadow-xs backdrop-blur-xs">
                        {item.category || "Exclusive"}
                      </span>
                    </div>

                    {/* Circular Add to Cart Floating Button */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(item, e)}
                      aria-label="Add to cart"
                      className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 hover:text-[#800F17] shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border border-slate-200/80 group/btn"
                      title="Add to Cart"
                    >
                      {isAdded ? (
                        <Check className="w-5 h-5 text-emerald-600 animate-in zoom-in" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-slate-700 group-hover/btn:text-[#800F17] transition-colors" />
                      )}
                    </button>
                  </Link>

                  {/* Saree Meta */}
                  <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between space-y-1.5">
                    <Link
                      href={`/products/${item.id}`}
                      className="group-hover:text-[#800F17] transition-colors"
                    >
                      <h3 className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-sm font-bold text-[#800F17]">
                        {item.price}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {item.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-2">
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
