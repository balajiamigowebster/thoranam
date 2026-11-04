import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import CartDrawer from "@/components/website/CartDrawer";
import QuickViewModal from "@/components/ui/QuickViewModal";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { QuickViewProvider } from "@/context/QuickViewContext";

export default function WebsiteLayout({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <QuickViewProvider>
          <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <CartDrawer />
            <QuickViewModal />
          </div>
        </QuickViewProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
