"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, LayoutDashboard, User } from "lucide-react";
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
      } catch (err) {
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
    <header className="sticky top-0 z-50 w-full glass-nav backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Fidback Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              Fidback
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                TOGO 🇹🇬
              </span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium -mt-1">
              Feedbacks 100% Qualitatifs
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="#comment-ca-marche" className="hover:text-indigo-600 transition-colors">
            Comment ça marche
          </Link>
          <Link href="#entreprises" className="hover:text-indigo-600 transition-colors">
            Pour les entreprises
          </Link>
          <Link href="#tarifs" className="hover:text-indigo-600 transition-colors">
            Tarifs
          </Link>
          <Link href="/app" className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-slate-700 font-semibold">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Explorer les services</span>
          </Link>
        </nav>

        {/* Actions : Connected vs Non-connected */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href={targetPath}
              className="relative group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-full shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              {userRole === "company" ? (
                <LayoutDashboard className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span>Accéder à mon espace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl transition-all"
              >
                Se connecter
              </Link>
              <Link
                href="/register-company"
                className="relative group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Rejoindre le programme</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
