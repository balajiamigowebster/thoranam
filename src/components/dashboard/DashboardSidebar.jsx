import React from "react";
import Link from "next/link";
import ThoranamLogo from "@/components/ui/ThoranamLogo";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Layers,
  Settings,
  Bell,
  LogOut,
  ExternalLink,
  Percent,
} from "lucide-react";

const navigationItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag, badge: "12 New" },
  { id: "products", label: "Products Catalog", icon: Package },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "customers", label: "Customers", icon: Users },
  { id: "promotions", label: "Discounts & Offers", icon: Percent },
  { id: "settings", label: "Slideshow & SEO", icon: Settings },
];

export default function DashboardSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-[#4A080C] text-white flex flex-col shrink-0 border-r border-[#630b10] min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex flex-col gap-2">
        <div className="inline-block hover:opacity-90 transition-opacity">
          <ThoranamLogo />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-amber-300/80 font-medium px-1">
          Admin Portal
        </span>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase font-semibold text-white/40 tracking-wider">
          Management
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/15 text-white shadow-xs font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-white/60"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-amber-400 text-[#4A080C] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Footer Links */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <ExternalLink className="w-4 h-4 text-white/60" />
          <span>View Public Store</span>
        </Link>
        <button
          type="button"
          onClick={async () => {
            try {
              localStorage.removeItem("thoranam_admin_token");
              localStorage.removeItem("thoranam_admin_user");
              document.cookie = "thoranam_admin_token=; path=/; max-age=0";
              await fetch("/api/auth/login", { method: "DELETE" });
            } catch (e) {}
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-200 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-300" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
