import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, Clock, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import { getAllBlogs } from "@/lib/blogs";

export async function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://thoranam.co";
  return {
    metadataBase: new URL(baseUrl),
    title: "The Saree Journal & Weavers' Lore | Thoranam Boutique",
    description:
      "Explore masterclasses on celebrity sarees, authentic Kanchipuram silk drapes, breathable Mangalagiri cottons, and silk preservation secrets by Thoranam Boutique.",
    alternates: {
      canonical: `${baseUrl}/blogs`,
    },
    openGraph: {
      title: "The Saree Journal & Weavers' Lore | Thoranam Boutique",
      description:
        "Explore masterclasses on celebrity sarees, authentic Kanchipuram silk drapes, breathable Mangalagiri cottons, and silk preservation secrets.",
      url: `${baseUrl}/blogs`,
      siteName: "Thoranam Luxury Saree Boutique",
      images: [
        {
          url: `${baseUrl}/images/blogs/trisha-turquoise-saree.webp`,
          width: 1200,
          height: 630,
          alt: "The Saree Journal & Guides",
        },
      ],
      type: "website",
    },
  };
}

export default function BlogsPage() {
  const blogs = getAllBlogs();

  return (
    <div className="bg-[#FAF7F2] dark:bg-stone-950/70 min-h-screen py-12 sm:py-16">
      <Container>
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pb-12 sm:pb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/40 text-xs font-bold uppercase tracking-wider text-[#800F17] dark:text-rose-300">
            <BookOpen className="w-3.5 h-3.5 text-[#AA771C]" />
            THE SAREE JOURNAL &amp; GUIDES
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-rose-50 font-serif tracking-tight">
            Weavers&apos; Lore &amp; Buying Guides
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            Curated styling masterclasses, weave origins, and bridal drape inspiration brought to you by Thoranam&apos;s master textile curators.
          </p>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogs.map((blog) => (
            <article
              key={blog.slug}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <Link
                href={`/blogs/${blog.slug}`}
                className="block relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-800"
              >
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block bg-[#161214]/85 backdrop-blur-md text-amber-200 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md border border-amber-300/10">
                    {blog.category}
                  </span>
                </div>
                <Image
                  src={blog.image}
                  alt={blog.imageAlt || blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{blog.readTime}</span>
                    <span>•</span>
                    <time dateTime={blog.publishedAt}>{blog.publishedAt}</time>
                  </div>

                  <h2 className="text-lg sm:text-[19px] font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#800F17] dark:group-hover:text-rose-300 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-stone-700 dark:text-stone-300 font-medium">
                    By {blog.author.name}
                  </span>
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#800F17] dark:text-rose-300 hover:text-rose-900 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
