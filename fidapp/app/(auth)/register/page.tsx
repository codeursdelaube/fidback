"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  AtSign,
  Mail,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import OtpVerify from "@/components/auth/OtpVerify";
import { createClient } from "@/lib/supabase/client";

/* ─── Simple client-side rate limiter ─────────────────────────────────────── */
const regStore = { count: 0, lockedUntil: 0 };
function checkReg(): string | null {
  const now = Date.now();
  if (now < regStore.lockedUntil) {
    const s = Math.ceil((regStore.lockedUntil - now) / 1000);
    return `Trop de tentatives. Réessayez dans ${s}s.`;
  }
  regStore.count += 1;
  if (regStore.count >= 3) {
    regStore.lockedUntil = now + 120_000; // 2min
    regStore.count = 0;
    return "Trop de tentatives d'inscription. Veuillez attendre 2 minutes.";
  }
  return null;
}

function sanitize(s: string) {
  return s.trim().replace(/[<>"']/g, "");
}

export default function RegisterUserPage() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function validatePseudo(p: string) {
    if (p.length < 3) return "Le pseudo doit contenir au moins 3 caractères.";
    if (p.length > 30) return "Le pseudo ne peut pas dépasser 30 caractères.";
    if (!/^[a-z0-9_]+$/.test(p)) return "Le pseudo ne peut contenir que des lettres minuscules, chiffres et underscores (_).";
    return null;
  }

  function validateEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? null : "Adresse email invalide.";
  }

  function validatePassword(p: string) {
    if (p.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(p)) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(p)) return "Le mot de passe doit contenir au moins un chiffre.";
    return null;
  }

  /* Password strength visual */
  function passwordStrength(p: string): { label: string; color: string; width: string } {
    if (p.length === 0) return { label: "", color: "bg-slate-200", width: "0%" };
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    /* Rate limiting */
    const rl = checkReg();
    if (rl) { setError(rl); return; }

    /* Validation */
    const cleanPseudo = sanitize(pseudo).toLowerCase().replace(/^@/, "");
    const cleanEmail = sanitize(email).toLowerCase();

    const pseudoErr = validatePseudo(cleanPseudo);
    if (pseudoErr) { setError(pseudoErr); return; }

    const emailErr = validateEmail(cleanEmail);
    if (emailErr) { setError(emailErr); return; }

    const passErr = validatePassword(password);
    if (passErr) { setError(passErr); return; }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            pseudo: cleanPseudo,
            role: "user",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/app`,
        },
      });

      if (authError) {
        if (authError.message.includes("User already registered") || authError.message.includes("already been registered")) {
          throw new Error("Un compte existe déjà avec cet email. Connectez-vous ou récupérez votre mot de passe.");
        }
        if (authError.message.includes("Password should be")) {
          throw new Error("Le mot de passe ne respecte pas les critères de sécurité de la plateforme.");
        }
        throw new Error(authError.message);
      }

      // If Supabase confirms the user is already confirmed (e.g., magic link off)
      if (data?.user && data.user.confirmed_at) {
        router.push("/app");
      } else {
        // Email confirmation required
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F8FAF9] relative overflow-hidden font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-emerald-500/40 bg-emerald-950 flex items-center justify-center shadow-xs">
                <Image src="/logo.png" alt="Fidback Logo" fill className="object-cover" priority />
              </div>
              <span className="font-black text-2xl tracking-tight text-slate-950">Fidback</span>
            </Link>
          </div>
          <OtpVerify
            email={email}
            redirectTo="/app"
            otpType="signup"
            onBack={() => setSuccess(false)}
          />
        </div>
      </div>
    );
  }

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
            Rejoignez la communauté
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Donnez des feedbacks qualitatifs aux entreprises togolaises
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Pseudo */}
            <div>
              <label htmlFor="reg-pseudo" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pseudo unique
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-pseudo"
                  type="text"
                  required
                  autoComplete="username"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="kodjo_dev"
                  maxLength={30}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Minuscules, chiffres et underscores uniquement. Affiché sous vos feedbacks.
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@domaine.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
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
                    <span className="ml-2 text-slate-400">· 8 caractères min. · 1 majuscule · 1 chiffre</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm transition-all ${
                    confirmPassword.length > 0 && confirmPassword !== password
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 focus:border-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="text-[11px] text-rose-500 mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {/* Benefits chips */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {["Gratuit & sans pub", "Accès direct aux fondateurs", "Arbitrage IA bienveillant", "Communauté Togo 🇹🇬"].map((b) => (
                <div key={b} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 pl-6 pr-3 py-3.5 rounded-full font-bold text-sm text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-sm disabled:opacity-50 transition-all duration-200"
            >
              <span>{loading ? "Création du compte..." : "Créer mon compte gratuitement"}</span>
              <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </span>
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
            <p>
              Déjà inscrit ?{" "}
              <Link href="/login?role=user" className="font-bold text-emerald-800 hover:text-emerald-950 underline">
                Se connecter
              </Link>
            </p>
            <p className="text-slate-400">
              Vous êtes une entreprise ?{" "}
              <Link href="/register-company" className="font-bold text-slate-700 hover:text-slate-950 underline">
                Inscrire une entreprise
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Inscription sécurisée · Données protégées et confidentielles</span>
        </p>
      </div>
    </div>
  );
}
