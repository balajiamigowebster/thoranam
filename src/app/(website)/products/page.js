import { Suspense } from "react";
import Products from "@/components/pages/products/Products";

export const metadata = {
  title: "Handcrafted Sarees Collection | Thoranam Luxury Boutique",
  description:
    "Explore our complete curated catalog of authentic handloom silks, festive cottons, Banarasi weaves, and heirloom sarees. Express insured shipping across India.",
  keywords: [
    "sarees online",
    "handloom sarees",
    "silk sarees boutique",
    "Thoranam collection",
    "pure cotton sarees",
    "Banarasi sarees",
    "Indian wedding wear",
  ],
  alternates: {
    canonical: "https://thoranam.co/products",
  },
  openGraph: {
    title: "Handcrafted Sarees Collection | Thoranam Luxury Boutique",
    description:
      "Explore our complete curated catalog of authentic handloom silks, festive cottons, Banarasi weaves, and heirloom sarees.",
    url: "https://thoranam.co/products",
    images: [{ url: "https://thoranam.co/images/hero-1.webp", width: 1200, height: 630 }],
  },
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#800F17] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading catalog...</p>
        </div>
      }
    >
      <Products />
    </Suspense>
  );
}
