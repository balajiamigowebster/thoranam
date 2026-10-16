"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";

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

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {bestsellers.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                tag="Bestseller"
                href={item.href}
              />
            ))}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
              {bambooCottonProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={p.price}
                  image={p.image}
                  tag={p.brand || "Exclusive"}
                  stock={p.stockText}
                  href={p.href}
                />
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
