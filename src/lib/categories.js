// Shared Categories Store / Configuration
// Connects Admin Dashboard Category Management with the Frontend Header / Navbar

export const INITIAL_CATEGORIES = [
  {
    id: "new-arrivals",
    label: "New Arrivals",
    href: "/products?cat=new-arrivals",
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
    href: "/products?cat=exotic-cotton",
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
    href: "/products?cat=silk-sarees",
    subcategories: [
      { label: "Banarasi silk cotton", href: "/products?cat=silk-sarees&sub=banarasi-silk" },
      { label: "Simple silk cottons", href: "/products?cat=silk-sarees&sub=simple-silk-cottons" },
      { label: "Semi silk cotton", href: "/products?cat=silk-sarees&sub=semi-silk-cotton" },
    ],
    showcase: [
      {
        title: "Kanchipuram Brocade Pure Silk",
        price: "Rs. 8,900.00",
        image: "/images/product-1.jpg",
      },
      {
        title: "Golden Banarasi Zari Silk Saree",
        price: "Rs. 7,450.00",
        image: "/images/product-2.jpg",
      },
      {
        title: "Mysore Traditional Crepe Silk",
        price: "Rs. 4,800.00",
        image: "/images/product-4.jpg",
      },
    ],
  },
  {
    id: "semi-silk",
    label: "Semi Silk Sarees",
    href: "/products?cat=semi-silk",
    subcategories: [
      { label: "Semi Mangalagiri Pattu", href: "/products?cat=semi-silk&sub=semi-mangalagiri" },
      { label: "Semi Kanchipuram Brocade", href: "/products?cat=semi-silk&sub=semi-kanchipuram" },
      { label: "Soft Silk Weaves", href: "/products?cat=semi-silk&sub=soft-silk" },
    ],
    showcase: [
      {
        title: "Aqua Blush – Semi Kanchipuram Silk Saree",
        price: "Rs. 2,100.00",
        image: "/images/product-3.jpg",
      },
      {
        title: "Semi Mangalagiri Zari Border",
        price: "Rs. 2,899.00",
        image: "/images/product-2.jpg",
      },
    ],
  },
  {
    id: "thoranam-exclusive",
    label: "Thoranam Collection",
    href: "/products?cat=thoranam-exclusive",
    subcategories: [
      { label: "Heritage Bridal Edit", href: "/products?cat=thoranam-exclusive&sub=bridal" },
      { label: "Artisan Handcrafted Sarees", href: "/products?cat=thoranam-exclusive&sub=handcrafted" },
      { label: "Designer Festive Boutique", href: "/products?cat=thoranam-exclusive&sub=designer" },
    ],
    showcase: [
      {
        title: "Thoranam Royal Signature Silk",
        price: "Rs. 12,500.00",
        image: "/images/bestseller-1.jpg",
      },
    ],
  },
  {
    id: "pure-cotton",
    label: "Pure Cotton",
    href: "/products?cat=pure-cotton",
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
        title: "Natural Organic Handspun Cotton",
        price: "Rs. 1,850.00",
        image: "/images/product-4.jpg",
      },
    ],
  },
];

// Helper to get active categories from localStorage (with fallback to INITIAL_CATEGORIES)
export function getStoredCategories() {
  if (typeof window === "undefined") return INITIAL_CATEGORIES;
  try {
    const saved = localStorage.getItem("thoranam_categories");
    if (saved) {
      return JSON.parse(saved);
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
