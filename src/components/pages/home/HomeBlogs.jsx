"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight, Clock } from "lucide-react";
import Container from "@/components/ui/Container";
import { getFeaturedBlogs } from "@/lib/blogs";

export default function HomeBlogs() {
  const featuredBlogs = getFeaturedBlogs(3);

  return (
    <section className="py-14 sm:py-20 bg-[#FAF7F2] dark:bg-stone-950/60 border-t border-stone-200/70 dark:border-stone-800 transition-colors">
      <Container>
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 sm:pb-12">
          <div className="space-y-3 max-w-2xl">
            {/* Top Eyebrow Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] uppercase text-[#800F17] dark:text-rose-300">
                <BookOpen className="w-3.5 h-3.5 text-[#AA771C]" />
                THE SAREE JOURNAL & GUIDES
              </span>
            </div>

            {/* Main Section Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-rose-50 font-serif tracking-tight">
              Weavers&apos; Lore &amp; Buying Guides
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              Masterclasses on Nayanthara celebrity sarees, pure silk sarees, breathable cotton silk handlooms, and authentic Kanchipuram (Kachipuram) bridal weaves.
            </p>
          </div>

          {/* Action Button: Explore All Guides */}
          <div className="shrink-0">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-[#800F17] hover:border-[#800F17] text-stone-800 dark:text-stone-200 hover:text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase shadow-sm transition-all duration-300 group"
            >
              <span>EXPLORE ALL GUIDES</span>
              <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {featuredBlogs.map((blog) => (
            <article
              key={blog.slug}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <Link href={`/blogs/${blog.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-stone-100 dark:bg-stone-800">
                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block bg-[#161214]/85 backdrop-blur-md text-amber-200 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-md border border-amber-300/10">
                    {blog.category}
                  </span>
                </div>

                {/* Saree Image */}
                <Image
                  src={blog.image}
                  alt={blog.imageAlt || blog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-2.5">
                  {/* Read Time & Date */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{blog.readTime}</span>
                    <span>•</span>
                    <time dateTime={blog.publishedAt}>{blog.publishedAt}</time>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-[19px] font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#800F17] dark:group-hover:text-rose-300 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/blogs/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>

                {/* Card Footer: Author + Read Link */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-stone-700 dark:text-stone-300 font-medium">
                    By {blog.author.name}
                  </span>
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-[#800F17] dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-200 group-hover:translate-x-0.5 transition-transform"
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
    </section>
  );
}
