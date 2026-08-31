"use client";

import { motion } from "motion/react";
import {
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";

export function Stats() {
  const productPromises = [
    {
      label: "0 Étoile Trompeuse",
      value: "100% Qualitatif",
      sub: "Avis textuels argumentés",
      icon: MessageSquareText,
    },
    {
      label: "Arbitre IA Intégré",
      value: "100% Modéré",
      sub: "Zéro insulte ni dénigrement",
      icon: ShieldCheck,
    },
    {
      label: "Boucle d'Écoute",
      value: "Mises à Jour",
      sub: "Abonnés notifiés en direct",
      icon: Zap,
    },
    {
      label: "Paiements Locaux",
      value: "T-Money & Flooz",
      sub: "Règlements mobiles au Togo",
      icon: Smartphone,
    },
  ];

  return (
    <section className="py-12 relative border-y border-slate-200/70 bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Pilot Vision Hook (Replacing fake partner logos) */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Programme Pilote Entreprises du Togo</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            Conçu pour les entrepreneurs et entreprises togolaises qui veulent grandir grâce aux retours de leurs clients
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Une plateforme éthique, sans étoiles anonymes ni règlements complexes. Règlements acceptés via T-Money & Flooz.
          </p>
        </div>

        {/* 4 Verifiable Product Value Capsules */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {productPromises.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="mint-card rounded-3xl p-5 border border-emerald-100/90 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight block">
                    {item.value}
                  </span>
                  <span className="text-xs font-bold text-emerald-900 block">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {item.sub}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
