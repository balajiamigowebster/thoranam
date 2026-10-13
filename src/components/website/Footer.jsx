import Link from "next/link";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { NAV_LINKS } from "@/lib/navigation";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const year = 2026;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo textClassName="text-white" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Crafting premium digital experiences and quality solutions.
              Designed with attention to detail and modern web standards.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Chennai, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>contact@thoranam.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {year} Thoranam. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern Next.js & React
          </p>
        </div>
      </Container>
    </footer>
  );
}
