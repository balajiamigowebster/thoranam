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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";

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
      
      const rawImg = product.ogImage || product.mainImage || "/images/product-1.jpg";
      const ogImg = rawImg.startsWith("http")
        ? rawImg
        : `${baseUrl}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;

      const keywords = product.seoKeywords
        ? product.seoKeywords.split(",").map((k) => k.trim())
        : ["saree", "handloom", "silk saree", "thoranam boutique", product.category];

      const productUrl = `${baseUrl}/products/${id}`;

      return {
        metadataBase: new URL(baseUrl),
        title: pageTitle,
        description: pageDesc,
        keywords: keywords,
        alternates: {
          canonical: productUrl,
        },
        openGraph: {
          title: pageTitle,
          description: pageDesc,
          url: productUrl,
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";

  // Generate Product JSON-LD Structured Data for Google Rich Snippets
  let jsonLd = null;
  if (initialProduct) {
    const numericPrice = parseFloat(
      String(initialProduct.price || "0").replace(/[^0-9.]/g, "")
    ) || 0;

    const rawImg = initialProduct.mainImage || "/images/product-1.jpg";
    const absoluteImg = rawImg.startsWith("http")
      ? rawImg
      : `${baseUrl}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;

    jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: initialProduct.title,
      image: [absoluteImg],
      description:
        initialProduct.seoDescription ||
        initialProduct.description ||
        `Handcrafted luxury ${initialProduct.title} from Thoranam boutique.`,
      sku: initialProduct.sku || `THO-${initialProduct.id}`,
      brand: {
        "@type": "Brand",
        name: "Thoranam",
      },
      offers: {
        "@type": "Offer",
        url: `${baseUrl}/products/${initialProduct.id}`,
        priceCurrency: "INR",
        price: numericPrice,
        priceValidUntil: "2027-12-31",
        itemCondition: "https://schema.org/NewCondition",
        availability:
          Number(initialProduct.stock) <= 0
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "Thoranam Luxury Saree Boutique",
        },
      },
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailView productId={id} initialProduct={initialProduct} />
    </>
  );
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
