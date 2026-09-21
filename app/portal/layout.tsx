"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { clearSessionStateClientSide } from "@/lib/clearSession";
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  User,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  UserCheck,
} from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  role: string;
  practitionerProfile?: {
    fullName: string | null;
    professionalTitle: string | null;
    profession: string | null;
    clinicName: string | null;
    providerNumber: string | null;
  } | null;
}

function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          // Session was rejected (invalid/expired/revoked): strip any stale
          // session cookies/storage so we aren't bounced around a broken loop.
          clearSessionStateClientSide();
          const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
          router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        clearSessionStateClientSide();
        const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, pathname, searchParams]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Ignore network errors; still clear the session locally below.
    } finally {
      // Aggressively strip all session cookies and storage client-side, then
      // force a full page reload to the login view so no stale auth state
      // survives in memory or the URL.
      clearSessionStateClientSide();
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#16233B] animate-spin" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Practitioner Portal...
          </span>
        </div>
      </div>
    );
  }

  const isNeuroscientist = user?.role === "NEUROSCIENTIST" || user?.role === "ADMIN";

  const navItems = [
    { label: "Dashboard", href: "/portal", view: "dashboard", icon: LayoutDashboard },
    { label: "New Report Request", href: "/portal?view=new", view: "new", icon: PlusCircle },
    { label: "Billing History", href: "/portal?view=billing", view: "billing", icon: Receipt },
    { label: "Account", href: "/portal?view=account", view: "account", icon: User },
    { label: "Support", href: "/portal?view=support", view: "support", icon: HelpCircle },
  ];

  const profileFullName = user?.practitionerProfile?.fullName || user?.email || "";
  const profileProfession = user?.practitionerProfile?.profession || "";
  
  const initials = profileFullName
    ? profileFullName
        .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[#F3F6F8] flex flex-col lg:flex-row selection:bg-[#16233B] selection:text-white">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#16233B] text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <Link href="/portal" className="flex items-center gap-2">
          <span className="text-xl font-serif font-normal text-white tracking-tight">
            QEEG.com.au
          </span>
        </Link>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Dark Navy Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#16233B] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Brand Header */}
            <div className="p-6 border-b border-slate-800/80">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-serif font-normal text-white tracking-tight">
                  QEEG.com.au
                </span>
              </Link>
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <span>Referrer Portal</span>
              </div>
            </div>

            {/* Navigation Menu Items */}
            <nav className="p-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === "/portal" && currentView === item.view;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#223554] text-white font-semibold shadow-xs"
                        : "text-slate-300 hover:text-white hover:bg-[#1B2B46]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Clinical Review Queue (Role-Restricted) */}
              {isNeuroscientist && (
                <div className="pt-3 mt-3 border-t border-slate-800">
                  <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Review Desk
                  </div>
                  <Link
                    href="/portal/review"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      pathname === "/portal/review"
                        ? "bg-[#223554] text-white border border-slate-700 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-[#1B2B46]"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-slate-300" />
                    <span>Review Queue</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Practitioner User Profile Card at Bottom of Sidebar */}
          <div className="p-3 border-t border-slate-800/80 bg-[#131F33]">
            <div className="p-3 rounded-2xl bg-[#1A2942] border border-slate-700/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-700/60 border border-slate-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    {profileFullName}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {profileProfession}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>QEEG.com.au Referring Practitioner Portal · Sydney VPS Hosted</span>
            <span>Australian Infrastructure · Purged Upon Download</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F6F8] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-[#16233B] animate-spin" />
        </div>
      }
    >
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
