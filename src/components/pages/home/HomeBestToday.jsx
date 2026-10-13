"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import Container from "@/components/ui/Container";

const products = [
  {
    id: "plum-leaf",
    title: "Plum Leaf – Premium Fancy Kotta Saree",
    price: "Rs. 2,500.00",
    image: "/images/product-1.jpg",
    tag: "Trending",
    href: "/products/plum-leaf",
  },
  {
    id: "misty-dusk",
    title: "Misty Dusk – Premium Fancy Saree",
    price: "Rs. 1,900.00",
    image: "/images/product-2.jpg",
    tag: "New",
    href: "/products/misty-dusk",
  },
  {
    id: "heritage-procession",
    title: "Heritage Procession – Premium Fancy Saree",
    price: "Rs. 1,700.00",
    image: "/images/product-3.jpg",
    tag: "Handcrafted",
    href: "/products/heritage-procession",
  },
  {
    id: "emerald-chevron",
    title: "Emerald Chevron – Premium Fancy Saree",
    price: "Rs. 1,400.00",
    image: "/images/product-4.jpg",
    tag: "Bestseller",
    href: "/products/emerald-chevron",
  },
];

export default function HomeBestToday() {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
      <Container>
        {/* Section Heading matching screenshot */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-800 dark:text-slate-100">
            <span className="font-bold text-[#800F17]">
              Discover the Best of the Bunch –
            </span>{" "}
            Shop Our Handpicked Favorites Today!
          </h2>
        </div>

        {/* 4 Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {products.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(128,15,23,0.12)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col cursor-pointer"
            >
              {/* Product Image Frame */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-800">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transform group-hover:scale-108 transition-transform duration-500 ease-out"
                />

                {/* Subtle vignette hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Floating Tag */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-[#800F17] shadow-xs backdrop-blur-xs">
                    {item.tag}
                  </span>
                </div>

                {/* Quick Action Floating Buttons (Revealed on hover) */}
                <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    type="button"
                    aria-label="Add to cart"
                    className="flex-1 py-2 px-3 rounded-lg bg-[#800F17] hover:bg-[#660B12] text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Wishlist"
                    className="p-2 rounded-lg bg-white/95 hover:bg-white text-slate-700 hover:text-[#800F17] shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Meta */}
              <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between space-y-1.5">
                <Link href={item.href} className="group-hover:text-[#800F17] transition-colors">
                  <h3 className="text-sm sm:text-[15px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm font-bold text-[#800F17]">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
