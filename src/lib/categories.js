// Shared Categories Store / Configuration
// Connects Admin Dashboard Category Management with the Frontend Header / Navbar and Browse Categories

export const INITIAL_CATEGORIES = [
  {
    id: "new-arrivals",
    label: "New Arrivals",
    name: "New Arrivals",
    href: "/products?cat=new-arrivals",
    image: "/images/product-1.jpg",
    sort_order: 1,
    featured: true,
    subcategories: [
      { label: "Latest Weekly Drops", href: "/products?cat=new-arrivals&sub=latest-drops" },
      { label: "Festive Season Edit", href: "/products?cat=new-arrivals&sub=festive-edit" },
      { label: "Trending Handlooms", href: "/products?cat=new-arrivals&sub=trending-handlooms" },
    ],
    showcase: [
      {
        title: "Aqua Bloom – Pure Kota French Knot Saree",
        price: "Rs. 3,100.00",
        image: "/images/product-1.jpg",
      },
      {
        title: "Aqua Blossom – Neem Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-2.jpg",
      },
      {
        title: "Aqua Blush – Semi Kanchipuram Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-3.jpg",
      },
    ],
  },
  {
    id: "exotic-cotton",
    label: "Exotic Cotton Sarees",
    name: "Exotic Cotton Sarees",
    href: "/products?cat=exotic-cotton",
    image: "/images/product-2.jpg",
    sort_order: 2,
    subcategories: [
      { label: "Chettinad Cotton", href: "/products?cat=exotic-cotton&sub=chettinad" },
      { label: "Handloom cotton sarees", href: "/products?cat=exotic-cotton&sub=handloom-cotton" },
      { label: "Linen Cotton", href: "/products?cat=exotic-cotton&sub=linen-cotton" },
      { label: "Mangalagiri Cotton", href: "/products?cat=exotic-cotton&sub=mangalagiri" },
      { label: "Pure cotton", href: "/products?cat=exotic-cotton&sub=pure-cotton" },
      { label: "Semi silk cotton", href: "/products?cat=exotic-cotton&sub=semi-silk-cotton" },
      { label: "Illampillai Cotton", href: "/products?cat=exotic-cotton&sub=illampillai" },
    ],
    showcase: [
      {
        title: "Aqua Bloom – Pure Kota French Knot Saree",
        price: "Rs. 3,100.00",
        image: "/images/product-1.jpg",
      },
      {
        title: "Aqua Blossom – Neem Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-2.jpg",
      },
      {
        title: "Aqua Blush – Semi Kanchipuram Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-3.jpg",
      },
    ],
  },
  {
    id: "silk-sarees",
    label: "Silk Sarees",
    name: "Silk Sarees",
    href: "/products?cat=silk-sarees",
    image: "/images/product-3.jpg",
    sort_order: 3,
    subcategories: [
      { label: "Banarasi silk cotton", href: "/products?cat=silk-sarees&sub=banarasi-silk" },
      { label: "Simple silk cottons", href: "/products?cat=silk-sarees&sub=simple-silk-cottons" },
      { label: "Semi silk cotton", href: "/products?cat=silk-sarees&sub=semi-silk-cotton" },
    ],
    showcase: [
      {
        title: "Aqua Bloom – Pure Kota French Knot Saree",
        price: "Rs. 3,100.00",
        image: "/images/product-1.jpg",
      },
      {
        title: "Aqua Blossom – Neem Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-2.jpg",
      },
      {
        title: "Aqua Blush – Semi Kanchipuram Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-3.jpg",
      },
    ],
  },
  {
    id: "semi-silk",
    label: "Semi Silk Sarees",
    name: "Semi Silk Sarees",
    href: "/products?cat=semi-silk",
    image: "/images/product-4.jpg",
    sort_order: 4,
    subcategories: [
      { label: "Chettinad Cotton", href: "/products?cat=semi-silk&sub=chettinad" },
      { label: "Semi Mangalagiri Pattu", href: "/products?cat=semi-silk&sub=semi-mangalagiri" },
      { label: "Semi Kanchipuram Brocade", href: "/products?cat=semi-silk&sub=semi-kanchipuram" },
    ],
    showcase: [
      {
        title: "Aqua Bloom – Pure Kota French Knot Saree",
        price: "Rs. 3,100.00",
        image: "/images/product-1.jpg",
      },
      {
        title: "Aqua Blossom – Neem Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-2.jpg",
      },
      {
        title: "Aqua Blush – Semi Kanchipuram Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-3.jpg",
      },
    ],
  },
  {
    id: "thoranam-collection",
    label: "Thoranam Collection",
    name: "Thoranam Collection",
    href: "/products?cat=thoranam-collection",
    image: "/images/bestseller-1.jpg",
    sort_order: 5,
    subcategories: [
      { label: "Banarasi silk cotton", href: "/products?cat=thoranam-collection&sub=banarasi-silk" },
      { label: "Chettinad Cotton", href: "/products?cat=thoranam-collection&sub=chettinad" },
      { label: "Coimbatore Cotton", href: "/products?cat=thoranam-collection&sub=coimbatore-cotton" },
      { label: "cotton printed sarees", href: "/products?cat=thoranam-collection&sub=cotton-printed" },
    ],
    showcase: [
      {
        title: "Aqua Bloom – Pure Kota French Knot Saree",
        price: "Rs. 3,100.00",
        image: "/images/product-1.jpg",
      },
      {
        title: "Aqua Blossom – Neem Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-2.jpg",
      },
      {
        title: "Aqua Blush – Semi Kanchipuram Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-3.jpg",
      },
    ],
  },
  {
    id: "pure-cotton",
    label: "Pure Cotton",
    name: "Pure Cotton",
    href: "/products?cat=pure-cotton",
    image: "/images/bestseller-2.jpg",
    sort_order: 6,
    subcategories: [
      { label: "Handloom cotton sarees", href: "/products?cat=pure-cotton&sub=handloom-cotton" },
      { label: "Chettinad Cotton", href: "/products?cat=pure-cotton&sub=chettinad" },
      { label: "Linen Cotton", href: "/products?cat=pure-cotton&sub=linen-cotton" },
    ],
    showcase: [
      {
        title: "Aqua Bloom – Pure Kota French Knot Saree",
        price: "Rs. 3,100.00",
        image: "/images/product-1.jpg",
      },
      {
        title: "Aqua Blossom – Neem Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-2.jpg",
      },
      {
        title: "Aqua Blush – Semi Kanchipuram Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-3.jpg",
      },
    ],
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
