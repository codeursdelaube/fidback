"use client";

import { useEffect, useState, useRef } from "react";
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
  ShieldCheck,
  Camera,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import NotificationBell from "@/components/ui/NotificationBell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const sidebarFileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState("Mon Entreprise");
  const [companyCity, setCompanyCity] = useState("Lomé, Togo");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const handleSidebarLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const toastId = toast.loading("Téléversement du logo vers le bucket...");

    try {
      const bucketName =
        process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "fidback-startup-img";
      const fileExt = file.name.split(".").pop();
      const fileName = `logos/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      let newPublicUrl = "";
      if (!error && data?.path) {
        const { data: pubData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        newPublicUrl = pubData.publicUrl;
      } else {
        newPublicUrl = URL.createObjectURL(file);
      }

      setLogoUrl(newPublicUrl);

      // Save to Supabase metadata
      await supabase.auth.updateUser({
        data: { logoUrl: newPublicUrl },
      });

      // Update localStorage
      const cached = localStorage.getItem("fidback_company_profile");
      const prevData = cached ? JSON.parse(cached) : {};
      localStorage.setItem(
        "fidback_company_profile",
        JSON.stringify({ ...prevData, logoUrl: newPublicUrl })
      );

      window.dispatchEvent(new Event("fidback_profile_updated"));
      toast.success("Logo de l'entreprise mis à jour avec succès !", { id: toastId, icon: "🖼️" });
    } catch (err: any) {
      console.warn("Upload logo error:", err);
      const fallbackUrl = URL.createObjectURL(file);
      setLogoUrl(fallbackUrl);
      toast.success("Logo mis à jour localement !", { id: toastId, icon: "🖼️" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    router.push("/login?role=company");
  };

  const initials = (companyName || "Entreprise")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const navigation = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Services", href: "/dashboard/services", icon: Layers },
    { name: "Feedbacks & Modération IA", href: "/dashboard/feedbacks", icon: MessageSquareText },
    { name: "Annonces & MAJ", href: "/dashboard/updates", icon: BellRing },
    { name: "Personnalisation Profil", href: "/dashboard/settings", icon: SlidersHorizontal },
    { name: "Abonnement & Facturation", href: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col md:flex-row font-sans">
      {/* Hidden file input for logo */}
      <input
        type="file"
        ref={sidebarFileInputRef}
        onChange={handleSidebarLogoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-900">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-900">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-emerald-500/40 bg-emerald-950 flex items-center justify-center shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Fidback Logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight flex items-center gap-1.5">
                  Fidback
                  <span className="text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                    TG 🇹🇬
                  </span>
                </span>
                <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Espace Entreprise
                </span>
              </div>
            </Link>

            {/* Current Company badge with Logo & upload trigger */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between group">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => sidebarFileInputRef.current?.click()}
                  title="Changer le logo de l'entreprise"
                  disabled={uploadingLogo}
                  className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-emerald-950 flex items-center justify-center text-emerald-300 font-black text-xs hover:border-emerald-400 transition-all cursor-pointer group/avatar"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : logoUrl ? (
                    <>
                      <Image
                        src={logoUrl}
                        alt={companyName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{initials}</span>
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  )}
                </button>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{companyName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{companyCity}</div>
                </div>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-700">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
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
        <div className="p-4 border-t border-slate-900 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
          >
            <span className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voir le portail public</span>
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
        <header className="h-16 bg-white/95 border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-950">
              Tableau de Bord Entreprise
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Arbitrage IA Connecté
            </span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell variant="dark" />
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Paramètres</span>
            </Link>
            <Link
              href="/dashboard/updates"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-full shadow-xs transition-all"
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
