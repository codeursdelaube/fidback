"use client";

import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Download,
  Building2,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { PaymentRecord } from "@/lib/types";

export default function DashboardBillingPage() {
  const currentPlan = {
    name: "Croissance Pro",
    status: "ACTIVE",
    price: "35 000 FCFA / mois",
    nextBillingDate: "29 Septembre 2026",
    paymentMethod: "T-Money Togo (+228 90 ** ** 56)",
  };

  const paymentHistory: PaymentRecord[] = [
    {
      id: "pay-101",
      companyId: "comp-1",
      amount: 35000,
      currency: "FCFA",
      status: "PAID",
      provider: "TMONEY",
      planName: "Croissance Pro - Mensuel",
      createdAt: "2026-08-29",
    },
    {
      id: "pay-100",
      companyId: "comp-1",
      amount: 35000,
      currency: "FCFA",
      status: "PAID",
      provider: "TMONEY",
      planName: "Croissance Pro - Mensuel",
      createdAt: "2026-07-29",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gestion Financière</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Abonnement & Facturation
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Suivez votre formule active, vos méthodes de paiement Mobile Money et téléchargez vos reçus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Subscription Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Formule en cours
              </span>
              <h3 className="text-xl font-black text-slate-950 mt-1">
                {currentPlan.name}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>STATUT ACTIF</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">
                Montant facturé
              </span>
              <div className="text-lg font-black text-slate-950">
                {currentPlan.price}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">
                Prochain renouvellement
              </span>
              <div className="text-sm font-bold text-slate-800">
                {currentPlan.nextBillingDate}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl mint-card border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                TM
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Mode de prélèvement par défaut
                </div>
                <div className="text-xs text-emerald-800/80">
                  {currentPlan.paymentMethod}
                </div>
              </div>
            </div>
            <Link
              href="/checkout?plan=pro"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
            >
              Modifier
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/checkout?plan=scale"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 pl-5 pr-3 py-2.5 rounded-full bg-slate-950 hover:bg-emerald-950 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Passer à la formule Scale</span>
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                <TrendingUp className="w-3 h-3" />
              </span>
            </Link>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Résilier l&apos;abonnement
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-950 pb-3 border-b border-slate-100">
            Historique des paiements
          </h3>

          <div className="space-y-3">
            {paymentHistory.map((pay) => (
              <div
                key={pay.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:border-emerald-200 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {pay.amount.toLocaleString("fr-FR")} {pay.currency}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {pay.createdAt} • {pay.provider}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    PAID
                  </span>
                  <button
                    type="button"
                    title="Télécharger la facture"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
