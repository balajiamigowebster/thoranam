"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";

import { fetchProductsFromDb, getStoredProducts } from "@/lib/products";

export default function HomeBestToday() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const data = await fetchProductsFromDb();
        if (active && Array.isArray(data)) {
          // STRICT RULE: Only show products when the checkbox is active / checked (isFeatured === true)
          const featured = data.filter((p) => Boolean(p.isFeatured));
          const mapped = featured.map((p, idx) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            image: p.mainImage || "/images/product-1.jpg",
            tag: idx === 0 ? "Trending" : idx === 1 ? "New" : idx === 2 ? "Handcrafted" : "Bestseller",
          }));
          setProducts(mapped);
          setLoaded(true);
        }
      } catch (e) {
        console.warn("Could not fetch products for home best today:", e);
        if (active) setLoaded(true);
      }
    }
    loadProducts();
    window.addEventListener("thoranam_products_updated", loadProducts);
    window.addEventListener("storage", loadProducts);
    return () => {
      active = false;
      window.removeEventListener("thoranam_products_updated", loadProducts);
      window.removeEventListener("storage", loadProducts);
    };
  }, []);

  // Do not render section if no items are checked as featured
  if (products.length === 0) {
    return null;
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              image={item.image}
              tag={item.tag}
              href={`/products/${item.id}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
