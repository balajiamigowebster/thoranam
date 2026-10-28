export const ANNOUNCEMENT_MESSAGES = [
  "Shop our latest arrivals!",
  "Complimentary express shipping on orders above ₹2,999",
  "Special festive offer: Flat 15% off on Mangalagiri collections",
];

export const MAIN_NAV_MENUS = [
  {
    id: "semi-silk-sarees",
    label: "Semi Silk Sarees",
    href: "/products?cat=semi-silk-sarees",
    subcategories: [
      { label: "Semi Silk Cotton", href: "/products?cat=semi-silk-cotton" },
      { label: "Simple Silk Cottons", href: "/products?cat=simple-silk-cottons" },
      { label: "Fancy Saree", href: "/products?cat=fancy-saree" },
    ],
  },
  {
    id: "pure-cotton",
    label: "Pure Cotton",
    href: "/products?cat=pure-cotton",
    subcategories: [
      { label: "Pure Cotton", href: "/products?cat=pure-cotton" },
      { label: "Chettinad Cotton", href: "/products?cat=chettinad-cotton" },
      { label: "Coimbatore Cotton", href: "/products?cat=coimbatore-cotton" },
      { label: "Linen Cotton", href: "/products?cat=linen-cotton" },
      { label: "Mangalagiri Cotton", href: "/products?cat=mangalagiri-cotton" },
    ],
  },
  {
    id: "silk-sarees",
    label: "Silk Sarees",
    href: "/products?cat=silk-sarees",
    subcategories: [
      { label: "Bamboo Cotton Silk", href: "/products?cat=bamboo-cotton-silk" },
      { label: "Banarasi Silk Cotton", href: "/products?cat=banarasi-silk-cotton" },
      { label: "Crushed Organza Pure", href: "/products?cat=crushed-organza-pure" },
      { label: "Garden Silk Saree", href: "/products?cat=garden-silk-saree" },
    ],
  },
  {
    id: "new-arrivals",
    label: "New Arrivals",
    href: "/products?cat=new-arrivals",
    subcategories: [
      { label: "Digital Print Saree with Blouse", href: "/products?cat=digital-print-saree-with-blouse" },
      { label: "Cotton Printed Sarees", href: "/products?cat=cotton-printed-sarees" },
      { label: "Crushed Organza Pure", href: "/products?cat=crushed-organza-pure" },
    ],
  },
  {
    id: "exotic-cotton-sarees",
    label: "Exotic Cotton Sarees",
    href: "/products?cat=exotic-cotton-sarees",
    subcategories: [
      { label: "Bengali Cotton with Zari Border", href: "/products?cat=bengali-cotton-with-zari-border" },
      { label: "Handloom Cotton Sarees", href: "/products?cat=handloom-cotton-sarees" },
      { label: "Illampillai Cotton", href: "/products?cat=illampillai-cotton" },
      { label: "Chettinad Cotton", href: "/products?cat=chettinad-cotton" },
    ],
  },
  {
    id: "thoranam-collection",
    label: "Thoranam Collection",
    href: "/products?cat=thoranam-collection",
    subcategories: [
      { label: "Bamboo Cotton Silk", href: "/products?cat=bamboo-cotton-silk" },
      { label: "Banarasi Silk Cotton", href: "/products?cat=banarasi-silk-cotton" },
      { label: "Bengali Cotton with Zari Border", href: "/products?cat=bengali-cotton-with-zari-border" },
      { label: "Coimbatore Cotton", href: "/products?cat=coimbatore-cotton" },
      { label: "Cotton Printed Sarees", href: "/products?cat=cotton-printed-sarees" },
      { label: "Crushed Organza Pure", href: "/products?cat=crushed-organza-pure" },
      { label: "Digital Print Saree with Blouse", href: "/products?cat=digital-print-saree-with-blouse" },
      { label: "Fancy Saree", href: "/products?cat=fancy-saree" },
      { label: "Garden Silk Saree", href: "/products?cat=garden-silk-saree" },
      { label: "Handloom Cotton Sarees", href: "/products?cat=handloom-cotton-sarees" },
      { label: "Chettinad Cotton", href: "/products?cat=chettinad-cotton" },
      { label: "Linen Cotton", href: "/products?cat=linen-cotton" },
      { label: "Mangalagiri Cotton", href: "/products?cat=mangalagiri-cotton" },
      { label: "Pure Cotton", href: "/products?cat=pure-cotton" },
      { label: "Semi Silk Cotton", href: "/products?cat=semi-silk-cotton" },
      { label: "Illampillai Cotton", href: "/products?cat=illampillai-cotton" },
      { label: "Simple Silk Cottons", href: "/products?cat=simple-silk-cottons" },
    ],
  },
];

export const CATEGORY_LINKS = MAIN_NAV_MENUS;

export function buildNavMenus(rawCategories = []) {
  if (!Array.isArray(rawCategories) || rawCategories.length === 0) {
    return MAIN_NAV_MENUS;
  }

  const catMap = new Map();
  rawCategories.forEach((c) => {
    if (!c) return;
    if (c.id) catMap.set(String(c.id).toLowerCase(), c);
    if (c.label) catMap.set(String(c.label).toLowerCase(), c);
    if (c.name) catMap.set(String(c.name).toLowerCase(), c);
  });

  return MAIN_NAV_MENUS.map((menu) => {
    if (menu.id === "thoranam-collection") {
      // Under Thoranam Collection main menu: include ALL categories created in the DB table
      const subMap = new Map();

      // 1. Add baseline subcategories
      (menu.subcategories || []).forEach((sub) => {
        const normKey = (sub.label || "").trim().toLowerCase();
        const match =
          catMap.get(normKey) ||
          catMap.get((sub.href?.split("cat=")[1] || "").toLowerCase());
        subMap.set(normKey, {
          label: sub.label,
          href: sub.href || `/products?cat=${encodeURIComponent(sub.label)}`,
          image: match?.image || "",
          count: match?.product_count,
        });
      });

      // 2. Add all categories created in DB / Dashboard
      rawCategories.forEach((c) => {
        const label = c.label || c.name;
        if (!label) return;
        const normKey = label.trim().toLowerCase();
        const slug = c.id || label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const existing = subMap.get(normKey);
        if (existing) {
          subMap.set(normKey, {
            ...existing,
            image: c.image || existing.image,
            count: c.product_count ?? existing.count,
          });
        } else {
          subMap.set(normKey, {
            label: label,
            href: c.href || `/products?cat=${encodeURIComponent(slug)}`,
            image: c.image || "",
            count: c.product_count,
          });
        }
      });

      const allSubs = Array.from(subMap.values());

      return {
        ...menu,
        subcategories: allSubs,
      };
    }

    // For other menus, enrich existing subcategories
    const enrichedSub = (menu.subcategories || []).map((sub) => {
      const match = catMap.get(sub.label?.toLowerCase());
      return {
        ...sub,
        image: match?.image || "",
        count: match?.product_count,
      };
    });

    const showcase = [];
    enrichedSub.forEach((sub) => {
      if (sub.image && showcase.length < 3) {
        showcase.push({
          title: sub.label,
          image: sub.image,
          href: sub.href,
        });
      }
    });

    return {
      ...menu,
      subcategories: enrichedSub,
      showcase: showcase.length > 0 ? showcase : undefined,
    };
  });
}

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
];

