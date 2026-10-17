import { Suspense } from "react";
import Products from "@/components/pages/products/Products";

export const metadata = {
  title: "Products | Thoranam",
  description: "Browse our products and solutions.",
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

