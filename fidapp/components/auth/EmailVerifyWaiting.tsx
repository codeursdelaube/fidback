"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  RotateCcw,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface EmailVerifyWaitingProps {
  email: string;
  role?: "user" | "company";
  onBack?: () => void;
}

export default function EmailVerifyWaiting({
  email,
  role = "user",
  onBack,
}: EmailVerifyWaitingProps) {
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${
            role === "company" ? "/dashboard" : "/app"
          }`,
        },
      });

      if (error) {
        toast.error(error.message || "Échec de l'envoi de l'email.");
      } else {
        toast.success("Lien de confirmation renvoyé avec succès !", {
          icon: "✉️",
        });
        setResendCooldown(60);
      }
    } catch (err: any) {
      toast.error("Impossible de renvoyer l'email. Veuillez réessayer.");
    } finally {
      setResending(false);
    }
  };

  const isCompany = role === "company";

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Icon & Badge */}
      <div className="text-center space-y-3">
        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
          <Mail className="w-8 h-8 text-emerald-600 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
          {isCompany ? (
            <>
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Compte Entreprise Pilote</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Compte Utilisateur Testeur</span>
            </>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Vérifiez votre boîte mail
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          Un lien de confirmation sécurisé a été envoyé à l&apos;adresse :
        </p>

        <div className="py-2 px-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm font-bold text-slate-900 break-all select-all">
          {email}
        </div>
      </div>

      {/* Instructions card */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 text-xs text-emerald-950">
        <div className="font-extrabold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Activation instantanée en 1 clic</span>
        </div>
        <p className="text-[12px] text-emerald-900/90 leading-relaxed">
          1. Ouvrez l&apos;email envoyé par <strong>Fidback Togo</strong>.
          <br />
          2. Cliquez sur le bouton ou le lien de confirmation.
          <br />
          3. Vous serez automatiquement connecté(e) et redirigé(e) vers votre espace{" "}
          <strong>{isCompany ? "Tableau de Bord Entreprise" : "Membre Testeur"}</strong>.
        </p>
      </div>

      {/* Waiting pulse indicator */}
      <div className="flex items-center justify-center gap-2 py-1 text-xs text-slate-500 font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
        <span>En attente de votre clic sur le lien de confirmation...</span>
      </div>

      {/* Resend actions */}
      <div className="pt-2 border-t border-slate-100 space-y-3 text-center">
        {resendCooldown > 0 ? (
          <p className="text-xs text-slate-400">
            Vous n&apos;avez rien reçu ? Renvoi possible dans{" "}
            <span className="font-bold text-slate-700">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 disabled:opacity-50 transition-colors"
          >
            {resending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            <span>Renvoyer le lien de confirmation</span>
          </button>
        )}

        <div className="text-[11px] text-slate-400">
          Astuce : Pensez à vérifier vos courriers indésirables (spams) ou l&apos;onglet Promotions.
        </div>

        {onBack && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Corriger l&apos;adresse email</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Security Note */}
      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Lien chiffré et sécurisé par Supabase Auth</span>
      </div>
    </div>
  );
}
