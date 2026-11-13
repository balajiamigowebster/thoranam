"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const DEFAULT_SLIDES = [
  {
    id: 1,
    imageSrc: "/images/hero-1.webp",
    mobileImageSrc: "/images/hero-1-mobile.webp",
    imageAlt: "Semi Mangalagiri Saree Collection Banner",
    link: "/products",
  },
  {
    id: 2,
    imageSrc: "/images/hero-2.webp",
    mobileImageSrc: "/images/hero-2-mobile.webp",
    imageAlt: "Heirloom Festive Silk Sarees Banner",
    link: "/products",
  },
];

import { getApiUrl, getAssetUrl, LIVE_BACKEND_URL } from "@/config";

const CACHE_KEY = "thoranam_hero_slides_cache";

export default function HomeHero({ initialSlides = null }) {
  const [slides, setSlides] = useState(() => initialSlides || DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    // If initialSlides was already pre-rendered by the server, avoid redundant client fetch
    if (initialSlides && initialSlides.length > 0) {
      return;
    }

    async function loadHeroSlides() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0 && mounted) {
            setSlides(parsed);
          }
        }
      } catch (e) {}

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
                    const img = e.currentTarget;
                    const picture = img.closest("picture");
                    const failedSrc = img.currentSrc || img.getAttribute("src") || "";

                    // If a relative /uploads/ path failed, retry loading from live backend server
                    if (failedSrc.includes("/uploads/") && !img.dataset.retried) {
                      img.dataset.retried = "true";
                      const remoteUrl = failedSrc.startsWith("http")
                        ? failedSrc
                        : `${LIVE_BACKEND_URL.replace(/\/$/, "")}${failedSrc.startsWith("/") ? "" : "/"}${failedSrc}`;

                      if (picture) {
                        picture.querySelectorAll("source").forEach((s) => {
                          s.srcset = remoteUrl;
                        });
                      }
                      img.src = remoteUrl;
                      return;
                    }

                    // Otherwise gracefully fallback to built-in mobile/desktop hero assets
                    const defaultMobile = index === 1 ? "/images/hero-2-mobile.webp" : "/images/hero-1-mobile.webp";
                    const defaultDesktop = index === 1 ? "/images/hero-2.webp" : "/images/hero-1.webp";

                    if (picture) {
                      picture.querySelectorAll("source").forEach((s) => {
                        s.srcset = defaultMobile;
                      });
                    }
                    img.src = defaultDesktop;
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

      {/* 2. Premium WhatsApp Channel Bar Under Slide Image */}
      <div className="relative w-full bg-stone-950 border-t border-b border-amber-400/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <a
            href="https://whatsapp.com/channel/0029Vb9QbqvIiRopfViU6i1a"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow the Thoranam channel on WhatsApp"
            className="group flex flex-wrap items-center justify-between gap-3 text-white transition-all duration-300 hover:opacity-95"
          >
            {/* Left: Icon + Text */}
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              {/* WhatsApp Icon with radar glow */}
              <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25D366] shadow-md shadow-[#25D366]/40">
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-35" />
                <svg
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white fill-current relative z-10"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
                </svg>
              </div>

              {/* Text */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2.5 text-left">
                <span className="text-xs sm:text-sm md:text-[15px] font-medium text-stone-100 tracking-wide">
                  Follow the <strong className="font-semibold text-amber-300">Thoranam</strong> channel on WhatsApp
                </span>
                <span className="hidden lg:inline text-xs text-stone-400">
                  • Instant alerts for new saree collections & exclusive offers
                </span>
              </div>
            </div>

            {/* Right: VIP Pill + CTA Button */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className="hidden sm:inline-flex items-center text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                VIP Channel
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm transition-all group-hover:scale-105 active:scale-95">
                <span>Join Channel</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
