"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import OtpVerify from "@/components/auth/OtpVerify";

/* ─── Rate limiter ─────────────────────────────────────────────────────────── */
const compStore = { count: 0, lockedUntil: 0 };
function checkCompReg(): string | null {
  const now = Date.now();
  if (now < compStore.lockedUntil) {
    const s = Math.ceil((compStore.lockedUntil - now) / 1000);
    return `Trop de tentatives. Réessayez dans ${s}s.`;
  }
  compStore.count += 1;
  if (compStore.count >= 3) {
    compStore.lockedUntil = now + 120_000;
    compStore.count = 0;
    return "Trop de tentatives. Veuillez attendre 2 minutes.";
  }
  return null;
}

function sanitize(s: string) {
  return s.trim().replace(/[<>"']/g, "");
}

/* ─── Form ─────────────────────────────────────────────────────────────────── */
function RegisterCompanyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "pro";

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function validatePassword(p: string) {
    if (p.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(p)) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(p)) return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  }

  function passwordStrength(p: string) {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Faible", color: "bg-rose-500", width: "25%" };
    if (score === 2) return { label: "Moyen", color: "bg-amber-400", width: "50%" };
    if (score === 3) return { label: "Fort", color: "bg-emerald-500", width: "75%" };
    return { label: "Très fort", color: "bg-emerald-600", width: "100%" };
  }

  const strength = passwordStrength(password);

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rl = checkCompReg();
    if (rl) { setError(rl); return; }

    const cleanName = sanitize(companyName);
    const cleanEmail = sanitize(email).toLowerCase();

    if (cleanName.length < 2) {
      setError("Le nom de l'entreprise doit contenir au moins 2 caractères.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Adresse email professionnelle invalide.");
      return;
    }
    const passErr = validatePassword(password);
    if (passErr) { setError(passErr); return; }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: cleanName,
            companyName: cleanName,
            role: "company",
            subscriptionStatus: "INACTIVE",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/checkout?plan=${selectedPlan}`,
        },
      });

      if (authError) {
        if (
          authError.message.includes("User already registered") ||
          authError.message.includes("already been registered")
        ) {
          throw new Error(
            "Un compte existe déjà avec cet email. Connectez-vous ou récupérez votre mot de passe."
          );
        }
        if (authError.message.includes("Password should be")) {
          throw new Error(
            "Le mot de passe ne respecte pas les critères de sécurité de la plateforme."
          );
        }
        throw new Error(authError.message);
      }

      // If auto-confirmed, go straight to checkout
      if (data?.user && data.user.confirmed_at) {
        router.push(
          `/checkout?plan=${selectedPlan}&companyName=${encodeURIComponent(cleanName)}&email=${encodeURIComponent(cleanEmail)}`
        );
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement de l'entreprise.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    // Redirect for OTP is: /checkout?plan=... after verification
    const nextUrl = `/checkout?plan=${selectedPlan}&companyName=${encodeURIComponent(sanitize(companyName))}&email=${encodeURIComponent(sanitize(email).toLowerCase())}`;
    return (
      <OtpVerify
        email={sanitize(email).toLowerCase()}
        redirectTo={nextUrl}
        otpType="signup"
        onBack={() => setSuccess(false)}
      />
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8 shadow-xl">
      {error && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegisterCompany} className="space-y-4" noValidate>
        {/* Company Name */}
        <div>
          <label htmlFor="comp-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nom officiel de l&apos;entreprise / startup
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="comp-name"
              type="text"
              required
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Gozem Togo, Restaurant Le Régal, PayTogo..."
              maxLength={120}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="comp-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email professionnel
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="comp-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@monentreprise.tg"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="comp-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Mot de passe sécurisé
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="comp-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Force : <span className="font-bold text-slate-600">{strength.label}</span>
                <span className="ml-2">· 8+ car. · 1 majuscule · 1 chiffre</span>
              </p>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Accès au programme Fidback Togo</span>
          </div>
          <p className="text-indigo-800/80 text-[11px]">
            Après cette étape, vous choisirez votre formule d&apos;abonnement pour activer votre tableau de bord et publier vos fiches services.
          </p>
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
              <span>Continuer vers le choix de formule</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
        <p>
          Votre entreprise possède déjà un compte ?{" "}
          <Link href="/login?role=company" className="font-bold text-indigo-600 hover:text-indigo-700 underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function RegisterCompanyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Fidback Logo" fill className="object-cover" priority />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">Fidback</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60 mb-3">
            <span>Programme Entreprises du Togo 🇹🇬</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inscrivez votre entreprise
          </h1>
          <p className="mt-2 text-sm text-slate-500">Étape 1 sur 2 : Informations de l&apos;entreprise</p>
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
          <RegisterCompanyForm />
        </Suspense>

        <p className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Inscription sécurisée · Données protégées et confidentielles</span>
        </p>
      </div>
    </div>
  );
}
