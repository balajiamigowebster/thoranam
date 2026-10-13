"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_LINKS } from "@/lib/navigation";

export default function Navbar({ className = "" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className={`w-full bg-white border-b border-rose-100/70 shadow-xs ${className}`}>
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
        <ul className="flex items-center justify-start md:justify-center gap-6 sm:gap-8 lg:gap-10 py-3 whitespace-nowrap min-w-max md:min-w-0">
          {CATEGORY_LINKS.map((item) => {
            const currentCat = searchParams.get("cat");
            const itemCat = item.href.split("cat=")[1];
            const isActive = currentCat === itemCat;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`text-xs sm:text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? "text-rose-900 font-semibold"
                      : "text-rose-800/90 hover:text-rose-950"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rose-800 rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
