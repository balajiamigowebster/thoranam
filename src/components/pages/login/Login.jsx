"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Phone,
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
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  // Modes: 'customer' or 'admin'
  const [authRole, setAuthRole] = useState("customer");
  // Customer tabs: 'signin' or 'register'
  const [customerTab, setCustomerTab] = useState("signin");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (customerTab === "register" && !name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(getApiUrl("/api/auth/customer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: customerTab === "register" ? "register" : "login",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message || "Welcome to Thoranam!");
        localStorage.setItem("thoranam_customer_token", data.token);
        localStorage.setItem("thoranam_customer_user", JSON.stringify(data.customer));
        window.dispatchEvent(new Event("thoranam_customer_auth_changed"));

        setTimeout(() => {
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push("/");
          }
        }, 500);
      } else {
        setErrorMessage(data.message || "Authentication failed.");
      }
    } catch (err) {
      console.error("Customer auth error:", err);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredentialResponse = React.useCallback(async (response) => {
    try {
      setIsLoading(true);
      // Decode JWT payload from Google credential
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const googleUser = JSON.parse(jsonPayload);

      const res = await fetch(getApiUrl("/api/auth/customer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google",
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Signed in with Google!");
        localStorage.setItem("thoranam_customer_token", data.token);
        localStorage.setItem("thoranam_customer_user", JSON.stringify(data.customer));

        setTimeout(() => {
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push("/checkout");
          }
        }, 500);
      } else {
        setErrorMessage(data.message || "Google sign-in failed.");
      }
    } catch (err) {
      console.error("Google credential error:", err);
      setErrorMessage("Failed to process Google sign in.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectUrl, router]);

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
      return;
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setErrorMessage("Google Sign-In is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables.");
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setErrorMessage("Google services are loading. Please try again in a few seconds.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Use modern OAuth2 token client popup flow - immune to FedCM, iframe, and One-Tap browser abort errors
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid profile email",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setIsLoading(false);
            setErrorMessage(tokenResponse.error_description || "Google sign-in was cancelled or encountered an error.");
            return;
          }

          if (tokenResponse.access_token) {
            try {
              // Retrieve user profile from Google's userinfo endpoint
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });
              const googleUser = await userInfoRes.json();

              // Send to our backend authentication endpoint
              const res = await fetch(getApiUrl("/api/auth/customer"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "google",
                  email: googleUser.email,
                  name: googleUser.name,
                  googleId: googleUser.sub,
                }),
              });

              const data = await res.json();
              if (data.success) {
                setSuccessMessage("Signed in with Google!");
                localStorage.setItem("thoranam_customer_token", data.token);
                localStorage.setItem("thoranam_customer_user", JSON.stringify(data.customer));
                window.dispatchEvent(new Event("thoranam_customer_auth_changed"));

                setTimeout(() => {
                  if (redirectUrl) {
                    router.push(redirectUrl);
                  } else {
                    router.push("/");
                  }
                }, 500);
              } else {
                setErrorMessage(data.message || "Google sign-in failed on server.");
              }
            } catch (err) {
              console.error("Google authentication error:", err);
              setErrorMessage("Could not complete Google authentication.");
            } finally {
              setIsLoading(false);
            }
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (err) {
      console.error("OAuth client launch error:", err);
      setIsLoading(false);
      setErrorMessage("Failed to open Google sign-in window.");
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!adminUserId.trim() || !password) {
      setErrorMessage("Please enter both User ID and Password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: adminUserId.trim(), password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage("Authentication verified. Loading Dashboard...");
        const sessionToken = data.token || `thoranam_session_${Date.now()}`;
        localStorage.setItem("thoranam_admin_token", sessionToken);
        localStorage.setItem("thoranam_admin_user", JSON.stringify(data.user || { userId: adminUserId.trim() }));
        document.cookie = `thoranam_admin_token=${sessionToken}; path=/; max-age=604800; SameSite=Lax; secure`;

        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 600);
      } else {
        setErrorMessage(data.message || "Invalid Admin User ID or Password");
      }
    } catch (err) {
      console.error("Admin login request error:", err);
      setErrorMessage("Server connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#800F17]/30 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 p-5 sm:p-7 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/80 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Boutique</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300/90 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-300/20 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Security & Anti-Spam</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[430px] bg-[#0c1222]/95 border border-white/10 backdrop-blur-2xl text-slate-100 rounded-3xl p-7 sm:p-9 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
          
          {authRole === "customer" ? (
            /* ================= CUSTOMER LOGIN / REGISTER ================= */
            <div>
              {/* Heading */}
              <div className="text-center space-y-1 mb-6">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-300/90">
                  THORANAM BOUTIQUE
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 tracking-wide pt-1">
                  {customerTab === "signin" ? "WELCOME BACK" : "CREATE ACCOUNT"}
                </h1>
                <p className="text-xs text-stone-400 pt-0.5">
                  {customerTab === "signin"
                    ? "Sign in to securely access your cart & complete checkout"
                    : "Register to track handcrafted orders & exclusive perks"}
                </p>
              </div>

              {/* Sign In / Register Pill Tabs */}
              <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerTab("signin");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    customerTab === "signin"
                      ? "bg-[#D3A867] text-stone-900 shadow-sm"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerTab("register");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    customerTab === "register"
                      ? "bg-[#D3A867] text-stone-900 shadow-sm"
                      : "text-stone-300 hover:text-white"
                  }`}
                >
                  REGISTER
                </button>
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] mb-5 shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.57 0 2.98.54 4.09 1.6l3.07-3.07C17.3 1.76 14.85 1 12 1 7.43 1 3.55 3.59 1.64 7.36l3.77 2.93C6.31 7.23 8.92 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.89c2.18-2.01 3.7-4.97 3.7-8.71z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.41 14.71c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.64 7.26C.6 9.33 0 11.6 0 14.05s.6 4.72 1.64 6.79l3.77-2.93z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.72-2.89c-1.07.72-2.45 1.16-4.21 1.16-3.08 0-5.69-2.23-6.59-5.29L1.64 16.05C3.55 19.82 7.43 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0c1222] px-3 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  OR
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
                {customerTab === "register" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Balaji"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-[#D3A867]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-[#D3A867]"
                  />
                </div>

                {customerTab === "register" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-[#D3A867]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                      Password *
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-[#D3A867]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 mt-2 rounded-xl bg-[#D3A867] hover:bg-[#c29654] text-stone-900 font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : customerTab === "signin" ? (
                    "SIGN IN"
                  ) : (
                    "CREATE ACCOUNT"
                  )}
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="mt-5 pt-4 border-t border-white/10 text-center space-y-2">
                <p className="text-xs text-stone-400">
                  {customerTab === "signin" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setCustomerTab("register")}
                        className="text-[#D3A867] font-semibold underline underline-offset-2 hover:text-amber-200"
                      >
                        Register here
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setCustomerTab("signin")}
                        className="text-[#D3A867] font-semibold underline underline-offset-2 hover:text-amber-200"
                      >
                        Sign in here
                      </button>
                    </>
                  )}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthRole("admin");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-[11px] text-stone-500 hover:text-stone-300 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Admin Login
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= ADMIN ACCESS LOGIN ================= */
            <div>
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/10 text-[#D3A867] flex items-center justify-center border border-amber-300/20">
                  <Lock className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-300/90 block">
                  ADMIN ACCESS
                </span>
                <h1 className="text-2xl font-serif font-bold text-amber-200 tracking-wide">
                  ADMIN LOGIN
                </h1>
                <p className="text-xs text-stone-400">
                  Authorized boutique personnel only
                </p>
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                    User ID or Admin Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminUserId}
                    onChange={(e) => setAdminUserId(e.target.value)}
                    placeholder="admin or admin@thoranam.co"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-[#D3A867]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-[#D3A867]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 mt-2 rounded-xl bg-[#D3A867] hover:bg-[#c29654] text-stone-900 font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    "SIGN IN"
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthRole("customer");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-xs text-[#D3A867] hover:text-amber-200 underline underline-offset-2 font-medium"
                >
                  Customer Login
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-stone-500">
        © 2026 Thoranam Sarees. Handcrafted Luxury Saree Boutique.
      </footer>
    </div>
  );
}
