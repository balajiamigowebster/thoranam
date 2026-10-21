"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_SLIDES = [
  {
    id: 1,
    imageSrc: "/images/hero-1.webp",
    imageAlt: "Semi Mangalagiri Saree Collection Banner",
    link: "/products",
  },
  {
    id: 2,
    imageSrc: "/images/hero-2.webp",
    imageAlt: "Heirloom Festive Silk Sarees Banner",
    link: "/products",
  },
];

import { getApiUrl, getAssetUrl } from "@/config";

const CACHE_KEY = "thoranam_hero_slides_cache";

export default function HomeHero({ initialSlides = null }) {
  const [slides, setSlides] = useState(() => initialSlides || DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Load cached slides on client mount without causing SSR hydration mismatch
    if (!initialSlides) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSlides(parsed);
          }
        }
      } catch (e) {}
    }

    async function loadHeroSlides() {
      try {
        const res = await fetch(getApiUrl("/api/settings"));
        const json = await res.json();
        if (mounted && json.success && json.data?.hero_slides?.length > 0) {
          setSlides(json.data.hero_slides);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(json.data.hero_slides));
          } catch (err) {}
        }
      } catch (e) {
        console.warn("Could not load dynamic hero slides:", e);
      }
    }
    loadHeroSlides();
    return () => {
      mounted = false;
    };
  }, [initialSlides]);

  // Auto advance slides every 5 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

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
        Responsive banner container:
        - Mobile: vertical portrait aspect ratio (aspect-[4/5] or min-h-[460px]) so mobile banners display vertically with full height & proper spacing
        - Tablet/Desktop: widescreen aspect ratio (sm:aspect-[16/7] md:aspect-[1920/700])
      */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/7] md:aspect-[1920/700]">
        {slides.map((slide, index) => {
          const isActive = currentSlide === index;
          const desktopSrc = getAssetUrl(slide.imageSrc);
          const mobileSrc = slide.mobileImageSrc ? getAssetUrl(slide.mobileImageSrc) : desktopSrc;

          const content = (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Native responsive picture tag: downloads & renders the mobile image instantly on mobile without layout shift or lag */}
              <picture className="block w-full h-full">
                {slide.mobileImageSrc && (
                  <source
                    media="(max-width: 639px)"
                    srcSet={mobileSrc}
                  />
                )}
                <img
                  src={desktopSrc}
                  alt={slide.imageAlt || "Thoranam Saree Banner"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = "/images/hero-1.webp";
                  }}
                />
              </picture>
            </div>
          );

          if (slide.link) {
            return (
              <Link key={slide.id || index} href={slide.link}>
                {content}
              </Link>
            );
          }
          return content;
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
