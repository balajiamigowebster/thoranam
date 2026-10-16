"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import Container from "@/components/ui/Container";

export default function Footer() {
  const findUsOn = [
    { label: "Thoranam Official", href: "https://instagram.com" },
    { label: "Brides of Thoranam", href: "https://instagram.com" },
    { label: "Thoranam Wedding Collection", href: "https://instagram.com" },
  ];

  const aboutUs = [
    { label: "Our Story", href: "/about" },
    { label: "Physical Store", href: "/contact" },
    { label: "Gift Cards", href: "/products" },
    { label: "Awards", href: "/about" },
    { label: "Blogs", href: "/blogs" },
    { label: "Careers", href: "/careers" },
    { label: "Customer Reviews", href: "/reviews" },
  ];

  const ourPolicies = [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Safe Purchase", href: "/safe-purchase" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Returns & Exchange", href: "/returns" },
  ];

  const popularSearches = [
    { label: "Kanchipuram Silk Sarees", href: "/products?cat=kanchipuram" },
    { label: "Bridal Silk Sarees", href: "/products?cat=bridal-silk" },
    { label: "Handloom Cotton Sarees", href: "/products?cat=handloom-cotton" },
    { label: "Soft Silk Sarees", href: "/products?cat=soft-silk" },
    { label: "Designer Sarees", href: "/products?cat=designer-sarees" },
    { label: "Party Wear Sarees", href: "/products?cat=party-wear" },
    { label: "Half Saree", href: "/products?cat=half-saree" },
    { label: "Wedding Sarees", href: "/products?cat=wedding-sarees" },
    { label: "Ready Made Blouse", href: "/products?cat=blouses" },
    { label: "Bridal Blouse", href: "/products?cat=bridal-blouse" },
  ];

  return (
    <footer className="w-full bg-[#800F17] text-[#FAF4EB] border-t border-rose-900/60 mt-auto selection:bg-amber-400 selection:text-[#800F17]">
      <Container className="py-14 sm:py-16">
        {/* Main 4-Column Navigation Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12">
          {/* Column 1: FIND US ON */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-[13px] font-bold tracking-[0.15em] uppercase text-amber-200/90 pb-1 border-b border-amber-200/20 inline-block">
              FIND US ON
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {findUsOn.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-stone-200/90 hover:text-white transition-colors duration-150 inline-block hover:translate-x-0.5 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT US */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-[13px] font-bold tracking-[0.15em] uppercase text-amber-200/90 pb-1 border-b border-amber-200/20 inline-block">
              ABOUT US
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {aboutUs.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-stone-200/90 hover:text-white transition-colors duration-150 inline-block hover:translate-x-0.5 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: OUR POLICIES */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-[13px] font-bold tracking-[0.15em] uppercase text-amber-200/90 pb-1 border-b border-amber-200/20 inline-block">
              OUR POLICIES
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              {ourPolicies.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-stone-200/90 hover:text-white transition-colors duration-150 inline-block hover:translate-x-0.5 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: CONNECT */}
          <div className="space-y-4">
            <h3 className="text-xs sm:text-[13px] font-bold tracking-[0.15em] uppercase text-amber-200/90 pb-1 border-b border-amber-200/20 inline-block">
              CONNECT
            </h3>
            <div className="space-y-3 pt-1">
              <a
                href="mailto:enquiry@thoranamsarees.com"
                className="inline-flex items-center gap-2.5 text-xs sm:text-[13px] text-stone-200/90 hover:text-amber-200 transition-colors group"
              >
                <Mail className="w-4 h-4 text-amber-200/90 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="break-all">enquiry@thoranamsarees.com</span>
              </a>

              {/* Social icons row for a premium touch */}
              <div className="pt-2 flex items-center gap-3 text-amber-200/80">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* POPULAR SAREE SEARCHES Divider & Content */}
        <div className="pt-8 border-t border-amber-200/20 text-center space-y-4">
          <h4 className="text-xs sm:text-[13px] font-bold tracking-[0.2em] uppercase text-amber-200/90">
            POPULAR SAREE SEARCHES
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[11px] sm:text-xs text-stone-200/80 leading-relaxed max-w-5xl mx-auto">
            {popularSearches.map((item, idx) => (
              <span key={item.label} className="inline-flex items-center">
                <Link
                  href={item.href}
                  className="hover:text-amber-200 transition-colors"
                >
                  {item.label}
                </Link>
                {idx < popularSearches.length - 1 && (
                  <span className="mx-2 text-stone-400/50">|</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright strip */}
        <div className="mt-10 pt-6 border-t border-amber-200/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] sm:text-xs text-stone-300/80 tracking-wide">
          <p>
            © 2026 Thoranam Luxury Saree Boutique. All Rights Reserved.
          </p>
          <p>
            Designed by{" "}
            <a
              href="https://amigowebster.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-200 hover:text-white font-medium underline underline-offset-4 decoration-amber-200/40 hover:decoration-white transition-colors"
            >
              Amigowebster
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
