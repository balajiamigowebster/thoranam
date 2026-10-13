import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Logo({ className = "", textClassName = "" }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
        <Sparkles className="w-5 h-5 text-white" />
      </span>
      <span className={`text-xl font-bold tracking-tight text-slate-900 dark:text-white ${textClassName}`}>
        Thoranam<span className="text-emerald-600">.</span>
      </span>
    </Link>
  );
}
