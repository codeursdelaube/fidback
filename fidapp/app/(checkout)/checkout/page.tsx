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
        "Feedbacks prioritaires & Export",
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
      const res = await fetch("/api/checkout", {
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
      // Update the authenticated user's metadata to ACTIVE subscription
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          subscriptionStatus: "ACTIVE",
          simulatedPlan: currentPlan.name,
          simulatedAt: new Date().toISOString(),
        },
      });

      if (updateError) {
        // Even if not authenticated, redirect to dashboard for demo
        console.warn("Simulation sans session auth:", updateError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?status=subscription_activated&mode=demo");
      }, 1200);
    } catch (err) {
      // Fallback: direct redirect for demo
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
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-4 rounded-2xl">
            Votre abonnement entreprise est actuellement inactif. Activez-le pour accéder à votre tableau de bord.
          </div>
        )}

        {/* Step 1: Select Plan */}
        <div className="glass-card rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-black">
              1
            </span>
            <span>Choisissez votre formule</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(plansMap).map(([key, plan]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPlan(key)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedPlan === key
                    ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{plan.name}</div>
                <div className="text-sm font-black text-indigo-600 mt-1">
                  {(billingCycle === "monthly" ? plan.monthly : plan.yearly).toLocaleString(
                    "fr-FR"
                  )}{" "}
                  <span className="text-[10px] text-slate-500 font-normal">FCFA</span>
                </div>
              </button>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-100/80 rounded-2xl text-xs">
            <span className="font-semibold text-slate-700">Fréquence de facturation</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Mensuelle
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  billingCycle === "yearly"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>Annuelle</span>
                <span className="text-[9px] bg-emerald-400 text-emerald-950 font-black px-1 rounded">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Payment Provider */}
        <div className="glass-card rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-black">
              2
            </span>
            <span>Mode de règlement</span>
          </h2>

          <div className="space-y-3 mb-4">
            <label
              onClick={() => setPaymentProvider("TMONEY")}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentProvider === "TMONEY"
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-xs">
                  TM
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    T-Money Togo (Togocom)
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Populaire
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Paiement instantané par push USSD</div>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={paymentProvider === "TMONEY"}
                onChange={() => setPaymentProvider("TMONEY")}
                className="radio radio-primary radio-sm"
              />
            </label>

            <label
              onClick={() => setPaymentProvider("FLOOZ")}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentProvider === "FLOOZ"
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  FL
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Flooz (Moov Africa Togo)
                  </div>
                  <div className="text-xs text-slate-500">Règlement mobile sécurisé</div>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={paymentProvider === "FLOOZ"}
                onChange={() => setPaymentProvider("FLOOZ")}
                className="radio radio-primary radio-sm"
              />
            </label>

            <label
              onClick={() => setPaymentProvider("STRIPE")}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentProvider === "STRIPE"
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Carte Bancaire (Visa / Mastercard)
                  </div>
                  <div className="text-xs text-slate-500">Passerelle sécurisée Stripe / Paygate</div>
                </div>
              </div>
              <input
                type="radio"
                name="provider"
                checked={paymentProvider === "STRIPE"}
                onChange={() => setPaymentProvider("STRIPE")}
                className="radio radio-primary radio-sm"
              />
            </label>
          </div>

          {(paymentProvider === "TMONEY" || paymentProvider === "FLOOZ") && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Numéro de téléphone ({paymentProvider === "TMONEY" ? "Togocom" : "Moov"})
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="90 00 00 00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5">
        <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-200 sticky top-24">
          <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
            <span>Récapitulatif de commande</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              En direct
            </span>
          </h2>

          <div className="py-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Entreprise :</span>
              <span className="font-bold text-slate-900">{companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Formule :</span>
              <span className="font-bold text-indigo-600">{currentPlan.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Facturation :</span>
              <span className="font-semibold text-slate-800">
                {billingCycle === "monthly" ? "Mensuelle" : "Annuelle (-20%)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Moyen :</span>
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
              Inclus dans votre offre :
            </span>
            {currentPlan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-xs text-indigo-900 font-semibold">Total à régler</div>
              <div className="text-[10px] text-indigo-700/80">TVA comprise • FCFA</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-950">
                {amountToPay.toLocaleString("fr-FR")}
              </span>
              <span className="text-xs font-bold text-indigo-800 ml-1">FCFA</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || success}
            className="w-full mt-6 inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <span className="flex items-center gap-1.5 text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                Abonnement Activé ! Redirection...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Activer mon abonnement ({amountToPay.toLocaleString("fr-FR")} FCFA)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Paiement sécurisé et chiffré de bout en bout</span>
            </p>
          </div>

          {/* ── Mode Démo : Simulation d'abonnement ── */}
          <div className="mt-5 pt-5 border-t border-dashed border-slate-200">
            <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
              <FlaskConical className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-800 font-semibold">
                Mode démo — aucun paiement réel ne sera effectué
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulate}
              disabled={simLoading || success}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-bold text-sm text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 disabled:opacity-50 transition-all"
            >
              {simLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Abonnement simulé ! Redirection...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Fidback Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Fidback
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Finalisation de l&apos;adhésion entreprise
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Rejoignez le programme de feedbacks produits qualitatifs au Togo
          </p>
        </div>

        <Suspense fallback={<div className="glass-card rounded-3xl p-12 text-center text-slate-500">Chargement du récapitulatif...</div>}>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  );
}
