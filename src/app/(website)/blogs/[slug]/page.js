import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Tag,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { getBlogBySlug, getAllBlogs, getRelatedBlogs } from "@/lib/blogs";

export async function generateStaticParams() {
  const blogs = getAllBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Article Not Found | Thoranam",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";
  const url = `${baseUrl}/blogs/${blog.slug}`;
  const imageUrl = blog.image.startsWith("http") ? blog.image : `${baseUrl}${blog.image}`;
  const title = blog.seoTitle || `${blog.title} | Thoranam Boutique`;
  const description = blog.seoDescription || blog.excerpt;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: blog.tags || ["sarees", "handloom", "Thoranam"],
    authors: [{ name: blog.author.name, url: baseUrl }],
    creator: "Thoranam Luxury Saree Boutique",
    publisher: "Thoranam Luxury Saree Boutique",
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
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: blog.publishedAt,
      modifiedTime: blog.publishedAt,
      authors: [blog.author.name],
      siteName: "Thoranam Luxury Saree Boutique",
      locale: "en_IN",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.imageAlt || blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@thoranamboutique",
    },
  };
}

async function BlogPostContent({ paramsPromise }) {
  const { slug } = await paramsPromise;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = getRelatedBlogs(blog.slug, 3);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";
  const fullArticleUrl = `${baseUrl}/blogs/${blog.slug}`;
  const fullImageUrl = blog.image.startsWith("http") ? blog.image : `${baseUrl}${blog.image}`;

  // Structured Data Schemas for Google (BlogPosting, Product, FAQPage, BreadcrumbList)
  const jsonLdGraph = [
    {
      "@type": "BlogPosting",
      "@id": `${fullArticleUrl}#article`,
      headline: blog.title,
      description: blog.excerpt,
      image: [fullImageUrl],
      datePublished: blog.publishedAt,
      dateModified: blog.publishedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": fullArticleUrl,
      },
      author: {
        "@type": "Person",
        name: blog.author.name,
        jobTitle: blog.author.role,
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Thoranam Luxury Saree Boutique",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/images/desktop-logo.png`,
        },
      },
      keywords: blog.tags?.join(", "),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${fullArticleUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Saree Journal",
          item: `${baseUrl}/blogs`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: blog.title,
          item: fullArticleUrl,
        },
      ],
    },
  ];

  // If blog connects to a specific product (e.g. Product ID 10)
  if (blog.product) {
    jsonLdGraph.push({
      "@type": "Product",
      "@id": `${blog.product.url}#product`,
      name: blog.product.title,
      image: [fullImageUrl],
      description: blog.excerpt,
      brand: {
        "@type": "Brand",
        name: "Thoranam",
      },
      offers: {
        "@type": "Offer",
        url: blog.product.url,
        priceCurrency: "INR",
        price: "6500",
        priceValidUntil: "2027-12-31",
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "Thoranam Luxury Saree Boutique",
        },
      },
    });
  }

  // If blog contains FAQs, inject FAQPage Schema for Google Rich Snippets
  if (blog.faqs && blog.faqs.length > 0) {
    jsonLdGraph.push({
      "@type": "FAQPage",
      "@id": `${fullArticleUrl}#faq`,
      mainEntity: blog.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": jsonLdGraph,
  };

  return (
    <article className="bg-[#FAF7F2] dark:bg-stone-950/70 min-h-screen py-8 sm:py-14">
      {/* Google SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container>
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          <Link href="/" className="hover:text-[#800F17] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href="/blogs" className="hover:text-[#800F17] transition-colors">
            Saree Journal &amp; Guides
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-800 dark:text-stone-200 font-medium truncate max-w-[240px] sm:max-w-md">
            {blog.title}
          </span>
        </nav>

        {/* Main Article Container */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-10 md:p-12 shadow-sm space-y-8">
          {/* Top Category & Meta Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-block bg-[#161214] text-amber-200 text-xs font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full shadow-sm">
                {blog.category}
              </span>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium bg-stone-100 dark:bg-stone-800/80 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{blog.readTime}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <time dateTime={blog.publishedAt}>{blog.publishedAt}</time>
              </div>
            </div>

            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-[#800F17] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Articles</span>
            </Link>
          </div>

          {/* H1 Heading: Primary Keyword Focused */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-stone-900 dark:text-rose-50 font-serif leading-[1.18] tracking-tight">
            {blog.title}
          </h1>

          {/* Author Byline */}
          <div className="flex items-center gap-3 py-3 border-y border-stone-100 dark:border-stone-800 text-xs sm:text-sm">
            <div className="w-10 h-10 rounded-full bg-[#800F17] text-amber-200 flex items-center justify-center font-bold text-base shadow-sm">
              {blog.author.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100">{blog.author.name}</p>
              <p className="text-xs text-stone-500">{blog.author.role} • Thoranam Luxury Boutique</p>
            </div>
          </div>

          {/* Primary Featured Image with Keyword Alt Attribute */}
          <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm bg-stone-100 border border-stone-200/60">
            <Image
              src={blog.image}
              alt={blog.imageAlt || blog.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-contain sm:object-cover bg-[#FAF7F2]"
            />
          </div>

          {/* Excerpt Lead Box */}
          <div className="p-5 sm:p-6 bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-[#800F17] rounded-r-2xl">
            <p className="text-sm sm:text-base text-stone-800 dark:text-rose-100 italic leading-relaxed font-normal">
              &ldquo;{blog.excerpt}&rdquo;
            </p>
          </div>

          {/* DIRECT PRODUCT SHOWCASE CARD (High Conversion for https://thoranam.co/products/10) */}
          {blog.product && (
            <div className="my-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-stone-50 border border-amber-300/60 dark:bg-stone-900 dark:border-amber-400/20 shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#800F17] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#AA771C]" />
                    Featured Boutique Masterpiece
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-rose-50">
                    {blog.product.title}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                    <span className="font-extrabold text-xl sm:text-2xl text-[#800F17] dark:text-amber-300">
                      {blog.product.price}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      In Stock &amp; Ready to Ship
                    </span>
                    <span className="text-stone-400">•</span>
                    <span>100% Authentic Handloom</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                    Handcrafted in pure Banaras Silk Cotton with intricate floral diamond jaal and royal gold zari border.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={blog.product.url}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#800F17] hover:bg-[#600b11] text-white px-7 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
                    <span>Buy Now at Thoranam</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Article Main Body Content */}
          <div
            className="prose prose-stone dark:prose-invert max-w-none pt-4 text-stone-800 dark:text-stone-200 leading-relaxed text-sm sm:text-base space-y-5
              [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:font-serif [&_h2]:text-[#800F17] [&_h2]:dark:text-rose-200 [&_h2]:pt-6 [&_h2]:pb-1
              [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:text-stone-900 [&_h3]:dark:text-stone-100 [&_h3]:pt-4
              [&_p]:leading-relaxed [&_p]:text-stone-700 [&_p]:dark:text-stone-300
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:border [&_table]:border-stone-200 [&_table]:rounded-xl [&_table]:overflow-hidden
              [&_th]:bg-stone-100 [&_th]:dark:bg-stone-800 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider
              [&_td]:p-3.5 [&_td]:border-t [&_td]:border-stone-200 [&_td]:dark:border-stone-800 [&_td]:text-xs [&_td]:sm:text-sm"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Interactive FAQ Section for Google Rich Snippets & User Questions */}
          {blog.faqs && blog.faqs.length > 0 && (
            <div className="pt-8 border-t border-stone-200 dark:border-stone-800 space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#800F17] dark:text-rose-300">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Frequently Asked Questions
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-rose-50">
                  Got Questions? Everything You Need to Know
                </h2>
              </div>

              <div className="space-y-3">
                {blog.faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 transition-all duration-200 open:bg-rose-50/40 dark:open:bg-rose-950/20 open:border-rose-200"
                  >
                    <summary className="font-bold text-stone-900 dark:text-stone-100 cursor-pointer list-none flex items-center justify-between gap-4 text-sm sm:text-base">
                      <span>{faq.question}</span>
                      <span className="text-[#800F17] text-lg font-mono transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-200/60 dark:border-stone-700/60 pt-3">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                Indexed Topics:
              </span>
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Secondary Footer CTA */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#800F17] to-[#5C0A10] text-[#FAF4EB] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold font-serif">
                Ready to Own This Heirloom Drape?
              </h3>
              <p className="text-xs sm:text-sm text-stone-200">
                Order the authentic Heritage Gold – Banaras Silk Cotton Saree online from Thoranam Boutique with fast shipping.
              </p>
            </div>
            <Link
              href={blog.product?.url || "/products"}
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-[#800F17] font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors shadow-sm"
            >
              Order Saree Online
            </Link>
          </div>
        </div>

        {/* More Related Guides Section */}
        {relatedBlogs.length > 0 && (
          <div className="mt-14 sm:mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-rose-50 font-serif">
                More Saree Guides &amp; Masterclasses
              </h2>
              <Link
                href="/blogs"
                className="text-xs sm:text-sm font-semibold text-[#800F17] hover:underline"
              >
                Explore All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((item) => (
                <article
                  key={item.slug}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                >
                  <Link
                    href={`/blogs/${item.slug}`}
                    className="block relative aspect-[16/10] overflow-hidden bg-stone-100"
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt || item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                        {item.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-2 group-hover:text-[#800F17]">
                        <Link href={`/blogs/${item.slug}`}>{item.title}</Link>
                      </h3>
                    </div>
                    <Link
                      href={`/blogs/${item.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#800F17] group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </Container>
    </article>
  );
}

export default function BlogPostPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center bg-[#FAF7F2] dark:bg-stone-950/70 min-h-screen">
          <div className="w-10 h-10 border-4 border-[#800F17] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone-500 font-medium">Loading Thoranam guide...</p>
        </div>
      }
    >
      <BlogPostContent paramsPromise={params} />
    </Suspense>
  );
}
