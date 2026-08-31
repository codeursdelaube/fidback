"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Compass, LayoutDashboard, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsAuthenticated(true);
          const role = user.user_metadata?.role || "user";
          setUserRole(role);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserRole(session.user.user_metadata?.role || "user");
        } else {
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const targetPath = userRole === "company" ? "/dashboard" : "/app";

  return (
    <header className="sticky top-0 z-50 w-full glass-nav backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-emerald-200/60 bg-emerald-50 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Fidback Logo"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-950 flex items-center gap-1.5">
              Fidback
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                TOGO 🇹🇬
              </span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold -mt-0.5">
              Retours clients qualitatifs
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <Link href="#solutions" className="hover:text-emerald-700 transition-colors">
            Solutions
          </Link>
          <Link href="#comment-ca-marche" className="hover:text-emerald-700 transition-colors">
            Comment ça marche
          </Link>
          <Link href="#resultats" className="hover:text-emerald-700 transition-colors">
            Engagements
          </Link>
          <Link href="#tarifs" className="hover:text-emerald-700 transition-colors">
            Tarifs
          </Link>
          <Link
            href="/app"
            className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 text-slate-800 bg-emerald-50/70 border border-emerald-200/60 px-3 py-1.5 rounded-full"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Explorer les services</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href={targetPath}
              className="relative group inline-flex items-center gap-2 pl-5 pr-2.5 py-2 text-sm font-bold text-white bg-slate-950 hover:bg-emerald-950 rounded-full shadow-sm hover:shadow transition-all duration-200"
            >
              {userRole === "company" ? (
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              ) : (
                <User className="w-4 h-4 text-emerald-400" />
              )}
              <span>Mon espace</span>
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center group-hover:scale-105 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-full transition-all"
              >
                Connexion
              </Link>
              <Link
                href="/register-company"
                className="relative group inline-flex items-center gap-2 pl-5 pr-2 py-1.5 text-xs sm:text-sm font-bold text-white bg-slate-950 hover:bg-emerald-950 rounded-full shadow-sm transition-all duration-200"
              >
                <span>Espace Entreprise</span>
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
