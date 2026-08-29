"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp } from "lucide-react";

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "starter",
      name: "Starter PME",
      desc: "Idéal pour restaurants, boutiques et commerces.",
      priceMonthly: 15000,
      priceYearly: 12000,
      popular: false,
      ctaText: "Démarrer",
      href: "/checkout?plan=starter",
    },
    {
      id: "pro",
      name: "Croissance Pro",
      desc: "Pour les startups tech, applications et services.",
      priceMonthly: 35000,
      priceYearly: 28000,
      popular: true,
      badge: "Populaire 🇹🇬",
      ctaText: "Choisir Pro",
      href: "/checkout?plan=pro",
    },
    {
      id: "scale",
      name: "Scale Groupe",
      desc: "Grandes structures, banques et multi-enseignes.",
      priceMonthly: 75000,
      priceYearly: 60000,
      popular: false,
      ctaText: "Choisir Scale",
      href: "/checkout?plan=scale",
    },
  ];

  return (
    <section id="tarifs" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline, subhead, and 3-column minimal price capsules matching reference */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tarifs Transparents en FCFA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Rejoignez le programme de feedback au Togo
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-lg leading-relaxed">
                Abonnement clair, sans engagement. Vos clients co-construisent le succès de vos produits avec vous.
              </p>
            </div>

            {/* Toggle Mensuel / Annuel */}
            <div className="flex items-center gap-2">
              <div className="bg-white/90 p-1 rounded-full flex items-center gap-1 border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    billingCycle === "monthly"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                    billingCycle === "yearly"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Annuel</span>
                  <span className="bg-emerald-400 text-emerald-950 text-[9px] px-1 rounded font-black">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Columns Compact Capsules matching bottom-left of reference image */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {plans.map((plan) => {
                const currentPrice =
                  billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl p-4 flex flex-col justify-between transition-all ${
                      plan.popular
                        ? "bg-white border-2 border-indigo-600 shadow-xl"
                        : "glass-panel rounded-3xl"
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate">
                        {plan.name}
                      </div>
                      <div className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                        {(currentPrice / 1000).toFixed(0)}k
                        <span className="text-[10px] text-slate-500 font-normal ml-0.5">FCFA</span>
                      </div>
                    </div>

                    <Link
                      href={`${plan.href}&billing=${billingCycle}`}
                      className={`mt-4 w-full py-2 rounded-full text-center text-[11px] font-bold transition-all ${
                        plan.popular
                          ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      {plan.ctaText}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dark Glassmorphic 3D Graph Card matching bottom-right of reference image */}
          <div className="lg:col-span-5 relative">
            
            {/* Free floating metric pill hovering above card: 922k.90% */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-5 right-8 z-30 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white shadow-xl text-xs font-black text-slate-900 flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>92.4% Résolution</span>
            </motion.div>

            {/* Dark 3D Widget */}
            <div className="rounded-3xl bg-slate-950 text-white p-7 shadow-2xl border border-slate-800 relative overflow-hidden space-y-6">
              
              {/* 3D Bar Graph visualization matching reference */}
              <div className="flex items-end justify-center gap-3 pt-4 pb-2">
                <div className="w-9 h-28 rounded-2xl bg-gradient-to-t from-indigo-900 to-indigo-500 relative overflow-hidden shadow-lg">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-2 rounded-full bg-white/40" />
                </div>
                <div className="w-9 h-36 rounded-2xl bg-gradient-to-t from-purple-900 to-purple-500 relative overflow-hidden shadow-lg">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-2 rounded-full bg-white/40" />
                </div>
                <div className="w-9 h-20 rounded-2xl bg-gradient-to-t from-slate-800 to-slate-600 relative overflow-hidden shadow-lg">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-2 rounded-full bg-white/40" />
                </div>
              </div>

              {/* Bottom widget stats chip: 58 Feedbacks Traités */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-300 font-medium">Feedbacks traités cette semaine</div>
                  <div className="text-2xl font-black text-white">58</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  TG
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Règlements T-Money, Flooz & Cartes bancaires</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
