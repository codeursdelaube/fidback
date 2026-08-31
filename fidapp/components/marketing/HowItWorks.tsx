"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BellRing,
  Building2,
  TrendingUp,
  ShoppingCart,
  Rocket,
  Store,
  Sparkles,
  Zap,
} from "lucide-react";

export function HowItWorks() {
  const valuePillars = [
    {
      category: "Écoute Directe & Authentique",
      metric: "100% Qualitatif",
      desc: "Des retours textuels détaillés pour comprendre les vrais besoins de vos clients.",
      icon: ShoppingCart,
    },
    {
      category: "Modération Assistée par IA",
      metric: "Zéro Spam",
      desc: "Filtrage intelligent pour préserver un climat respectueux et constructif.",
      icon: Rocket,
    },
    {
      category: "Fidélisation & Annonces",
      metric: "Mises à Jour",
      desc: "Informez directement vos abonnés dès qu'une suggestion est déployée.",
      icon: Store,
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-20 relative overflow-hidden bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section 1: How It Works Steps */}
        <div>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fonctionnement Simple</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Comment fonctionne <span className="gradient-text">Fidback</span> ?
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Une boucle transparente reliant les clients aux entreprises togolaises.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Step 01 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl bg-slate-950 text-white p-7 flex flex-col justify-between shadow-xl border border-slate-800"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-sm font-black shadow-xs">
                  01
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                  S&apos;abonner aux fiches services
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Les clients découvrent vos services (applications, commerces, restaurants) et s&apos;y abonnent pour suivre votre actualité et donner leur avis.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Catalogue public
                </span>
                <Link
                  href="/app/explore"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>Explorer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Step 02 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mint-card rounded-3xl p-7 flex flex-col justify-between shadow-xs border border-emerald-200/80"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center text-sm font-black shadow-xs">
                  02
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-950 leading-snug">
                  Rédiger un retour modéré par IA
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Zéro note par étoiles : uniquement des explications constructives. Notre arbitre IA vérifie la conformité pour éliminer les insultes et le dénigrement.
                </p>
              </div>

              <div className="pt-6 border-t border-emerald-200/60 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Arbitre IA automatique
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Qualité vérifiée
                </span>
              </div>
            </motion.div>

            {/* Step 03 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="forest-card rounded-3xl p-7 text-white flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center text-sm font-black shadow-xs">
                  03
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                  Informer les abonnés des améliorations
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  Dès qu&apos;une suggestion client est prise en compte, publiez une annonce pour notifier directement tous vos abonnés.
                </p>
              </div>

              <div className="pt-6 border-t border-emerald-800/80 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-lime-300 flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-lime-300" />
                  Notifications ciblées
                </span>
                <span className="text-[11px] font-bold text-emerald-200 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Fidélisation active
                </span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Section 2: Product Pillars */}
        <div id="resultats" className="space-y-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Les Piliers du Produit</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Une approche pensée pour la qualité des échanges
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              Découvrez comment Fidback redéfinit la relation entre clients et entreprises au Togo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valuePillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center gap-5 hover:border-emerald-300 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {pillar.category}
                    </span>
                    <span className="text-xl font-black text-slate-950 tracking-tight block text-emerald-700">
                      {pillar.metric}
                    </span>
                    <span className="text-xs text-slate-600 mt-0.5 block leading-snug">
                      {pillar.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
