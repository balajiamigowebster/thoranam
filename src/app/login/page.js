import { Suspense } from "react";
import Login from "@/components/pages/login/Login";

export const metadata = {
  title: "Admin Sign In | Thoranam Luxury Saree Boutique",
  description: "Secure administrator portal sign in for Thoranam Boutique.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <Login />
    </Suspense>
  );
}

