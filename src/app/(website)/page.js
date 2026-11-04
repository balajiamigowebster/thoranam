import { Suspense } from "react";
import Home from "@/components/pages/home/Home";
import { productController, categoryController, settingsController } from "@/controllers";
import { connection } from "next/server";

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";
  let title = "Thoranam | Luxury Saree Boutique";
  let description =
    "Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique.";
  let keywords = [
    "saree boutique",
    "silk sarees",
    "mangalagiri sarees",
    "pure cotton",
    "handloom sarees",
    "Indian ethnic wear",
    "Thoranam",
  ];
  let ogImage = `${baseUrl}/images/hero-1.webp`;

  try {
    const settings = await settingsController.getSettings();
    const siteSeo = settings?.site_seo;
    if (siteSeo) {
      if (siteSeo.siteTitle?.trim()) title = siteSeo.siteTitle.trim();
      if (siteSeo.siteDescription?.trim()) description = siteSeo.siteDescription.trim();
      if (siteSeo.keywords) {
        keywords = siteSeo.keywords.split(",").map((k) => k.trim()).filter(Boolean);
      }
      if (siteSeo.ogImage) {
        ogImage = siteSeo.ogImage.startsWith("http")
          ? siteSeo.ogImage
          : `${baseUrl}${siteSeo.ogImage.startsWith("/") ? "" : "/"}${siteSeo.ogImage}`;
      }
    }
  } catch (err) {
    console.warn("Could not read dynamic SEO settings for homepage:", err);
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    authors: [{ name: "Thoranam Luxury Boutique", url: baseUrl }],
    creator: "Thoranam Luxury Boutique",
    publisher: "Thoranam Luxury Boutique",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "Thoranam Luxury Saree Boutique",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

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
          try {
            b = JSON.parse(b);
          } catch {}
        }
        if (Array.isArray(b) && b.length > 0) {
          initialBrowseCategories = b;
        }
      }
    }
    if (
      initialBrowseCategories.length === 0 &&
      categoriesRes.status === "fulfilled" &&
      Array.isArray(categoriesRes.value)
    ) {
      initialBrowseCategories = categoriesRes.value;
    }
  } catch (e) {
    console.warn("HomePage server data loading notice:", e);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";

  // Structured Data Schema for Google (ClothingStore & WebSite)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ClothingStore",
        "@id": `${baseUrl}#store`,
        name: "Thoranam Luxury Saree Boutique",
        url: baseUrl,
        logo: `${baseUrl}/images/desktop-logo.png`,
        image: `${baseUrl}/images/hero-1.webp`,
        description:
          "Thoranam is a premier luxury saree boutique offering handpicked handloom silks, festive cottons, and heirloom weaves.",
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: "Razorpay, Credit Card, Debit Card, UPI, Net Banking, Cash on Delivery",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
          addressRegion: "Tamil Nadu",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}#website`,
        url: baseUrl,
        name: "Thoranam",
        publisher: { "@id": `${baseUrl}#store` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/products?cat={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Home
        initialProducts={initialProducts}
        initialBrowseCategories={initialBrowseCategories}
        initialAllCategories={initialAllCategories}
        initialSettings={initialSettings}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<Home />}>
      <HomeContent />
    </Suspense>
  );
}
