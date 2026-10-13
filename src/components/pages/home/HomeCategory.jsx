"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";

// Categories list from screenshot
// You can replace the image paths in the `image` field with your own image files anytime
const categories = [
  {
    id: "handloom-cotton",
    name: "Handloom Cotton Sarees",
    href: "/products?cat=handloom-cotton",
    image: "", // Add your image path here e.g. "/images/cat-handloom.jpg"
    fallbackColor: "from-amber-200 via-orange-100 to-amber-300",
  },
  {
    id: "banarasi-silk",
    name: "Banarasi Silk Cotton",
    href: "/products?cat=banarasi-silk-cotton",
    image: "", // Add your image path here
    fallbackColor: "from-rose-200 via-red-100 to-rose-300",
  },
  {
    id: "illampillai-cotton",
    name: "Illampillai Cotton",
    href: "/products?cat=illampillai-cotton",
    image: "", // Add your image path here
    fallbackColor: "from-slate-200 via-zinc-100 to-stone-300",
  },
  {
    id: "pure-cotton",
    name: "Pure Cotton",
    href: "/products?cat=pure-cotton",
    image: "", // Add your image path here
    fallbackColor: "from-emerald-200 via-teal-100 to-emerald-300",
  },
  {
    id: "chettinad-cotton",
    name: "Chettinad Cotton",
    href: "/products?cat=chettinad-cotton",
    image: "", // Add your image path here
    fallbackColor: "from-purple-200 via-violet-100 to-purple-300",
  },
  {
    id: "cotton-printed",
    name: "Cotton Printed Sarees",
    href: "/products?cat=cotton-printed",
    image: "", // Add your image path here
    fallbackColor: "from-pink-200 via-rose-100 to-pink-300",
  },
  {
    id: "coimbatore-cotton",
    name: "Coimbatore Cotton",
    href: "/products?cat=coimbatore-cotton",
    image: "", // Add your image path here
    fallbackColor: "from-sky-200 via-cyan-100 to-sky-300",
  },
  {
    id: "mul-cotton",
    name: "MUL Cotton Sarees",
    href: "/products?cat=mul-cotton",
    image: "", // Add your image path here
    fallbackColor: "from-lime-200 via-yellow-100 to-lime-300",
  },
];

export default function HomeCategory() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-slate-950 overflow-hidden">
      <Container>
        {/* Heading & Subheading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#800F17] uppercase">
            BROWSE OUR CATEGORIES
          </h2>
          <p className="text-xs sm:text-sm text-rose-950/80 dark:text-rose-200/80">
            Explore our collections and find your perfect saree for every occasion
          </p>
        </div>

        {/* 
          All 8 categories fit horizontally on desktop (grid-cols-8) 
          and smoothly scroll on mobile/tablet viewports
        */}
        <div className="w-full overflow-x-auto lg:overflow-visible no-scrollbar pb-3">
          <div className="flex lg:grid lg:grid-cols-8 items-start justify-start lg:justify-items-center gap-3 sm:gap-4 md:gap-5 lg:gap-3 min-w-max lg:min-w-0 px-1">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group flex flex-col items-center text-center w-20 sm:w-24 md:w-26 lg:w-full focus:outline-none"
              >
                {/* Scaled-down Circular Container with refined Gold Border */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-[86px] lg:h-[86px] xl:w-24 xl:h-24 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-xs group-hover:shadow-[0_6px_20px_rgba(128,15,23,0.25)] group-hover:scale-108 transition-all duration-300 ease-out cursor-pointer">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-stone-100 dark:bg-slate-900 flex items-center justify-center">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 1024px) 80px, 96px"
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      // Clean placeholder with subtle gradient until you add images
                      <div
                        className={`w-full h-full bg-gradient-to-br ${cat.fallbackColor} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}
                      >
                        <span className="text-xs sm:text-sm lg:text-base font-bold text-slate-800/70 uppercase select-none">
                          {cat.name.slice(0, 2)}
                        </span>
                      </div>
                    )}

                    {/* Subtle shine overlay on hover */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
                  </div>
                </div>

                {/* Compact, balanced Category Label */}
                <span className="mt-2.5 text-[11px] sm:text-xs font-medium text-[#800F17] dark:text-rose-300 leading-tight group-hover:text-rose-950 dark:group-hover:text-white group-hover:font-semibold transition-all duration-200 text-center line-clamp-2 px-0.5">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
