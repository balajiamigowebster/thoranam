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
        width={320}
        height={90}
        priority
        className="h-12 sm:h-14 md:h-16 lg:h-17 w-auto object-contain transition-transform duration-200 group-hover:scale-103"
      />
    </Link>
  );
}
