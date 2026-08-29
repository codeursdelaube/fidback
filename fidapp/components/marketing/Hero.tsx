"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowRight,
  Search,
  MessageSquare,
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Check,
  BellRing,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-8 pb-20 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none -z-10">
        <div className="absolute top-4 right-10 w-[32rem] h-[32rem] bg-purple-400/25 rounded-full blur-3xl" />
        <div className="absolute top-20 left-10 w-[28rem] h-[28rem] bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center">
          
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Minimalist Pill Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-white/80 shadow-sm text-xs font-semibold text-indigo-800 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Plateforme togolaise de feedbacks qualitatifs 🇹🇬</span>
            </div>

            {/* Headline matching image style */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-950 tracking-tight leading-[1.12]">
              Faites grandir votre entreprise avec des{" "}
              <span className="gradient-text">feedbacks qualitatifs</span> réels.
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Fini les faux avis par étoiles. Les applications, restaurants et entreprises togolaises reçoivent des retours textuels authentiques, précis et directement exploitables.
            </p>

            {/* Pill CTAs matching reference */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/register-company"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Inscrire mon entreprise</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200/80 rounded-full shadow-sm hover:shadow transition-all duration-200"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Explorer les services</span>
              </Link>
            </div>

            {/* Bottom Dark HUD Card matching the bottom-left widget in reference */}
            <div className="pt-4 max-w-md">
              <div className="glass-panel-dark rounded-3xl p-5 text-white relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">Gozem Togo • Lomé</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                    Abonnés actifs
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black tracking-tight text-white">
                      1 420 abonnés
                    </div>
                    <div className="text-[11px] text-slate-400">92 retours traités ce mois</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-indigo-400">100% Qualitatif</div>
                    <div className="text-[10px] text-slate-400">0 faux avis étoiles</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Free-floating 3D visual composition */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] lg:min-h-[540px]">
            
            {/* Free-floating top-right Purple Glass Plus Button */}
            <motion.div
              animate={{ y: [-6, 6, -6], rotate: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-8 z-30 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center text-xl font-light shadow-xl shadow-purple-500/30 cursor-pointer hover:scale-110 transition-transform"
            >
              +
            </motion.div>

            {/* Free-floating Glass Tile 1 (Top Left) */}
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 left-8 z-20 glass-cube-3d w-28 h-28 rounded-3xl p-3 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/80 flex items-center justify-center shadow-inner">
                <Check className="w-5 h-5 text-emerald-950 font-bold" />
              </div>
              <span className="text-[10px] font-bold text-slate-800">Modéré</span>
            </motion.div>

            {/* Free-floating Glass Tile 2 (Top Right) */}
            <motion.div
              animate={{ y: [8, -8, 8], rotate: [2, -2, 2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-8 right-24 z-20 glass-cube-3d w-28 h-28 rounded-3xl p-3 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/80 flex items-center justify-center text-white shadow-inner">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-800">Feedback</span>
            </motion.div>

            {/* Free-floating Glass Tile 3 (Middle Right) */}
            <motion.div
              animate={{ y: [-7, 7, -7], rotate: [1, -3, 1] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-44 -right-2 z-20 glass-cube-3d w-28 h-28 rounded-3xl p-3 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-400/80 flex items-center justify-center shadow-inner">
                <BellRing className="w-5 h-5 text-amber-950" />
              </div>
              <span className="text-[10px] font-bold text-slate-800">Annonce</span>
            </motion.div>

            {/* Free-floating Dark Widget Tile (Middle Left) */}
            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute top-44 left-0 z-20 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 w-32 shadow-2xl"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              </div>
              <div className="text-[11px] font-bold text-white">Direct Togo</div>
              <div className="text-[9px] text-slate-400">Sans étoile</div>
            </motion.div>

            {/* Central 3D Visual: Crystal Dish with Glowing Glass Cylinders / Tubes matching reference */}
            <div className="relative z-10 w-80 sm:w-96 h-80 sm:h-96 flex items-center justify-center">
              {/* The Glass Dish Base */}
              <div className="absolute bottom-6 w-72 sm:w-80 h-32 rounded-[50%] border-4 border-white/70 bg-gradient-to-b from-white/40 via-purple-300/20 to-indigo-500/20 backdrop-blur-md shadow-2xl -rotate-6 pointer-events-none" />

              {/* 3D Glass Cylinders / Data Vials */}
              <div className="relative flex items-end justify-center gap-3 sm:gap-4 -mt-8">
                {/* Cylinder 1: Purple Gradient */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 sm:w-16 h-48 sm:h-56 rounded-full glass-cylinder relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-purple-700 via-indigo-600 to-transparent opacity-80" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full bg-white/60" />
                </motion.div>

                {/* Cylinder 2: Cyan/Blue Gradient */}
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="w-14 sm:w-16 h-40 sm:h-48 rounded-full border border-white/80 bg-gradient-to-b from-white/70 via-cyan-400/30 to-indigo-600/70 backdrop-blur-md relative overflow-hidden shadow-xl shadow-cyan-500/20"
                >
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-indigo-700 via-cyan-600 to-transparent opacity-75" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full bg-white/60" />
                </motion.div>

                {/* Cylinder 3: Tall Crystal White/Violet */}
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                  className="w-14 sm:w-16 h-56 sm:h-64 rounded-full border border-white/90 bg-gradient-to-b from-white/90 via-purple-200/40 to-indigo-500/60 backdrop-blur-md relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-800 via-indigo-500 to-transparent opacity-70" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full bg-white/80" />
                </motion.div>
              </div>

              {/* Free-floating Chrome & Glass Liquid Droplets */}
              <motion.div
                animate={{ y: [-8, 8, -8], x: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 -right-4 z-30 w-12 h-12 rounded-full glass-bubble"
              />
              <motion.div
                animate={{ y: [6, -6, 6], x: [3, -3, 3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 left-16 z-30 w-8 h-8 rounded-full glass-bubble"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
