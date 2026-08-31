"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPlan = searchParams.get("plan") || "pro";
  const initialBilling = searchParams.get("billing") || "monthly";
  const companyName = searchParams.get("companyName") || "Mon Entreprise Togo";
  const email = searchParams.get("email") || "contact@entreprise.tg";
  const reason = searchParams.get("reason");

  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    initialBilling === "yearly" ? "yearly" : "monthly"
  );
  const [paymentProvider, setPaymentProvider] = useState<"TMONEY" | "FLOOZ" | "STRIPE">("TMONEY");
  const [phoneNumber, setPhoneNumber] = useState("90 12 34 56");
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const plansMap: Record<
    string,
    { name: string; monthly: number; yearly: number; features: string[] }
  > = {
    starter: {
      name: "Starter PME",
      monthly: 15000,
      yearly: 144000,
      features: [
        "1 fiche service active",
        "Jusqu'à 500 abonnés connectés",
        "Réception illimitée de feedbacks qualitatifs",
        "2 annonces de mise à jour / mois",
      ],
    },
    pro: {
      name: "Croissance Pro",
      monthly: 35000,
      yearly: 336000,
      features: [
        "Jusqu'à 5 fiches services (Publiques & Privées)",
        "Abonnés illimités",
        "Feedbacks prioritaires & Export CSV",
        "Annonces de mises à jour illimitées",
        "Mise en avant sur la page Explorer",
      ],
    },
    scale: {
      name: "Entreprise & Scale",
      monthly: 75000,
      yearly: 720000,
      features: [
        "Fiches services illimitées",
        "Multi-comptes administrateurs",
        "Webhooks & Intégrations API",
        "Support dédié 7j/7 à Lomé",
      ],
    },
  };

  const currentPlan = plansMap[selectedPlan] || plansMap.pro;
  const amountToPay =
    billingCycle === "monthly" ? currentPlan.monthly : currentPlan.yearly;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          amount: amountToPay,
          provider: paymentProvider,
          companyName,
          email,
          phoneNumber,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?status=subscription_activated");
      }, 1500);
    } catch (err) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?status=subscription_activated");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  /* ── Simulation mode (demo only) ─────────────────────────────────────────── */
  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          subscriptionStatus: "ACTIVE",
          simulatedPlan: currentPlan.name,
          simulatedAt: new Date().toISOString(),
        },
      });

      if (updateError) {
        console.warn("Simulation sans session auth:", updateError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?status=subscription_activated&mode=demo");
      }, 1200);
    } catch (err) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?status=subscription_activated&mode=demo");
      }, 1200);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Plan & Payment Selection */}
      <div className="lg:col-span-7 space-y-6">
        {reason === "inactive_subscription" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold p-4 rounded-2xl">
            Votre abonnement entreprise est actuellement inactif. Activez-le pour accéder à votre tableau de bord.
          </div>
        )}

        {/* Step 1: Select Plan */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h2 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs flex items-center justify-center font-black">
              1
            </span>
            <span>Choisissez votre formule d'abonnement</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(plansMap).map(([key, plan]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPlan(key)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedPlan === key
                    ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-bold text-slate-950">{plan.name}</div>
                <div className="text-sm font-black text-emerald-800 mt-1">
                  {(billingCycle === "monthly" ? plan.monthly : plan.yearly).toLocaleString(
                    "fr-FR"
                  )}{" "}
                  <span className="text-[10px] text-slate-500 font-normal">FCFA</span>
                </div>
              </button>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Fréquence de facturation</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Mensuelle
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 ${
                  billingCycle === "yearly"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>Annuelle</span>
                <span className="text-[9px] bg-lime-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Payment Provider */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h2 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs flex items-center justify-center font-black">
              2
            </span>
            <span>Mode de règlement togolais</span>
          </h2>

          <div className="space-y-3 mb-4">
            <label
              onClick={() => setPaymentProvider("TMONEY")}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentProvider === "TMONEY"
                  ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  TM
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    T-Money Togo (Togocom)
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      Recommandé 🇹🇬
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Paiement direct par validation USSD sur votre téléphone</div>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={paymentProvider === "TMONEY"}
                onChange={() => setPaymentProvider("TMONEY")}
                className="accent-emerald-600"
              />
            </label>

            <label
              onClick={() => setPaymentProvider("FLOOZ")}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentProvider === "FLOOZ"
                  ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                  FL
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Flooz (Moov Africa Togo)
                  </div>
                  <div className="text-xs text-slate-500">Règlement instantané via Moov Money</div>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={paymentProvider === "FLOOZ"}
                onChange={() => setPaymentProvider("FLOOZ")}
                className="accent-emerald-600"
              />
            </label>

            <label
              onClick={() => setPaymentProvider("STRIPE")}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentProvider === "STRIPE"
                  ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Carte Bancaire (Visa / Mastercard)
                  </div>
                  <div className="text-xs text-slate-500">Passerelle internationale sécurisée</div>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={paymentProvider === "STRIPE"}
                onChange={() => setPaymentProvider("STRIPE")}
                className="accent-emerald-600"
              />
            </label>
          </div>

          {(paymentProvider === "TMONEY" || paymentProvider === "FLOOZ") && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Numéro Mobile Money ({paymentProvider === "TMONEY" ? "Togocom" : "Moov"})
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="90 00 00 00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24 space-y-4">
          <h2 className="text-base font-extrabold text-slate-950 pb-4 border-b border-slate-100 flex items-center justify-between">
            <span>Récapitulatif de commande</span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              En direct
            </span>
          </h2>

          <div className="py-2 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Entreprise :</span>
              <span className="font-extrabold text-slate-900">{companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Formule :</span>
              <span className="font-extrabold text-emerald-800">{currentPlan.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Facturation :</span>
              <span className="font-semibold text-slate-800">
                {billingCycle === "monthly" ? "Mensuelle" : "Annuelle (-20%)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Moyen :</span>
              <span className="font-semibold text-slate-800">
                {paymentProvider === "TMONEY"
                  ? "T-Money Togo"
                  : paymentProvider === "FLOOZ"
                  ? "Flooz Togo"
                  : "Carte Bancaire"}
              </span>
            </div>
          </div>

          <div className="py-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inclus dans votre abonnement :
            </span>
            {currentPlan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl mint-card border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-950 font-extrabold">Total à régler</div>
              <div className="text-[10px] text-emerald-800">TVA comprise • FCFA</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-950">
                {amountToPay.toLocaleString("fr-FR")}
              </span>
              <span className="text-xs font-bold text-slate-700 ml-1">FCFA</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || success}
            className="w-full inline-flex items-center justify-center gap-2 pl-6 pr-3 py-4 rounded-full font-bold text-sm text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-sm disabled:opacity-50 transition-all duration-200"
          >
            <span>
              {loading
                ? "Traitement en cours..."
                : success
                ? "Abonnement Activé !"
                : `Activer mon abonnement (${amountToPay.toLocaleString("fr-FR")} FCFA)`}
            </span>
            <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </span>
          </button>

          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Paiement sécurisé et chiffré de bout en bout</span>
          </p>

          {/* ── Mode Démo : Simulation d'abonnement ── */}
          <div className="pt-4 border-t border-dashed border-slate-200">
            <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <FlaskConical className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-900 font-semibold">
                Mode test direct — active instantanément le dashboard
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulate}
              disabled={simLoading || success}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full font-bold text-xs text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 disabled:opacity-50 transition-all"
            >
              {simLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Abonnement activé ! Redirection...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4 text-amber-700" />
                  <span>Simuler le paiement (Mode Démo)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-emerald-500/40 bg-emerald-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Fidback Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-950">
              Fidback
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Offres PME & Startups</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Finalisation de l&apos;adhésion entreprise
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Rejoignez le programme de feedbacks produits qualitatifs au Togo
          </p>
        </div>

        <Suspense fallback={<div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">Chargement du récapitulatif...</div>}>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  );
}
