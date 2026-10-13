import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Code, Layout, Database, Smartphone, Cloud, ArrowUpRight } from "lucide-react";

export default function Services() {
  const serviceItems = [
    {
      icon: Layout,
      title: "Web Application Design",
      description: "Modern, dynamic, and intuitive interfaces optimized for smooth user engagement and performance.",
    },
    {
      icon: Code,
      title: "Frontend Engineering",
      description: "Next.js, React, and modular styling tailored for optimal speed, SEO, and maintainability.",
    },
    {
      icon: Database,
      title: "Backend & Database Integration",
      description: "Scalable API design and robust database architectures structured for high reliability.",
    },
    {
      icon: Smartphone,
      title: "Responsive Cross-Platform",
      description: "Flawless viewports on mobile devices, tablets, and high-resolution desktop screens.",
    },
    {
      icon: Cloud,
      title: "Cloud & Deployment",
      description: "Automated pipelines, edge deployments, and secure hosting environments.",
    },
  ];

  return (
    <div className="py-16 sm:py-24 space-y-16">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Our Offerings
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Services Tailored to Your Needs
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            End-to-end digital expertise designed to help your projects scale efficiently.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceItems.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>
                <div className="pt-6">
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                    Learn more <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
