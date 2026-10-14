"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ChevronRight, ChevronLeft, Check } from "lucide-react";
import Container from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";

const bestsellers = [
  {
    id: "chettinad-80-count",
    title: "Chettinad 80 Count Cotton Sarees",
    price: "Rs. 2,800.00",
    image: "/images/bestseller-1.jpg",
    href: "/products/chettinad-80-count",
  },
  {
    id: "chettinad-120-count",
    title: "Chettinad Cotton 120 Count",
    price: "Rs. 3,500.00",
    image: "/images/bestseller-2.jpg",
    href: "/products/chettinad-120-count",
  },
];

// Bamboo Cotton Silk collection products
const bambooCottonProducts = [
  {
    id: "verdant-ikat",
    brand: "THORANAM SAREES",
    title: "Verdant Ikat – Bamboo Cotton Silk Saree",
    price: "Rs. 1,500.00",
    stockText: "Only 1 left",
    image: "/images/product-4.jpg",
    href: "/products/verdant-ikat",
  },
];

export default function HomeShop() {
  const { triggerAddToCartAnimation } = useCart();
  const [wishlist, setWishlist] = useState({});
  const [addedItems, setAddedItems] = useState({});

  const handleAddToCart = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = item.id;
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    triggerAddToCartAnimation({
      startElementOrRect: e?.currentTarget,
      image: item.image || "/images/product-1.jpg",
      item: item,
      quantity: 1,
    });
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 space-y-16 sm:space-y-20">
      <Container>
        {/* ================= SECTION 1: Shop Our Bestsellers ================= */}
        <div className="space-y-8 sm:space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#800F17]">
              Shop Our Bestsellers
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-rose-950/80 dark:text-rose-200/80 font-normal">
              Discover Thoranam&apos;s most loved sarees. Browse now and find your favorite!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {bestsellers.map((item) => {
              const isLiked = wishlist[item.id];
              return (
                <div
                  key={item.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(128,15,23,0.12)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 dark:bg-slate-800">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transform group-hover:scale-106 transition-transform duration-500 ease-out"
                    />

                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(item.id, e)}
                      aria-label="Save to Wishlist"
                      className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer backdrop-blur-xs"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isLiked
                            ? "fill-[#800F17] text-[#800F17]"
                            : "text-slate-600 hover:text-[#800F17]"
                        }`}
                      />
                    </button>

                    <div className="absolute bottom-3 inset-x-3 z-10 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(item, e)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#800F17] hover:bg-[#660B12] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
                      >
                        {addedItems[item.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <Link href={item.href} className="group-hover:text-[#800F17] transition-colors">
                      <h3 className="text-sm sm:text-[15px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="text-sm sm:text-base font-bold text-[#800F17]">
                      {item.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= SECTION 2: Bamboo Cotton Silk (Added to Bottom) ================= */}
        <div className="pt-12 sm:pt-16 border-t border-slate-100 dark:border-slate-800">
          {/* Header Row: Title & Subtitle on Left, 'View All >' Button on Right */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#800F17] uppercase">
                BAMBOO COTTON SILK
              </h2>
              <p className="text-xs sm:text-sm text-rose-950/75 dark:text-rose-200/75">
                Discover our latest products
              </p>
            </div>

            <Link
              href="/products?cat=bamboo-cotton-silk"
              className="inline-flex items-center gap-1 px-5 py-2.5 rounded-lg bg-[#800F17] hover:bg-[#680C13] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95 w-fit"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4 stroke-[2.2]" />
            </Link>
          </div>

          {/* Product Carousel / Cards Layout matching screenshot */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
              {bambooCottonProducts.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-[0_12px_30px_rgba(128,15,23,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Saree Folded Showcase Image */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-800 mb-3.5">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Brand Tag */}
                  <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-400 dark:text-slate-500">
                    {p.brand}
                  </span>

                  {/* Title */}
                  <Link href={p.href} className="group-hover:text-[#800F17] transition-colors">
                    <h3 className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                      {p.title}
                    </h3>
                  </Link>

                  {/* Price */}
                  <p className="mt-2 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {p.price}
                  </p>

                  {/* Stock Status */}
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{p.stockText}</span>
                  </div>

                  {/* Bottom Add to Cart Button */}
                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(p, e)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#800F17] hover:bg-[#680C13] text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {addedItems[p.id] ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>ADDED TO CART</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>ADD TO CART</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Navigation Arrow Indicator (subtle faded arrow on the right) */}
            <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2">
              <button
                type="button"
                aria-label="Next items"
                className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
