import Link from "next/link";
import Image from "next/image";

export default function ThoranamLogo({ className = "" }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center justify-center group ${className}`}
      aria-label="Thoranam Home"
    >
      <Image
        src="/images/desktop-logo.png"
        alt="Thoranam Luxury Saree Boutique"
        width={246}
        height={70}
        priority
        className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
      />
    </Link>
  );
}
