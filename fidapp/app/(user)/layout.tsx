"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  BellRing,
  User as UserIcon,
  LogOut,
  Building2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UserAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [pseudo, setPseudo] = useState<string>("visiteur");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userPseudo =
            user.user_metadata?.pseudo ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "membre";
          setPseudo(userPseudo);
          if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
          }
        }
      } catch (err) {
        console.warn("Erreur chargement profil utilisateur:", err);
      }
    }

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const userPseudo =
            session.user.user_metadata?.pseudo ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "membre";
          setPseudo(userPseudo);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Signout error:", e);
    }
    router.push("/login?role=user");
  };

  const navLinks = [
    { name: "Mon Fil & MAJ", href: "/app", icon: BellRing },
    { name: "Explorer les services Togo", href: "/app/explore", icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-emerald-500/40 bg-emerald-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Fidback Logo"
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-black text-lg text-slate-950 tracking-tight flex items-center gap-1.5">
                Fidback
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded-full">
                  Client
                </span>
              </span>
            </div>
          </Link>

          {/* Center navigation */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? "bg-slate-950 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right profile action (Dynamic Pseudo) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-2">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-emerald-300 bg-emerald-100 flex items-center justify-center text-emerald-900 font-black text-xs shadow-xs">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={pseudo}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{pseudo.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-extrabold text-slate-950">
                @{pseudo}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
