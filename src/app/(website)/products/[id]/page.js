import { Suspense } from "react";
import ProductDetailView from "@/components/pages/products/ProductDetailView";
import { productController } from "@/controllers";

async function getProductSafe(id) {
  if (!id) return null;
  try {
    const product = await productController.getProductById(id);
    if (product) return product;
  } catch (e) {
    console.warn("Direct product lookup error in page.js:", e?.message);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const product = await getProductSafe(id);
    if (product) {
      const pageTitle = product.seoTitle?.trim()
        ? product.seoTitle
        : `${product.title} | Thoranam Luxury Saree Boutique`;
      const pageDesc = product.seoDescription?.trim()
        ? product.seoDescription
        : (product.description?.slice(0, 160) ||
          `Buy authentic handcrafted ${product.title} in ${product.category}. Express shipping across India from Thoranam Boutique.`);
      const ogImg = product.ogImage || product.mainImage || "/images/product-1.jpg";
      const keywords = product.seoKeywords
        ? product.seoKeywords.split(",").map((k) => k.trim())
        : ["saree", "handloom", "silk saree", "thoranam boutique", product.category];

      return {
        title: pageTitle,
        description: pageDesc,
        keywords: keywords,
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          images: [
            {
              url: ogImg,
              width: 800,
              height: 1000,
              alt: product.title,
            },
          ],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: pageTitle,
          description: pageDesc,
          images: [ogImg],
        },
      };
    }
  } catch (e) {
    console.error("Error generating metadata for product", id, e);
  }

  return {
    title: `Saree Details | Thoranam Boutique`,
    description: "Handcrafted Indian luxury sarees and heirloom weaves.",
  };
}

async function ProductDetailContent({ paramsPromise }) {
  const { id } = await paramsPromise;
  const initialProduct = await getProductSafe(id);
  return <ProductDetailView productId={id} initialProduct={initialProduct} />;
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
