import Container from "@/components/ui/Container";
import { Sparkles, Scissors, ShieldCheck, HeartHandshake, Truck, Gift } from "lucide-react";

export default function Services() {
  const boutiqueServices = [
    {
      icon: Scissors,
      title: "Custom Blouse Tailoring",
      description:
        "Precision bespoke stitching, aari embroidery, and maggam work tailored to your exact measurements.",
    },
    {
      icon: Sparkles,
      title: "Fall & Pico Hemming",
      description:
        "Complimentary fall attachment and delicate pico hemming on every pure silk and handloom saree.",
    },
    {
      icon: HeartHandshake,
      title: "Bridal Styling Consultation",
      description:
        "One-on-one virtual or in-boutique consultations to curate wedding trousseaus and muhurtham sarees.",
    },
    {
      icon: ShieldCheck,
      title: "Silk Mark Certification",
      description:
        "100% genuine Mulberry silks certified with official Silk Mark tags guaranteeing purity.",
    },
    {
      icon: Truck,
      title: "Worldwide Express Delivery",
      description:
        "Insured global shipping with real-time tracking across USA, UK, Canada, Singapore, and Australia.",
    },
    {
      icon: Gift,
      title: "Luxury Gift Packaging",
      description:
        "Heirloom wooden boxes, fragrance sachets, and personalized gift notes for festive gifting.",
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-white min-h-screen">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[#800F17] font-semibold text-xs uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            Boutique Services
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Thoranam Bespoke Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            From heirloom handloom curation to custom bridal tailoring, we bring timeless luxury to every drape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boutiqueServices.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-stone-50/70 border border-slate-200/80 rounded-3xl p-8 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#800F17]/10 text-[#800F17] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
