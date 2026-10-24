"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardOverview from "./DashboardOverview";
import DashboardOrders from "./DashboardOrders";
import DashboardProducts from "./DashboardProducts";
import DashboardCategories from "./DashboardCategories";
import DashboardCustomers from "./DashboardCustomers";
import DashboardPromotions from "./DashboardPromotions";
import DashboardStoreSettings from "./DashboardStoreSettings";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verify authentication on mount (handles localStorage / cookie authentication across Vercel)
  useEffect(() => {
    const checkAuth = () => {
      const hasLocalToken = typeof window !== "undefined" && Boolean(localStorage.getItem("thoranam_admin_token"));
      const hasCookie = typeof document !== "undefined" && document.cookie.includes("thoranam_admin_token=");

      if (!hasLocalToken && !hasCookie) {
        router.replace("/login?from=/dashboard");
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          Authenticating Dashboard Session...
        </p>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case "overview":
        return "Dashboard Overview";
      case "orders":
        return "Customer Orders Management";
      case "products":
        return "Products & Inventory";
      case "categories":
        return "Product Categories";
      case "customers":
        return "Registered Clients";
      case "promotions":
        return "Offers & Coupons";
      case "settings":
        return "Homepage Slideshow & Global Store SEO";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800">
      {/* 1. Left Sidebar */}
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title={getPageTitle()} />

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className={activeTab === "overview" ? "block" : "hidden"}>
            <DashboardOverview setActiveTab={setActiveTab} />
          </div>
          <div className={activeTab === "orders" ? "block" : "hidden"}>
            <DashboardOrders />
          </div>
          <div className={activeTab === "products" ? "block" : "hidden"}>
            <DashboardProducts />
          </div>
          <div className={activeTab === "categories" ? "block" : "hidden"}>
            <DashboardCategories />
          </div>
          <div className={activeTab === "customers" ? "block" : "hidden"}>
            <DashboardCustomers />
          </div>
          <div className={activeTab === "promotions" ? "block" : "hidden"}>
            <DashboardPromotions />
          </div>
          <div className={activeTab === "settings" ? "block" : "hidden"}>
            <DashboardStoreSettings />
          </div>
        </main>
      </div>
    </div>
  );
}
