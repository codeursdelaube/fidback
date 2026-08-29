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
    { name: "Mon Fil & Abonnements", href: "/app", icon: BellRing },
    { name: "Explorer les services Togo", href: "/app/explore", icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-nav backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Fidback Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Fidback
            </span>
          </Link>

          {/* Center navigation */}
          <nav className="flex items-center gap-2 sm:gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right profile action (Dynamic Pseudo) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-2">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-indigo-200 bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm">
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
              <span className="hidden sm:inline text-xs font-bold text-slate-800">
                @{pseudo}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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
