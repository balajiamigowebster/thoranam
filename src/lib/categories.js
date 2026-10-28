// Shared Categories Store / Configuration
// Connects Admin Dashboard Category Management with the Frontend Header / Navbar and Browse Categories

export const INITIAL_CATEGORIES = [
  {
    id: "bamboo-cotton-silk",
    label: "Bamboo Cotton Silk",
    name: "Bamboo Cotton Silk",
    href: "/products?cat=bamboo-cotton-silk",
    image: "/images/product-1.jpg",
    sort_order: 1,
    featured: true,
    subcategories: [],
    showcase: [],
  },
  {
    id: "banarasi-silk-cotton",
    label: "Banarasi silk cotton",
    name: "Banarasi silk cotton",
    href: "/products?cat=banarasi-silk-cotton",
    image: "/images/product-2.jpg",
    sort_order: 2,
    featured: true,
    subcategories: [],
    showcase: [],
  },
  {
    id: "bengali-cotton-with-zari-border",
    label: "Bengali Cotton with Zari Border",
    name: "Bengali Cotton with Zari Border",
    href: "/products?cat=bengali-cotton-with-zari-border",
    image: "/images/product-3.jpg",
    sort_order: 3,
    featured: true,
    subcategories: [],
    showcase: [],
  },
  {
    id: "coimbatore-cotton",
    label: "Coimbatore Cotton",
    name: "Coimbatore Cotton",
    href: "/products?cat=coimbatore-cotton",
    image: "/images/product-4.jpg",
    sort_order: 4,
    featured: true,
    subcategories: [],
    showcase: [],
  },
  {
    id: "cotton-printed-sarees",
    label: "cotton printed sarees",
    name: "cotton printed sarees",
    href: "/products?cat=cotton-printed-sarees",
    image: "/images/product-1.jpg",
    sort_order: 5,
    featured: true,
    subcategories: [],
    showcase: [],
  },
  {
    id: "fancy-saree",
    label: "Fancy Sarees",
    name: "Fancy Sarees",
    href: "/products?cat=fancy-saree",
    image: "/images/product-4.jpg",
    sort_order: 6,
    featured: true,
    subcategories: [],
    showcase: [],
  },
  {
    id: "crushed-organza-pure",
    label: "Crushed Organza Pure",
    name: "Crushed Organza Pure",
    href: "/products?cat=crushed-organza-pure",
    image: "/images/product-2.jpg",
    sort_order: 7,
    featured: true,
    subcategories: [],
    showcase: [],
  },
  {
    id: "digital-print-saree-with-blouse",
    label: "Digital Print Saree with Blouse",
    name: "Digital Print Saree with Blouse",
    href: "/products?cat=digital-print-saree-with-blouse",
    image: "/images/product-3.jpg",
    sort_order: 8,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "garden-silk-saree",
    label: "Garden Silk Saree",
    name: "Garden Silk Saree",
    href: "/products?cat=garden-silk-saree",
    image: "/images/product-1.jpg",
    sort_order: 9,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "handloom-cotton-sarees",
    label: "Handloom cotton sarees",
    name: "Handloom cotton sarees",
    href: "/products?cat=handloom-cotton-sarees",
    image: "/images/product-2.jpg",
    sort_order: 10,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "chettinad-cotton",
    label: "Chettinad Cotton",
    name: "Chettinad Cotton",
    href: "/products?cat=chettinad-cotton",
    image: "/images/product-3.jpg",
    sort_order: 11,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "linen-cotton",
    label: "Linen Cotton",
    name: "Linen Cotton",
    href: "/products?cat=linen-cotton",
    image: "/images/product-4.jpg",
    sort_order: 12,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "mangalagiri-cotton",
    label: "Mangalagiri Cotton",
    name: "Mangalagiri Cotton",
    href: "/products?cat=mangalagiri-cotton",
    image: "/images/product-1.jpg",
    sort_order: 13,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "pure-cotton",
    label: "Pure cotton",
    name: "Pure cotton",
    href: "/products?cat=pure-cotton",
    image: "/images/product-2.jpg",
    sort_order: 14,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "semi-silk-cotton",
    label: "Semi silk cotton",
    name: "Semi silk cotton",
    href: "/products?cat=semi-silk-cotton",
    image: "/images/product-3.jpg",
    sort_order: 15,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "illampillai-cotton",
    label: "Illampillai Cotton",
    name: "Illampillai Cotton",
    href: "/products?cat=illampillai-cotton",
    image: "/images/product-4.jpg",
    sort_order: 16,
    featured: false,
    subcategories: [],
    showcase: [],
  },
  {
    id: "simple-silk-cottons",
    label: "Simple silk cottons",
    name: "Simple silk cottons",
    href: "/products?cat=simple-silk-cottons",
    image: "/images/product-1.jpg",
    sort_order: 17,
    featured: false,
    subcategories: [],
    showcase: [],
  },
];

