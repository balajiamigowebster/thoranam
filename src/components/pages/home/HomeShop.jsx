"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { getStoredProducts, fetchProductsFromDb } from "@/lib/products";

export default function HomeShop({ initialProducts = [] }) {
  const [products, setProducts] = useState(() =>
    initialProducts.length > 0 ? initialProducts : getStoredProducts()
  );

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await fetchProductsFromDb();
      if (isMounted && Array.isArray(data)) {
        setProducts(data);
      }
    }

    if (initialProducts.length === 0) {
      load();
    }

    const handleSync = () => load();
    window.addEventListener("thoranam_products_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener("thoranam_products_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [initialProducts.length]);

  const bestsellers = (() => {
    const explicit = (products || []).filter((p) => Boolean(p.isBestseller));
    if (explicit.length > 0) return explicit.slice(0, 4);
    return (products || []).slice(0, 4);
  })();

  if (bestsellers.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-slate-950 border-t border-stone-100 dark:border-slate-800">
      <Container>
        {/* ================= Shop Our Bestsellers ================= */}
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
                image={item.mainImage || item.image}
                tag="Bestseller"
                href={`/products/${item.id}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
