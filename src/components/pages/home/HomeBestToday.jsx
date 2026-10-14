"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, ShoppingBag, Eye, Heart } from "lucide-react";
import Container from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";

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

export default function HomeBestToday() {
  const { triggerAddToCartAnimation } = useCart();
  const [products, setProducts] = useState(fallbackProducts);
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
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

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = product.id;
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    triggerAddToCartAnimation({
      startElementOrRect: e?.currentTarget,
      image: product.image || "/images/product-1.jpg",
      item: product,
      quantity: 1,
    });
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 1800);
  };

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
          {products.map((item) => {
            const isAdded = addedItems[item.id];
            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(128,15,23,0.12)] hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col"
              >
                {/* Product Image Frame */}
                <Link
                  href={`/products/${item.id}`}
                  className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-800 block"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center transform group-hover:scale-106 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.target.src = "/images/product-1.jpg";
                    }}
                  />

                  {/* Subtle vignette hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Floating Tag */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-[#800F17] shadow-xs backdrop-blur-xs">
                      {item.tag}
                    </span>
                  </div>

                  {/* Circular Floating Add-To-Cart / Bag Icon matching red circle in screenshot */}
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

                {/* Product Meta */}
                <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between space-y-1.5">
                  <Link
                    href={`/products/${item.id}`}
                    className="group-hover:text-[#800F17] transition-colors"
                  >
                    <h3 className="text-sm sm:text-[15px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm font-bold text-[#800F17]">
                    {item.price}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
