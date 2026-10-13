import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <Container className="relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Thoranam</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transforming Ideas Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Exceptional Realities
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A modern, scalable platform designed for elegant public web experiences
            and future-ready management.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button href="/services" size="lg">
              Explore Services
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
