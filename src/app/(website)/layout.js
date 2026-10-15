import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import CartDrawer from "@/components/website/CartDrawer";
import { CartProvider } from "@/context/CartContext";

export default function WebsiteLayout({ children }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

