"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Check, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";

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
      badge: "Recommandé 🇹🇬",
      ctaText: "Choisir Pro",
      href: "/checkout?plan=pro",
    },
    {
      id: "scale",
      name: "Scale Entreprise",
      desc: "Grandes structures, banques et multi-enseignes.",
      priceMonthly: 75000,
      priceYearly: 60000,
      popular: false,
      ctaText: "Choisir Scale",
      href: "/checkout?plan=scale",
    },
  ];

  return (
    <section id="tarifs" className="py-20 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline, subhead, and 3-column minimal price capsules */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tarifs Transparents en FCFA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Des formules simples pour toutes les entreprises au Togo
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-lg leading-relaxed">
                Abonnement clair, sans engagement. Vos clients co-construisent le succès de vos produits avec vous.
              </p>
            </div>

            {/* Toggle Mensuel / Annuel */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-full flex items-center gap-1 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    billingCycle === "monthly"
                      ? "bg-slate-950 text-white shadow-xs"
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
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Annuel</span>
                  <span className="bg-lime-300 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-black">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Columns Compact Capsules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {plans.map((plan) => {
                const currentPrice =
                  billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl p-5 flex flex-col justify-between transition-all ${
                      plan.popular
                        ? "bg-white border-2 border-emerald-500 shadow-xl"
                        : "mint-card rounded-3xl border border-emerald-100/90"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate">
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                            POPULAIRE
                          </span>
                        )}
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-950 mt-2">
                        {(currentPrice / 1000).toFixed(0)}k
                        <span className="text-xs text-slate-500 font-semibold ml-1">FCFA/m</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {plan.desc}
                      </p>
                    </div>

                    <Link
                      href={`${plan.href}&billing=${billingCycle}`}
                      className={`mt-4 w-full py-2.5 rounded-full text-center text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                        plan.popular
                          ? "bg-slate-950 text-white hover:bg-emerald-950 shadow-md"
                          : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                      }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Forest Dark Widget */}
          <div className="lg:col-span-5 relative">
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 right-6 z-30 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 shadow-lg text-xs font-black text-slate-900 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Modération IA en temps réel</span>
            </motion.div>

            <div className="rounded-3xl forest-card p-7 text-white shadow-2xl relative overflow-hidden space-y-6">
              
              {/* 3D Bar Graph visualization in Emerald neon */}
              <div className="flex items-end justify-center gap-4 pt-4 pb-2">
                <div className="w-10 h-28 rounded-2xl bg-gradient-to-t from-emerald-900 to-emerald-500 relative overflow-hidden shadow-lg">
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/40" />
                </div>
                <div className="w-10 h-36 rounded-2xl bg-gradient-to-t from-lime-900 to-lime-400 relative overflow-hidden shadow-lg">
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/40" />
                </div>
                <div className="w-10 h-20 rounded-2xl bg-gradient-to-t from-slate-800 to-emerald-700 relative overflow-hidden shadow-lg">
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full bg-white/40" />
                </div>
              </div>

              {/* Bottom widget stats chip */}
              <div className="p-4 rounded-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-200 font-semibold">Qualité de l&apos;écoute client</div>
                  <div className="text-xl font-black text-white">100% Constructif</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">
                  TG
                </div>
              </div>

              <div className="pt-2 text-xs text-emerald-200/80 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-lime-300" />
                <span>Règlements simples via T-Money & Flooz</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
