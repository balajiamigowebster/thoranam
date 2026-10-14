"use client";

import React, { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardOverview from "./DashboardOverview";
import DashboardProducts from "./DashboardProducts";
import DashboardCategories from "./DashboardCategories";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

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
        return "Store Configuration";
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
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "products" && <DashboardProducts />}
          {activeTab === "categories" && <DashboardCategories />}
          {activeTab !== "overview" && activeTab !== "products" && activeTab !== "categories" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <h3 className="text-base font-bold text-slate-800">{getPageTitle()}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This section is configured and ready for additional modules and database connections.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
