"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  RotateCcw,
  Search,
  Check,
  ChevronLeft,
} from "lucide-react";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import { getApiUrl } from "@/config";
import { getStoredProducts, fetchProductsFromDb } from "@/lib/products";

// Kalamandir matching sort options
const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "relevant", label: "Most relevant" },
  { id: "best-selling", label: "Best selling" },
  { id: "alpha-asc", label: "Alphabetically, A-Z" },
  { id: "alpha-desc", label: "Alphabetically, Z-A" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "date-asc", label: "Date, old to new" },
  { id: "date-desc", label: "Date, new to old" },
];

export default function Products() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCat = searchParams.get("cat");
  const urlSub = searchParams.get("sub");
  const initialCategoryParam = urlSub || urlCat;

  const [products, setProducts] = useState(getStoredProducts);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(() => getStoredProducts().length === 0);

  // Filter States
  const [selectedSort, setSelectedSort] = useState("relevant");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef(null);

  // Price Bounds & Range
  const [priceBounds, setPriceBounds] = useState({ min: 500, max: 10000 });
  const [priceRange, setPriceRange] = useState([500, 10000]);
  const [minInput, setMinInput] = useState("500");
  const [maxInput, setMaxInput] = useState("10000");

  // Category search in sidebar
  const [catSearch, setCatSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Horizontal top categories scroll ref
  const topCategoriesRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [prodData, catRes] = await Promise.all([
          fetchProductsFromDb(),
          fetch(getApiUrl("/api/categories")),
        ]);
        const catJson = await catRes.json();

        if (mounted) {
          if (Array.isArray(prodData) && prodData.length > 0) {
            setProducts(prodData);

            // Compute actual price bounds from products
            const prices = prodData
              .map((p) => {
                const num = parseFloat(String(p.price || "0").replace(/[^0-9.]/g, ""));
                return isNaN(num) ? 0 : num;
              })
              .filter((n) => n > 0);

            if (prices.length > 0) {
              const minP = Math.floor(Math.min(...prices) / 100) * 100;
              const maxP = Math.ceil(Math.max(...prices) / 100) * 100;
              setPriceBounds({ min: minP, max: maxP });
              setPriceRange([minP, maxP]);
              setMinInput(String(minP));
              setMaxInput(String(maxP));
            }
          }

          if (catJson.success && Array.isArray(catJson.data)) {
            setCategories(catJson.data);
          }
        }
      } catch (err) {
        console.error("Error loading products catalog:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Active Category derived from URL
  const selectedCat = useMemo(() => {
    if (!initialCategoryParam || initialCategoryParam.toLowerCase() === "thoranam-collection" || initialCategoryParam === "all") {
      return "all";
    }
    const found = categories.find(
      (c) =>
        c.id?.toLowerCase() === initialCategoryParam.toLowerCase() ||
        c.label?.toLowerCase() === initialCategoryParam.toLowerCase() ||
        c.name?.toLowerCase() === initialCategoryParam.toLowerCase()
    );
    return found ? (found.label || found.name || found.id) : initialCategoryParam;
  }, [initialCategoryParam, categories]);

  const handleSelectCategory = (catValue) => {
    if (catValue === "all") {
      router.push("/products", { scroll: false });
    } else {
      const catObj = categories.find(
        (c) => c.label === catValue || c.id === catValue || c.name === catValue
      );
      const queryId = catObj?.id || catValue;
      router.push(`/products?cat=${encodeURIComponent(queryId)}`, { scroll: false });
    }
  };

  // Helper to extract numeric price
  const getNumericPrice = (p) => {
    if (typeof p.price === "number") return p.price;
    const num = parseFloat(String(p.price || "0").replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Category counts dictionary
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category || "Exclusive";
      counts[cat] = (counts[cat] || 0) + 1;
      // Also match against category labels/ids
      categories.forEach((c) => {
        const cLabel = (c.label || c.name || "").toLowerCase();
        const cId = (c.id || "").toLowerCase();
        if (cat.toLowerCase() === cLabel || cat.toLowerCase() === cId) {
          counts[c.label || c.name || c.id] = (counts[c.label || c.name || c.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [products, categories]);

  // Handle Dual Range Slider changes
  const handleMinSliderChange = (e) => {
    const val = Math.min(Number(e.target.value), priceRange[1] - 100);
    setPriceRange([val, priceRange[1]]);
    setMinInput(String(val));
  };

  const handleMaxSliderChange = (e) => {
    const val = Math.max(Number(e.target.value), priceRange[0] + 100);
    setPriceRange([priceRange[0], val]);
    setMaxInput(String(val));
  };

  const handleMinInputChange = (e) => {
    setMinInput(e.target.value);
    const num = Number(e.target.value);
    if (!isNaN(num) && num >= priceBounds.min && num < priceRange[1]) {
      setPriceRange([num, priceRange[1]]);
    }
  };

  const handleMaxInputChange = (e) => {
    setMaxInput(e.target.value);
    const num = Number(e.target.value);
    if (!isNaN(num) && num <= priceBounds.max && num > priceRange[0]) {
      setPriceRange([priceRange[0], num]);
    }
  };

  const handleResetFilters = () => {
    setPriceRange([priceBounds.min, priceBounds.max]);
    setMinInput(String(priceBounds.min));
    setMaxInput(String(priceBounds.max));
    setInStockOnly(false);
    setSelectedSort("relevant");
    handleSelectCategory("all");
  };

  const isPriceFiltered =
    priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max;
  const isAnyFilterActive =
    selectedCat !== "all" || isPriceFiltered || inStockOnly;

  // Filter and Sort Products
  const filteredAndSortedProducts = useMemo(() => {
    const result = products.filter((p) => {
      // 1. Category Filter
      if (selectedCat !== "all" && selectedCat.toLowerCase() !== "thoranam-collection") {
        const catLow = selectedCat.toLowerCase();
        const pCatLow = (p.category || "").toLowerCase();
        let match = pCatLow === catLow;
        if (!match) {
          const matchedCategory = categories.find(
            (c) =>
              c.id?.toLowerCase() === catLow ||
              c.label?.toLowerCase() === catLow ||
              c.name?.toLowerCase() === catLow
          );
          if (matchedCategory) {
            match =
              pCatLow === (matchedCategory.label || "").toLowerCase() ||
              pCatLow === (matchedCategory.id || "").toLowerCase() ||
              pCatLow === (matchedCategory.name || "").toLowerCase();
          }
        }
        if (!match) return false;
      }

      // 2. Price Filter
      const price = getNumericPrice(p);
      if (price > 0 && (price < priceRange[0] || price > priceRange[1])) {
        return false;
      }

      // 3. In-Stock Filter
      if (inStockOnly && Number(p.stock) <= 0) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      const priceA = getNumericPrice(a);
      const priceB = getNumericPrice(b);

      switch (selectedSort) {
        case "featured":
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case "best-selling":
          return (Number(b.stock) || 0) - (Number(a.stock) || 0);
        case "alpha-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "alpha-desc":
          return (b.title || "").localeCompare(a.title || "");
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "date-asc":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "date-desc":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "relevant":
        default:
          return Number(b.id) - Number(a.id);
      }
    });

    return result;
  }, [products, categories, selectedCat, priceRange, inStockOnly, selectedSort]);

  // Sidebar Categories list filtered by search
  const displayedSidebarCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const q = catSearch.toLowerCase();
    return categories.filter(
      (c) =>
        (c.label || "").toLowerCase().includes(q) ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.id || "").toLowerCase().includes(q)
    );
  }, [categories, catSearch]);

  const scrollTopCategories = (direction) => {
    if (topCategoriesRef.current) {
      const scrollAmt = direction === "left" ? -280 : 280;
      topCategoriesRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  const selectedSortOption =
    SORT_OPTIONS.find((s) => s.id === selectedSort) || SORT_OPTIONS[1];

  // Reusable Filter Sidebar Content (Used for Desktop Sidebar & Mobile Drawer)
  const FilterSidebarContent = (
    <div className="space-y-6">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#800F17]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
            Filters
          </h2>
        </div>
        {isAnyFilterActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-[#800F17] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. PRICE FILTER (Matching Kalamandir Reference) */}
      <div className="space-y-3.5 pb-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Price
          </h3>
          {isPriceFiltered && (
            <button
              onClick={() => {
                setPriceRange([priceBounds.min, priceBounds.max]);
                setMinInput(String(priceBounds.min));
                setMaxInput(String(priceBounds.max));
              }}
              className="text-[11px] text-stone-500 hover:text-[#800F17] cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Min / Max Input Boxes */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500">
              ₹
            </span>
            <input
              type="number"
              aria-label="Minimum price"
              value={minInput}
              onChange={handleMinInputChange}
              className="w-full pl-6 pr-2 py-2 text-xs font-semibold text-stone-900 bg-white rounded-lg border border-stone-200 focus:outline-none focus:border-[#800F17] focus:ring-1 focus:ring-[#800F17] shadow-2xs"
            />
          </div>
          <span className="text-stone-300 font-medium">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500">
              ₹
            </span>
            <input
              type="number"
              aria-label="Maximum price"
              value={maxInput}
              onChange={handleMaxInputChange}
              className="w-full pl-6 pr-2 py-2 text-xs font-semibold text-stone-900 bg-white rounded-lg border border-stone-200 focus:outline-none focus:border-[#800F17] focus:ring-1 focus:ring-[#800F17] shadow-2xs"
            />
          </div>
        </div>

        {/* Dual Range Slider with Highlight Track */}
        <div className="pt-2 pb-1">
          <div className="relative h-2 w-full flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-1.5 bg-stone-200 rounded-full" />
            {/* Active Range Fill */}
            <div
              className="absolute h-1.5 bg-[#800F17] rounded-full"
              style={{
                left: `${((priceRange[0] - priceBounds.min) / (priceBounds.max - priceBounds.min || 1)) * 100}%`,
                width: `${((priceRange[1] - priceRange[0]) / (priceBounds.max - priceBounds.min || 1)) * 100}%`,
              }}
            />
            {/* Dual Slider Inputs */}
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={priceRange[0]}
              onChange={handleMinSliderChange}
              aria-label="Minimum price slider"
              className="absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#800F17] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#800F17] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={priceRange[1]}
              onChange={handleMaxSliderChange}
              aria-label="Maximum price slider"
              className="absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#800F17] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#800F17] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Formatted Price Text (Matching Kalamandir format) */}
        <p className="text-xs text-stone-600 font-medium">
          Price: Rs. {priceRange[0].toLocaleString("en-IN")} - Rs.{" "}
          {priceRange[1].toLocaleString("en-IN")}
        </p>
      </div>

      {/* 2. CATEGORIES FILTER (Searchable & Elegant) */}
      <div className="space-y-3 pb-6 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Categories
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {categories.length}
          </span>
        </div>

        {/* Category search inside sidebar if many categories */}
        {categories.length > 8 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search category..."
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white placeholder-stone-400 focus:outline-none focus:border-[#800F17]"
            />
            {catSearch && (
              <button
                onClick={() => setCatSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Category Options */}
        <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {/* All Sarees Option */}
          <button
            type="button"
            onClick={() => handleSelectCategory("all")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
              selectedCat === "all"
                ? "bg-rose-50 text-[#800F17] font-bold"
                : "text-stone-700 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedCat === "all"
                    ? "border-[#800F17] bg-[#800F17]"
                    : "border-stone-300 bg-white"
                }`}
              >
                {selectedCat === "all" && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              <span className="truncate">All Sarees</span>
            </div>
            <span className="text-[11px] text-stone-400 shrink-0 font-normal">
              ({products.length})
            </span>
          </button>

          {/* List Categories */}
          {displayedSidebarCategories.map((c) => {
            const catName = c.label || c.name || c.id;
            const isCatSelected =
              selectedCat.toLowerCase() === catName.toLowerCase() ||
              selectedCat.toLowerCase() === (c.id || "").toLowerCase();
            const count = categoryCounts[catName] || categoryCounts[c.id] || 0;

            return (
              <button
                key={c.id || c.label}
                type="button"
                onClick={() => handleSelectCategory(catName)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isCatSelected
                    ? "bg-rose-50 text-[#800F17] font-bold"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isCatSelected
                        ? "border-[#800F17] bg-[#800F17]"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isCatSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <span className="truncate">{catName}</span>
                </div>
                {count > 0 && (
                  <span className="text-[11px] text-stone-400 shrink-0 font-normal">
                    ({count})
                  </span>
                )}
              </button>
            );
          })}

          {displayedSidebarCategories.length === 0 && (
            <p className="text-xs text-stone-400 py-3 text-center">
              No categories match &ldquo;{catSearch}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* 3. AVAILABILITY FILTER */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 text-[#800F17] focus:ring-[#800F17] cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-stone-50/40 min-h-screen pb-20">
      <Container className="pt-5 sm:pt-7">
        {/* Breadcrumbs matching Kalamandir Reference */}
        <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-4 flex-wrap">
          <Link href="/" className="hover:text-stone-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-stone-700 transition-colors">
            Products
          </Link>
          {selectedCat !== "all" && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#800F17] font-semibold">{selectedCat}</span>
            </>
          )}
        </nav>

        {/* Page Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-stone-200/80">
          <div>
            <span className="text-[#800F17] font-semibold text-[11px] uppercase tracking-widest bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 inline-block mb-1.5">
              Curated Boutique Collection
            </span>
            <h1
              style={{ fontFamily: '"Proza Libre", sans-serif' }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight"
            >
              {selectedCat === "all" ? "Thoranam Boutique Catalog" : selectedCat}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Explore handloom silks, exotic cottons, and heirloom weaves crafted with timeless artistry.
            </p>
          </div>
        </div>

        {/* ================= PREMIUM HORIZONTAL CATEGORY SCROLLER ================= */}
        {/* Replaces the messy wrapped cloud with a sleek luxury single-line ribbon */}
        <div className="relative mb-8 group">
          <button
            type="button"
            onClick={() => scrollTopCategories("left")}
            aria-label="Scroll categories left"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-7 h-7 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:text-[#800F17] z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={topCategoriesRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            <button
              type="button"
              onClick={() => handleSelectCategory("all")}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                selectedCat === "all"
                  ? "bg-[#800F17] text-white shadow-xs"
                  : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400 hover:text-stone-900"
              }`}
            >
              All Sarees ({products.length})
            </button>
            {categories.map((c) => {
              const catName = c.label || c.name || c.id;
              const isSelected = selectedCat.toLowerCase() === catName.toLowerCase();
              const count = categoryCounts[catName] || categoryCounts[c.id] || 0;

              return (
                <button
                  key={c.id || c.label}
                  type="button"
                  onClick={() => handleSelectCategory(catName)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                    isSelected
                      ? "bg-[#800F17] text-white font-semibold shadow-xs"
                      : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400 hover:text-stone-900"
                  }`}
                >
                  <span>{catName}</span>
                  {count > 0 && (
                    <span
                      className={`ml-1.5 text-[11px] ${
                        isSelected ? "text-rose-200" : "text-stone-400"
                      }`}
                    >
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollTopCategories("right")}
            aria-label="Scroll categories right"
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-7 h-7 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:text-[#800F17] z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ================= MAIN CATALOG WITH LEFT SIDEBAR FILTERS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* DESKTOP LEFT SIDEBAR FILTERS */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs sticky top-[195px] self-start max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
            {FilterSidebarContent}
          </aside>

          {/* RIGHT PRODUCTS MAIN CONTENT */}
          <div className="lg:col-span-9 space-y-5">
            {/* TOP RESULTS BAR & SORT DROPDOWN (Matching Kalamandir Reference Image) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              {/* Left: Total Results Count */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 shadow-2xs active:scale-95 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#800F17]" />
                  <span>Filters</span>
                  {isAnyFilterActive && (
                    <span className="w-2 h-2 rounded-full bg-[#800F17]" />
                  )}
                </button>

                <p className="text-xs sm:text-sm font-medium text-stone-700">
                  There are{" "}
                  <strong className="font-bold text-stone-900">
                    {filteredAndSortedProducts.length}
                  </strong>{" "}
                  results in total
                </p>
              </div>

              {/* Right: Kalamandir-Style "Sort by:" Dropdown */}
              <div className="relative self-end sm:self-auto" ref={sortRef}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium whitespace-nowrap">
                    Sort by:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="inline-flex items-center justify-between gap-2 px-3 py-1.5 min-w-[170px] rounded-lg border border-stone-200 bg-white text-xs font-semibold text-stone-800 shadow-2xs hover:border-stone-400 focus:outline-none transition-all cursor-pointer"
                  >
                    <span className="truncate">{selectedSortOption.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                        sortDropdownOpen ? "rotate-180 text-[#800F17]" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Menu matching Kalamandir screenshot */}
                {sortDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = selectedSort === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedSort(opt.id);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-rose-50 text-[#800F17] font-bold"
                              : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#800F17]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filter Badges */}
            {isAnyFilterActive && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] font-medium text-stone-500">
                  Active Filters:
                </span>
                {selectedCat !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#800F17] text-xs font-medium">
                    <span>Category: {selectedCat}</span>
                    <button
                      onClick={() => handleSelectCategory("all")}
                      className="hover:text-red-900 cursor-pointer"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {isPriceFiltered && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#800F17] text-xs font-medium">
                    <span>
                      Price: ₹{priceRange[0].toLocaleString("en-IN")} - ₹
                      {priceRange[1].toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => {
                        setPriceRange([priceBounds.min, priceBounds.max]);
                        setMinInput(String(priceBounds.min));
                        setMaxInput(String(priceBounds.max));
                      }}
                      className="hover:text-red-900 cursor-pointer"
                      aria-label="Remove price filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#800F17] text-xs font-medium">
                    <span>In Stock Only</span>
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="hover:text-red-900 cursor-pointer"
                      aria-label="Remove in stock filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-stone-500 hover:text-[#800F17] underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Saree Grid (3 Columns on Desktop with Sidebar) */}
            {isLoading && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-5 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-2 sm:p-3 border border-stone-200"
                  >
                    <div className="aspect-[3/4] w-full rounded-xl bg-stone-200" />
                    <div className="pt-3 space-y-2">
                      <div className="h-4 w-3/4 bg-stone-200 rounded" />
                      <div className="h-4 w-1/3 bg-rose-200/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-5">
                  {filteredAndSortedProducts.map((item) => (
                    <ProductCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      price={item.price}
                      image={item.mainImage || "/images/product-1.jpg"}
                      galleryImages={item.galleryImages || item.gallery_images}
                      category={item.category || "Exclusive"}
                      stock={item.stock}
                      href={`/products/${item.id}`}
                    />
                  ))}
                </div>

                {filteredAndSortedProducts.length === 0 && (
                  <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs">
                    <p className="text-base font-bold text-stone-800">
                      No sarees match your selected filters.
                    </p>
                    <p className="text-xs text-stone-500">
                      Try expanding your price range or selecting another category.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-[#800F17] hover:bg-[#660B12] text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* ================= MOBILE SLIDE-OVER FILTER DRAWER ================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Slide-over Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-5 overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#800F17]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Filter Sarees
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {FilterSidebarContent}

            <div className="pt-6 mt-6 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#800F17] text-white text-xs font-bold uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Show Results ({filteredAndSortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
