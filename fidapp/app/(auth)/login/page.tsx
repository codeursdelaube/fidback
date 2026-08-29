"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ─── Simple client-side rate limiter ─────────────────────────────────────── */
const attemptStore = { count: 0, lockedUntil: 0 };

function checkRateLimit(): string | null {
  const now = Date.now();
  if (now < attemptStore.lockedUntil) {
    const secs = Math.ceil((attemptStore.lockedUntil - now) / 1000);
    return `Trop de tentatives. Réessayez dans ${secs}s.`;
  }
  attemptStore.count += 1;
  if (attemptStore.count >= 5) {
    attemptStore.lockedUntil = now + 60_000; // 60s cooldown
    attemptStore.count = 0;
    return "Trop de tentatives. Réessayez dans 60s.";
  }
  return null;
}

function resetAttempts() {
  attemptStore.count = 0;
  attemptStore.lockedUntil = 0;
}

/* ─── Sanitize helper ──────────────────────────────────────────────────────── */
function sanitize(str: string) {
  return str.trim().replace(/[<>"']/g, "");
}

/* ─── LoginForm ────────────────────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "company" ? "company" : "user";
  const redirectPath = searchParams.get("redirect");

  const [role, setRole] = useState<"user" | "company">(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  /* Validate email format */
  function isValidEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    /* Rate limiting */
    const rateLimitError = checkRateLimit();
    if (rateLimitError) { setError(rateLimitError); return; }

    /* Validation */
    const cleanEmail = sanitize(email).toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError("Adresse email invalide.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        // Map Supabase error codes to French user-friendly messages
        if (
          authError.message.includes("Invalid login credentials") ||
          authError.message.includes("invalid_credentials")
        ) {
          throw new Error("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
        }
        if (authError.message.includes("Email not confirmed")) {
          setInfo(
            "Votre email n'est pas encore confirmé. Consultez votre boite de réception et cliquez sur le lien de vérification."
          );
          setLoading(false);
          return;
        }
        if (authError.message.includes("Too many requests")) {
          throw new Error("Trop de tentatives. Veuillez patienter quelques minutes.");
        }
        throw new Error(authError.message);
      }

      if (data?.user) {
        resetAttempts();
        const userRole = data.user.user_metadata?.role || role;
        if (userRole === "company") {
          router.push(redirectPath || "/dashboard");
        } else {
          router.push(redirectPath || "/app");
        }
      }
    } catch (err: any) {
      setError(err.message || "Impossible de se connecter. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 shadow-xl">
      {/* Role Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
        <button
          type="button"
          onClick={() => { setRole("user"); setError(null); setInfo(null); }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            role === "user"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Utilisateur</span>
        </button>
        <button
          type="button"
          onClick={() => { setRole("company"); setError(null); setInfo(null); }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            role === "company"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Entreprise</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info (email not confirmed) */}
      {info && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-xs sm:text-sm">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <span>{info}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {role === "company" ? "Email de l'entreprise" : "Adresse email"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "company" ? "contact@entreprise.tg" : "utilisateur@domaine.com"}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mot de passe
            </label>
            <Link href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
              Oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Se connecter{role === "company" ? " — Entreprise" : ""}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
        {role === "company" ? (
          <p>
            Votre entreprise n&apos;est pas encore membre ?{" "}
            <Link href="/register-company" className="font-bold text-indigo-600 hover:text-indigo-700 underline">
              Inscrire mon entreprise
            </Link>
          </p>
        ) : (
          <>
            <p>
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline">
                Créer un compte gratuit
              </Link>
            </p>
            <p className="text-slate-400">
              Vous êtes une entreprise ?{" "}
              <Link href="/login?role=company" className="font-semibold text-purple-600 hover:text-purple-700">
                Connexion entreprise
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </Link>

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Fidback Logo" fill className="object-cover" priority />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">Fidback</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Connexion à votre espace
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Accédez à vos feedbacks et pilotez vos retours produits
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="glass-card rounded-3xl p-8 text-center text-sm text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
              Chargement...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Security note */}
        <p className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Connexion chiffrée et sécurisée</span>
        </p>
      </div>
    </div>
  );
}
