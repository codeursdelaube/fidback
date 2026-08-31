"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  MessageSquareText,
  ShieldCheck,
  BellRing,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function Features() {
  const solutions = [
    {
      icon: MessageSquareText,
      title: "Collecte de Retours Qualitatifs",
      desc: "Recueillez des avis textuels détaillés, factuels et sans notation d'étoiles pour identifier précisément les améliorations attendues.",
      tag: "100% Qualitatif",
      href: "/app",
    },
    {
      icon: ShieldCheck,
      title: "Modération Bienveillante par IA",
      desc: "L'IA analyse chaque avis en temps réel : filtrage des insultes et mise en avant des suggestions constructives.",
      tag: "Modération IA",
      href: "#comment-ca-marche",
    },
    {
      icon: BellRing,
      title: "Annonces & Mises à Jour Abonnés",
      desc: "Notifiez directement vos clients abonnés dès qu'une suggestion est prise en compte ou qu'une amélioration est déployée.",
      tag: "Écoute Directe",
      href: "/register-company",
    },
    {
      icon: Wallet,
      title: "Paiements Mobiles Locaux",
      desc: "Gérez vos abonnements d'entreprise en toute simplicité via vos comptes T-Money, Flooz ou par carte bancaire.",
      tag: "T-Money & Flooz",
      href: "/register-company",
    },
  ];

  return (
    <section id="solutions" className="py-20 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header matching the reference */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nos Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Des outils pensés pour faire grandir votre entreprise
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Une suite complète pour transformer les retours d&apos;expérience des utilisateurs togolais en leviers de croissance.
          </p>
        </div>

        {/* 4 Cards Grid (matching reference 4-column light mint cards with round icon & arrow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="mint-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Top circular icon in mint pill */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-xs">
                    <Icon className="w-7 h-7" />
                  </div>

                  <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom link with circular arrow button */}
                <div className="pt-6 mt-4 border-t border-emerald-100/60 flex items-center justify-between">
                  <Link
                    href={item.href}
                    className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors"
                  >
                    En savoir plus
                  </Link>
                  <Link
                    href={item.href}
                    className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
