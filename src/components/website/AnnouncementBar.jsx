"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ANNOUNCEMENT_MESSAGES } from "@/lib/navigation";

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + ANNOUNCEMENT_MESSAGES.length) % ANNOUNCEMENT_MESSAGES.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
  };

  return (
    <div className="w-full bg-white border-b border-rose-100/60 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium text-rose-800">
        <button
          onClick={handlePrev}
          aria-label="Previous announcement"
          className="p-1 hover:text-rose-950 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <p className="text-center truncate px-2 select-none tracking-wide">
          {ANNOUNCEMENT_MESSAGES[currentIndex]}
        </p>

        <button
          onClick={handleNext}
          aria-label="Next announcement"
          className="p-1 hover:text-rose-950 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
