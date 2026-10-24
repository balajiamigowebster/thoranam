"use client";

import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";

const bestsellers = [
  {
    id: "chettinad-80-count",
    title: "Chettinad 80 Count Cotton Saree",
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

export default function HomeShop() {
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
                image={item.image}
                tag="Bestseller"
                href={item.href}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
