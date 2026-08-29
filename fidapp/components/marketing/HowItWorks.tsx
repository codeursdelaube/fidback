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
} from "lucide-react";

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-bold text-indigo-700">
            <span>Écosystème Entreprise Togo 🇹🇬</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Comment fonctionne <span className="gradient-text">Fidback</span> ?
          </h2>
          <p className="text-base text-slate-600">
            Une architecture conçue pour connecter directement les créateurs de services aux retours textuels de leurs utilisateurs.
          </p>
        </div>

        {/* Bento Grid layout matching the middle section of the reference image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
          
          {/* Card 1 (Left - Dark UI widget) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 rounded-3xl bg-slate-950 text-white p-7 flex flex-col justify-between relative shadow-xl border border-slate-800"
          >
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                01
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white leading-snug">
                S&apos;abonner aux services favoris
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Les utilisateurs togolais découvrent les fiches d&apos;applications, de restaurants et d&apos;entreprises, et s&apos;y abonnent pour suivre leur évolution.
              </p>
            </div>

            <div className="pt-8">
              <Link
                href="/app/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <span>Explorer le catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Floating chrome droplet overlapping card 1 & 2 */}
          <motion.div
            animate={{ y: [-6, 6, -6], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:block absolute left-[31%] top-1/2 z-30 w-12 h-12 rounded-full chrome-droplet pointer-events-none"
          />

          {/* Card 2 (Middle - Portrait card with clean organic entrepreneur photo) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-4 glass-panel rounded-3xl p-6 flex flex-col justify-between relative shadow-lg"
          >
            <div className="space-y-4">
              {/* Organic Portrait Image - Free and integrated */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-100">
                <Image
                  src="/img-entrepreneur.jpg"
                  alt="Fondateur de startup togolaise"
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  Étape 02
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  Feedback 100% Qualitatif
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Pas de note 1 à 5 étoiles : uniquement des explications détaillées et constructives pour faire progresser le produit.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white/90 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Textes argumentés</span>
              </span>
            </div>
          </motion.div>

          {/* Card 3 (Right - Multi-layer widgets) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-4 flex flex-col justify-between gap-4"
          >
            {/* Top Sub-widget: Analytics Graph */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 p-5 text-white shadow-xl border border-indigo-800/60 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-slate-300">Annonces & Mises à Jour</span>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">
                  Étape 03
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    1 420
                  </div>
                  <div className="text-[10px] text-slate-400">Abonnés informés par MAJ</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-emerald-400">+98.4%</div>
                  <div className="text-[10px] text-slate-400">Taux d&apos;engagement</div>
                </div>
              </div>
            </div>

            {/* Bottom Sub-widget: Verified Chef & Restaurant card with Chef.jpg */}
            <div className="glass-panel rounded-3xl p-5 shadow-lg flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-white">
                <Image
                  src="/Chef.jpg"
                  alt="Cheffe de restaurant à Lomé"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Amina Lawson
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="text-xs text-indigo-600 font-semibold">
                  Le Palmier Gourmand • Lomé
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  &quot;850 abonnés notifiés à chaque nouvelle carte.&quot;
                </p>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
