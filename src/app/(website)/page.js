import { Suspense } from "react";
import Home from "@/components/pages/home/Home";
import { productController, categoryController, settingsController } from "@/controllers";
import { connection } from "next/server";

export const metadata = {
  title: "Thoranam | Luxury Saree Boutique",
  description: "Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique.",
  keywords: ["saree boutique", "silk sarees", "mangalagiri sarees", "pure cotton", "handloom sarees", "Thoranam"],
  openGraph: {
    title: "Thoranam | Luxury Saree Boutique",
    description: "Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique.",
    images: [{ url: "/images/hero-1.webp", width: 1200, height: 630 }],
  },
};

async function HomeContent() {
  await connection();
  let initialProducts = [];
  let initialBrowseCategories = [];
  let initialAllCategories = [];
  let initialSettings = {};

  try {
    const [productsRes, settingsRes, categoriesRes, allCatsRes] = await Promise.allSettled([
      productController.getAllProducts(),
      settingsController.getSettings(),
      categoryController.getBrowseCategories(),
      categoryController.getAllCategories(),
    ]);

    if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
      initialProducts = productsRes.value;
    }
    if (allCatsRes.status === "fulfilled" && Array.isArray(allCatsRes.value)) {
      initialAllCategories = allCatsRes.value;
    }
    if (settingsRes.status === "fulfilled" && settingsRes.value) {
      initialSettings = settingsRes.value;
      if (initialSettings.homepage_browse_categories) {
        let b = initialSettings.homepage_browse_categories;
        if (typeof b === "string") {
          try { b = JSON.parse(b); } catch {}
        }
        if (Array.isArray(b) && b.length > 0) {
          initialBrowseCategories = b;
        }
      }
    }
    if (initialBrowseCategories.length === 0 && categoriesRes.status === "fulfilled" && Array.isArray(categoriesRes.value)) {
      initialBrowseCategories = categoriesRes.value;
    }
  } catch (e) {
    console.warn("HomePage server data loading notice:", e);
  }

  return (
    <Home
      initialProducts={initialProducts}
      initialBrowseCategories={initialBrowseCategories}
      initialAllCategories={initialAllCategories}
      initialSettings={initialSettings}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<Home />}>
      <HomeContent />
    </Suspense>
  );
}
