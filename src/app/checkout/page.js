import Checkout from "@/components/pages/checkout/Checkout";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Checkout - Thoranam Luxury Sarees",
  description: "Secure checkout for handcrafted silk and cotton sarees at Thoranam.",
};

export default function CheckoutPage() {
  return (
    <CartProvider>
      <Checkout />
    </CartProvider>
  );
}
