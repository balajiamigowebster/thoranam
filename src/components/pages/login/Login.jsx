"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import ThoranamLogo from "@/components/ui/ThoranamLogo";
import { getApiUrl } from "@/config";

export default function Login() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!userId.trim() || !password) {
      setErrorMessage("Please enter both User ID and Password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: userId.trim(), password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage("Authentication verified. Loading Dashboard...");
        
        // Store session token and user info for cross-domain client authentication
        if (data.token) {
          localStorage.setItem("thoranam_admin_token", data.token);
          // Also set client cookie for Vercel edge middleware
          document.cookie = `thoranam_admin_token=${data.token}; path=/; max-age=604800; SameSite=Lax; secure`;
        }
        if (data.user) {
          localStorage.setItem("thoranam_admin_user", JSON.stringify(data.user));
        }

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } else {
        setErrorMessage(data.message || "Invalid User ID or Password");
      }
    } catch (err) {
      console.error("Login request error:", err);
      setErrorMessage("Server connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D0407] via-[#52090E] to-[#1F0205] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Luxury Glow Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#800F17]/30 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Top Header Row */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/80 hover:text-white transition-colors group bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Boutique</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300/90 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-300/20 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Boutique Security Portal</span>
        </div>
      </header>

      {/* Main Login Card Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-slate-100 rounded-3xl p-7 sm:p-9 shadow-[0_24px_70px_rgba(0,0,0,0.45)] border border-white/20 dark:border-slate-800">
          
          {/* Brand Header Inside Card */}
          <div className="text-center space-y-2 mb-7">
            <div className="flex justify-center mb-2">
              <ThoranamLogo />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#800F17] text-[10px] font-extrabold uppercase tracking-widest border border-rose-100">
              <Sparkles className="w-3 h-3 text-[#800F17]" /> Admin Portal Access
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
              Sign In to Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Enter your boutique administrator credentials to proceed
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                User ID <span className="text-[#800F17]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-stone-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Password <span className="text-[#800F17]">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-stone-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#800F17]/20 focus:border-[#800F17] focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#800F17] hover:bg-[#680C13] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(128,15,23,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Footer inside Card */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-[#800F17] transition-colors font-medium"
            >
              ← Back to Thoranam Store Homepage
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-white/50">
        © 2026 Thoranam Luxury Saree Boutique. All Rights Reserved.
      </footer>
    </div>
  );
}
