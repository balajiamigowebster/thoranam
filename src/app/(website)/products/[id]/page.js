import { Suspense } from "react";
import ProductDetailView from "@/components/pages/products/ProductDetailView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Saree Details | Thoranam Boutique`,
    description: "Handcrafted Indian luxury sarees and heirloom weaves.",
  };
}

async function ProductDetailContent({ paramsPromise }) {
  const { id } = await paramsPromise;
  return <ProductDetailView productId={id} />;
}

export default function ProductDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-[#800F17] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading Thoranam saree...</p>
        </div>
      }
    >
      <ProductDetailContent paramsPromise={params} />
    </Suspense>
  );
}
