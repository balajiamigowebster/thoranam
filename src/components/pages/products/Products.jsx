import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Package, Check, Star } from "lucide-react";

export default function Products() {
  const products = [
    {
      name: "Thoranam Core",
      badge: "Standard",
      description: "Complete starter framework for modern web applications.",
      features: [
        "Next.js App Router Architecture",
        "Responsive Navigation & Drawer",
        "Tailwind CSS v4 Design Tokens",
        "Lucide React Icons Integration",
      ],
      featured: false,
    },
    {
      name: "Thoranam Enterprise",
      badge: "Popular",
      description: "Full suite containing public website and future-ready admin controls.",
      features: [
        "All Core Features Included",
        "Admin Dashboard Route Group",
        "Role-Based Authentication Ready",
        "MySQL / Database Ready Schemas",
        "Priority Support & Updates",
      ],
      featured: true,
    },
    {
      name: "Thoranam Custom",
      badge: "Bespoke",
      description: "Tailored component kits and architecture designed to your specs.",
      features: [
        "Custom UI Component Library",
        "Dedicated API Endpoints",
        "Third-party integrations",
        "Performance Audits",
      ],
      featured: false,
    },
  ];

  return (
    <div className="py-16 sm:py-24 space-y-16">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            Solutions & Products
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Carefully Crafted Products
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Flexible packages built with clean code and high development standards.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                p.featured
                  ? "bg-slate-900 text-white shadow-xl ring-2 ring-emerald-500 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      p.featured
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p.badge}
                  </span>
                  {p.featured && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                </div>

                <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                <p
                  className={`text-sm mb-6 ${
                    p.featured ? "text-slate-300" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {p.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-200/20">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Button
                  href="/contact"
                  className="w-full"
                  variant={p.featured ? "primary" : "outline"}
                >
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
