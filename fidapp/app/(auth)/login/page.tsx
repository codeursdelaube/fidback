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
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
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
    if (rateLimitError) {
      setError(rateLimitError);
      toast.error(rateLimitError);
      return;
    }

    /* Validation */
    const cleanEmail = sanitize(email).toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      const err = "Adresse email invalide.";
      setError(err);
      toast.error(err);
      return;
    }
    if (password.length < 6) {
      const err = "Le mot de passe doit comporter au moins 6 caractères.";
      setError(err);
      toast.error(err);
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (
          authError.message.includes("Invalid login credentials") ||
          authError.message.includes("invalid_credentials")
        ) {
          throw new Error("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
        }
        if (authError.message.includes("Email not confirmed")) {
          const msg = "Votre email n'est pas encore confirmé. Consultez votre boîte de réception et cliquez sur le lien de vérification.";
          setInfo(msg);
          toast.error("Email non confirmé. Vérifiez votre boîte mail.", { icon: "✉️" });
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
        toast.success(`Connexion réussie !`);
        if (userRole === "company") {
          router.push(redirectPath || "/dashboard");
        } else {
          router.push(redirectPath || "/app");
        }
      }
    } catch (err: any) {
      const msg = err.message || "Impossible de se connecter. Vérifiez vos identifiants.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Role Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200">
        <button
          type="button"
          onClick={() => { setRole("user"); setError(null); setInfo(null); }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-extrabold transition-all ${
            role === "user"
              ? "bg-slate-950 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Utilisateur / Client</span>
        </button>
        <button
          type="button"
          onClick={() => { setRole("company"); setError(null); setInfo(null); }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-extrabold transition-all ${
            role === "company"
              ? "bg-emerald-500 text-slate-950 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Entreprise / PME</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info (email not confirmed) */}
      {info && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <span>{info}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {role === "company" ? "Email professionnel de l'entreprise" : "Adresse email"}
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
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mot de passe
            </label>
            <Link href="#" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
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
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
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
          className="w-full mt-3 inline-flex items-center justify-center gap-2 pl-6 pr-3 py-3.5 rounded-full font-bold text-sm text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-sm disabled:opacity-50 transition-all duration-200"
        >
          <span>{loading ? "Connexion en cours..." : `Se connecter${role === "company" ? " — Entreprise" : ""}`}</span>
          <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </span>
        </button>
      </form>

      <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
        {role === "company" ? (
          <p>
            Votre entreprise n&apos;est pas encore membre ?{" "}
            <Link href="/register-company" className="font-bold text-emerald-800 hover:text-emerald-950 underline">
              Inscrire mon entreprise
            </Link>
          </p>
        ) : (
          <>
            <p>
              Pas encore de compte membre ?{" "}
              <Link href="/register" className="font-bold text-emerald-800 hover:text-emerald-950 underline">
                Créer un compte gratuit
              </Link>
            </p>
            <p className="text-slate-400">
              Vous êtes une entreprise ?{" "}
              <Link href="/login?role=company" className="font-bold text-slate-700 hover:text-slate-950">
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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F8FAF9] relative overflow-hidden font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </Link>

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-emerald-500/40 bg-emerald-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Fidback Logo" fill className="object-cover" priority />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-950">Fidback</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Connexion à votre espace
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Accédez à vos feedbacks et pilotez vos retours produits
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-sm text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
              Chargement...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Security note */}
        <p className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Connexion chiffrée et sécurisée par Supabase</span>
        </p>
      </div>
    </div>
  );
}
