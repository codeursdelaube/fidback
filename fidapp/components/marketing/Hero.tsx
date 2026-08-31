"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Search,
  Sparkles,
  TrendingUp,
  MessageSquareQuote,
  ShieldCheck,
  Radio,
  Zap,
  CheckCircle2,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-6 sm:pt-10 pb-20 overflow-hidden ambient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Top Green Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 shadow-xs text-xs font-bold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="uppercase tracking-wider">RETROUVEZ LA VOIX DE VOS CLIENTS • TOGO 🇹🇬</span>
            </div>

            {/* Headline with curved green accent effect */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black text-slate-950 tracking-tight leading-[1.12]">
              Pilotez l&apos;expérience de vos clients pour{" "}
              <span className="relative inline-block text-emerald-600">
                <span>réussir</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 15 Q 50 0 100 15"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Fini les faux avis par étoiles. Les applications, commerces et entreprises togolaises reçoivent des retours textuels authentiques, modérés par IA et directement exploitables pour améliorer leurs services.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/register-company"
                className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-3 text-sm font-extrabold text-white bg-slate-950 hover:bg-emerald-950 rounded-full shadow-lg shadow-emerald-950/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Inscrire mon entreprise</span>
                <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-400 transition-all">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </Link>

              <Link
                href="/app"
                className="group inline-flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-slate-800 bg-white hover:bg-emerald-50/50 border border-slate-200/90 rounded-full shadow-xs hover:border-emerald-300 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span>Explorer les services</span>
              </Link>
            </div>

            {/* Micro proof tags */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Modéré par IA</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Paiements T-Money & Flooz intégrés</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Honest Product Demonstration Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] sm:min-h-[500px]">
            
            {/* Background glowing disk */}
            <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-emerald-300/20 blur-3xl -z-10 animate-pulse-subtle" />

            {/* Product Mockup & Demo Showcase Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 w-full max-w-sm rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10"
            >
              {/* Top status bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Aperçu de l&apos;interface
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Démonstration
                </span>
              </div>

              {/* Center Megaphone graphic illustration */}
              <div className="py-6 flex flex-col items-center justify-center text-center relative">
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-lime-300 p-1 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                    <div className="text-center space-y-1">
                      <Radio className="w-9 h-9 text-emerald-400 mx-auto" />
                      <span className="text-[10px] font-extrabold text-emerald-300 block">
                        VOIX DU CLIENT
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Modération qualitative par IA
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Chaque retour est analysé pour garantir le respect et la clarté
                  </span>
                </div>
              </div>

              {/* Sample moderated feedback demonstration snippet */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-xs text-emerald-950 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Exemple de retour validé
                  </span>
                  <span className="bg-emerald-200/70 text-emerald-950 px-1.5 py-0.5 rounded font-black">
                    Qualité 95%
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
                  &quot;Le délai de livraison à Tokoin est rapide, mais l&apos;option de reçu par SMS serait un vrai plus pour mon suivi.&quot;
                </p>
              </div>
            </motion.div>

            {/* Floating Orbit Node 1: Qualitative Promise (Top Right) */}
            <motion.div
              animate={{ y: [-6, 6, -6], rotate: [0, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-2 sm:right-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-emerald-200 shadow-lg flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">100% Qualitatif</div>
                <div className="text-[9px] text-slate-500 font-semibold">Sans étoiles</div>
              </div>
            </motion.div>

            {/* Floating Orbit Node 2: Zero Spam (Bottom Left) */}
            <motion.div
              animate={{ y: [6, -6, 6], rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute -bottom-4 -left-2 sm:left-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-emerald-200 shadow-lg flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center">
                <MessageSquareQuote className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Zéro Insulte</div>
                <div className="text-[9px] text-slate-500 font-semibold">Filtrage bienveillant</div>
              </div>
            </motion.div>

            {/* Floating Orbit Node 3: AI Shield (Right Center) */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 z-20 bg-slate-950 text-white rounded-2xl px-3.5 py-2 border border-emerald-500/40 shadow-xl flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-200">Arbitre IA Intégré</span>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
