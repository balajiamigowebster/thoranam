"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";

const fallbackProducts = [
  {
    id: 1,
    title: "Plum Leaf – Premium Fancy Kotta Saree",
    price: "Rs. 2,500.00",
    image: "/images/product-1.jpg",
    tag: "Trending",
  },
  {
    id: 2,
    title: "Misty Dusk – Premium Fancy Saree",
    price: "Rs. 1,900.00",
    image: "/images/product-2.jpg",
    tag: "New",
  },
  {
    id: 3,
    title: "Heritage Procession – Premium Fancy Saree",
    price: "Rs. 1,700.00",
    image: "/images/product-3.jpg",
    tag: "Handcrafted",
  },
  {
    id: 4,
    title: "Emerald Chevron – Premium Fancy Saree",
    price: "Rs. 1,400.00",
    image: "/images/product-4.jpg",
    tag: "Bestseller",
  },
];

import { getApiUrl } from "@/config";

export default function HomeBestToday() {
  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const res = await fetch(getApiUrl("/api/products"));
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.slice(0, 4).map((p, idx) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            image: p.mainImage || "/images/product-1.jpg",
            tag: idx === 0 ? "Trending" : idx === 1 ? "New" : idx === 2 ? "Handcrafted" : "Bestseller",
          }));
          setProducts(mapped);
        }
      } catch (e) {
        console.warn("Could not fetch products for home best today:", e);
      }
    }
    loadProducts();
    return () => {
      active = false;
    };
  }, []);

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
