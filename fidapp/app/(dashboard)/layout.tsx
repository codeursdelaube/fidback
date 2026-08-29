"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  MessageSquareText,
  BellRing,
  CreditCard,
  ExternalLink,
  LogOut,
  Compass,
  SlidersHorizontal,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState("Gozem Togo");
  const [companyCity, setCompanyCity] = useState("Lomé, Togo");
  const [logoUrl, setLogoUrl] = useState("/img-entrepreneur.jpg");

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata || {};
        if (meta.companyName || meta.name) {
          setCompanyName(meta.companyName || meta.name);
        }
        if (meta.city) setCompanyCity(meta.city);
        if (meta.logoUrl) setLogoUrl(meta.logoUrl);
      } else {
        const cached = localStorage.getItem("fidback_company_profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.companyName) setCompanyName(parsed.companyName);
          if (parsed.city) setCompanyCity(parsed.city);
          if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
        }
      }
    } catch (e) {
      console.warn("Erreur chargement profil layout:", e);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleUpdate = () => loadProfile();
    window.addEventListener("fidback_profile_updated", handleUpdate);
    return () => window.removeEventListener("fidback_profile_updated", handleUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    router.push("/login?role=company");
  };

  const navigation = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Services", href: "/dashboard/services", icon: Layers },
    { name: "Feedbacks Reçus", href: "/dashboard/feedbacks", icon: MessageSquareText },
    { name: "Annonces & MAJ", href: "/dashboard/updates", icon: BellRing },
    { name: "Personnalisation Profil", href: "/dashboard/settings", icon: SlidersHorizontal },
    { name: "Abonnement & Facturation", href: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20">
                <Image
                  src="/logo.png"
                  alt="Fidback Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Fidback
                </span>
                <span className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                  Dashboard Entreprise
                </span>
              </div>
            </Link>

            {/* Current Company badge (Dynamic) */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-600 bg-slate-700">
                  <Image
                    src={logoUrl}
                    alt={companyName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{companyName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{companyCity}</div>
                </div>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/app"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all"
          >
            <span className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Voir l&apos;espace public</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white/90 border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900">
              Espace Entreprise
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Abonnement Fidback Actif
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Personnaliser le profil</span>
            </Link>
            <Link
              href="/dashboard/updates"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Publier une MAJ</span>
            </Link>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
