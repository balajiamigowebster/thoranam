"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { fetchProductsFromDb, getStoredProducts } from "@/lib/products";

export default function HomeBestToday({ initialProducts = [] }) {
  const [products, setProducts] = useState(() => {
    const data = initialProducts.length > 0 ? initialProducts : getStoredProducts();
    const featured = (data || []).filter((p) => Boolean(p.isFeatured));
    const itemsToDisplay = featured.length > 0 ? featured : (data || []);
    return itemsToDisplay.slice(0, 4).map((p, idx) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      stock: p.stock,
      category: p.category,
      image: p.mainImage || p.image || "/images/product-1.jpg",
      tag: idx === 0 ? "Trending" : idx === 1 ? "New" : idx === 2 ? "Handcrafted" : "Bestseller",
    }));
  });
  const [isLoading, setIsLoading] = useState(() => {
    const data = initialProducts.length > 0 ? initialProducts : getStoredProducts();
    return (data || []).length === 0;
  });

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await fetchProductsFromDb();
        if (active && Array.isArray(data)) {
          const featured = data.filter((p) => Boolean(p.isFeatured));
          const itemsToDisplay = featured.length > 0 ? featured : data;
          const mapped = itemsToDisplay.slice(0, 4).map((p, idx) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            stock: p.stock,
            category: p.category,
            image: p.mainImage || p.image || "/images/product-1.jpg",
            tag: idx === 0 ? "Trending" : idx === 1 ? "New" : idx === 2 ? "Handcrafted" : "Bestseller",
          }));
          setProducts(mapped);
          setIsLoading(false);
        } else if (active) {
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("Could not fetch products for home best today:", e);
        if (active) setIsLoading(false);
      }
    }

    // Always fetch on mount in background to reflect fresh dashboard additions
    loadProducts();

    window.addEventListener("thoranam_products_updated", loadProducts);
    window.addEventListener("storage", loadProducts);

    return () => {
      active = false;
      window.removeEventListener("thoranam_products_updated", loadProducts);
      window.removeEventListener("storage", loadProducts);
    };
  }, [initialProducts.length]);

  // Section Heading is always rendered immediately as H1 without any lazy loading
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
      <Container>
        {/* Section Heading matching screenshot - Rendered immediately as H1 without lazyload */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-800 dark:text-slate-100">
            <span className="font-bold text-[#800F17]">
              Discover the Best of the Bunch –
            </span>{" "}
            Shop Our Handpicked Favorites Today!
          </h1>
        </div>

        {/* 4 Column Product Grid or Skeleton while products load */}
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border border-stone-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="aspect-[4/5] w-full rounded-lg sm:rounded-xl bg-stone-200 dark:bg-slate-800 animate-pulse" />
                <div className="pt-3 space-y-2">
                  <div className="h-4 w-3/4 bg-stone-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-1/3 bg-rose-200/70 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
            {products.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                stock={item.stock}
                category={item.category}
                image={item.image}
                tag={item.tag}
                href={`/products/${item.id}`}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
