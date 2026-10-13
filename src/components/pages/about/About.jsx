import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { CheckCircle2, Users, Award, Target } from "lucide-react";

export default function About() {
  const highlights = [
    {
      icon: Target,
      title: "Our Mission",
      description: "Delivering reliable, scalable, and modern digital platforms that empower businesses.",
    },
    {
      icon: Users,
      title: "Our People",
      description: "A passionate team dedicated to top-tier architecture, UX design, and engineering.",
    },
    {
      icon: Award,
      title: "Quality First",
      description: "Strict development standards, clean codebases, and performance-focused principles.",
    },
  ];

  return (
    <div className="py-16 sm:py-24 space-y-20">
      <Container>
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Driven by Innovation, Defined by Quality
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Thoranam was built to provide exceptional web experiences with modern frameworks,
            clean modular architectures, and scalable full-stack capabilities.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Want to collaborate with us?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              We are always excited to take on new and challenging initiatives.
            </p>
          </div>
          <Button href="/contact">Get in Touch</Button>
        </div>
      </Container>
    </div>
  );
}