// 8 Saree Categories for Homepage "Browse Our Categories" Circles
export const HOMEPAGE_BROWSE_CATEGORIES = [
  {
    id: "handloom-cotton",
    name: "Handloom cotton sarees",
    label: "Handloom cotton sarees",
    href: "/products?cat=exotic-cotton&sub=handloom-cotton",
    image: "/images/product-1.jpg",
  },
  {
    id: "banarasi-silk",
    name: "Banarasi silk cotton",
    label: "Banarasi silk cotton",
    href: "/products?cat=silk-sarees&sub=banarasi-silk",
    image: "/images/product-2.jpg",
  },
  {
    id: "illampillai-cotton",
    name: "Illampillai Cotton",
    label: "Illampillai Cotton",
    href: "/products?cat=exotic-cotton&sub=illampillai",
    image: "/images/product-3.jpg",
  },
  {
    id: "pure-cotton",
    name: "Pure cotton",
    label: "Pure cotton",
    href: "/products?cat=pure-cotton",
    image: "/images/product-4.jpg",
  },
  {
    id: "chettinad-cotton",
    name: "Chettinad Cotton",
    label: "Chettinad Cotton",
    href: "/products?cat=exotic-cotton&sub=chettinad",
    image: "/images/bestseller-1.jpg",
  },
  {
    id: "cotton-printed",
    name: "cotton printed sarees",
    label: "cotton printed sarees",
    href: "/products?cat=thoranam-collection&sub=cotton-printed",
    image: "/images/bestseller-2.jpg",
  },
  {
    id: "coimbatore-cotton",
    name: "Coimbatore Cotton",
    label: "Coimbatore Cotton",
    href: "/products?cat=thoranam-collection&sub=coimbatore-cotton",
    image: "/images/product-1.jpg",
  },
  {
    id: "mul-cotton",
    name: "MUL Cotton sarees",
    label: "MUL Cotton sarees",
    href: "/products?cat=exotic-cotton&sub=mul-cotton",
    image: "/images/product-2.jpg",
  },
];

// Helper to get active categories from localStorage or API (with fallback to INITIAL_CATEGORIES)
export function getStoredCategories() {
  if (typeof window === "undefined") return INITIAL_CATEGORIES;
  try {
    const saved = localStorage.getItem("thoranam_categories");
    if (saved) {
      const parsed = JSON.parse(saved);
      const isUpToDate =
        Array.isArray(parsed) &&
        parsed.length >= 10 &&
        parsed.some((c) => c.id === "bamboo-cotton-silk" || c.label === "Bamboo Cotton Silk" || c.name === "Bamboo Cotton Silk");
      if (isUpToDate) return parsed;
    }
  } catch (e) {
    console.error("Error reading categories from localStorage", e);
  }
  return INITIAL_CATEGORIES;
}

// Helper to save categories
export function saveStoredCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thoranam_categories", JSON.stringify(categories));
    window.dispatchEvent(new Event("thoranam_categories_updated"));
  } catch (e) {
    console.error("Error saving categories to localStorage", e);
  }
}

// Helper to get active homepage browse categories
export function getStoredBrowseCategories() {
  if (typeof window === "undefined") return HOMEPAGE_BROWSE_CATEGORIES;
  try {
    const saved = localStorage.getItem("thoranam_browse_categories");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const clean = parsed.filter(c => !String(c.id||"").toLowerCase().includes("munga") && !String(c.label||c.name||"").toLowerCase().includes("munga")).slice(0, 8);
        return clean.length > 0 ? clean : HOMEPAGE_BROWSE_CATEGORIES;
      }
    }
  } catch (e) {
    console.error("Error reading browse categories from localStorage", e);
  }
  return HOMEPAGE_BROWSE_CATEGORIES;
}

// Helper to save active homepage browse categories
export function saveStoredBrowseCategories(browseCategories) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("thoranam_browse_categories", JSON.stringify(browseCategories));
    window.dispatchEvent(new Event("thoranam_browse_categories_updated"));
  } catch (e) {
    console.error("Error saving browse categories to localStorage", e);
  }
}

// Helper to get unified and deduplicated category names across DB, initial baseline, and custom products
export function getUnifiedCategories(categories = [], additionalNames = []) {
  const list = [];
  const seen = new Set();

  const add = (val) => {
    if (!val) return;
    const clean = String(val).trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      list.push(clean);
    }
  };

  // 1. Any custom or newly added categories from DB or Categories tab (e.g. Chinyan Cotton Saree)
  (categories || []).forEach((c) => {
    add(typeof c === "string" ? c : (c.label || c.name));
  });

  // 2. All 17 baseline weave categories
  INITIAL_CATEGORIES.forEach((c) => {
    add(c.label || c.name);
  });

  // 3. Any additional category names (e.g. from existing products or current form data)
  (additionalNames || []).forEach((name) => {
    add(name);
  });

  return list;
}
