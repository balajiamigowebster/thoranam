"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    imageSrc: "/images/hero-1.webp",
    imageAlt: "Thoranam Saree Collection Banner 1",
  },
  {
    id: 2,
    imageSrc: "/images/hero-2.webp",
    imageAlt: "Thoranam Saree Collection Banner 2",
  },
];

export default function HomeHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto advance slides every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      className="relative w-full overflow-hidden select-none bg-stone-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Slideshow"
    >
      {/* 
        Full width banner matching the exact native 1920x700 (~2.74:1) banner ratio.
        This fits the entire image without vertical cropping and keeps the height compact.
      */}
      <div className="relative w-full aspect-[1920/700]">
        {slides.map((slide, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.imageSrc}
                alt={slide.imageAlt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="w-full h-full object-contain md:object-cover object-center"
              />
            </div>
          );
        })}

        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          type="button"
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/75 hover:bg-white text-stone-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          type="button"
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/75 hover:bg-white text-stone-800 shadow-md backdrop-blur-xs flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.8]" />
        </button>

        {/* Bottom Pagination Pill Indicators */}
        <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, index) => {
            const isActive = currentSlide === index;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? "w-6 sm:w-8 h-2 sm:h-2.5 bg-amber-500 shadow-xs"
                    : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/80 hover:bg-white"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
