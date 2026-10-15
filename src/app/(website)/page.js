import Home from "@/components/pages/home/Home";

export const metadata = {
  title: "Thoranam | Luxury Saree Boutique",
  description: "Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique.",
  keywords: ["saree boutique", "silk sarees", "mangalagiri sarees", "pure cotton", "handloom sarees", "Thoranam"],
  openGraph: {
    title: "Thoranam | Luxury Saree Boutique",
    description: "Discover authentic handloom silk, heirloom weaves, semi-mangalagiri, and festive cotton sarees handcrafted with traditional artistry by Thoranam Boutique.",
    images: [{ url: "/images/hero-1.webp", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return <Home />;
}
