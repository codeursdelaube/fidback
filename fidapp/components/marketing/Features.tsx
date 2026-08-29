"use client";

import { motion } from "motion/react";
import {
  ShieldAlert,
  Sliders,
  Send,
  Layers,
  Smartphone,
  Lock,
  Flame,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: ShieldAlert,
      title: "Zéro manipulation d'étoiles",
      desc: "Plus de faux avis 1 étoile par vengeance ou 5 étoiles achetés. Seul le texte argumenté compte pour faire avancer votre produit.",
      badge: "Transparence absolue",
    },
    {
      icon: Sliders,
      title: "Fiches services personnalisées",
      desc: "Publiez vos différentes offres (menu restaurant, app mobile, service de livraison, abonnement SaaS) avec visibilité publique ou privée.",
      badge: "Multi-services",
    },
    {
      icon: Send,
      title: "Annonces de mises à jour ciblées",
      desc: "Prévenez instantanément tous vos abonnés dès qu'une fonctionnalité demandée est livrée ou qu'un bug est corrigé.",
      badge: "Fidélisation forte",
    },
    {
      icon: Smartphone,
      title: "Optimisé pour le marché togolais",
      desc: "Intégration fluide avec les habitudes locales, les devises FCFA et les solutions de paiement mobiles togolaises (T-Money & Flooz).",
      badge: "100% Local & Pratique",
    },
    {
      icon: Lock,
      title: "Protection & Modération intégrée",
      desc: "Chaque feedback est modéré pour garantir respect et constructivité, sans nuire à la liberté de critique technique.",
      badge: "Serein & Sécurisé",
    },
    {
      icon: Layers,
      title: "Dashboard d'analyse en temps réel",
      desc: "Visualisez l'évolution du volume de feedbacks, la réactivité de votre équipe et l'engagement de votre communauté.",
      badge: "Suivi continu",
    },
  ];

  return (
    <section id="entreprises" className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60">
            <Flame className="w-3.5 h-3.5 text-purple-600" />
            <span>Pourquoi les entreprises togolaises choisissent Fidback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Des retours pertinents pour concevoir les meilleurs produits
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Passez de simples suppositions à une connaissance approfondie des besoins de vos clients au Togo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-7 rounded-3xl bg-slate-50/80 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
