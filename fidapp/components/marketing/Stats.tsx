"use client";

import { motion } from "motion/react";

export function Stats() {
  const statCapsules = [
    {
      label: "Retours Qualitatifs",
      value: "45 280+",
      badge: "Textes",
      badgeColor: "bg-indigo-600 text-white",
    },
    {
      label: "Entreprises Togo",
      value: "140+",
      badge: "Lomé & Régions",
      badgeColor: "bg-purple-600 text-white",
    },
    {
      label: "Abonnés Actifs",
      value: "28 350+",
      badge: "Engagés",
      badgeColor: "bg-indigo-500 text-white",
    },
    {
      label: "Faux Avis Étoiles",
      value: "0.00",
      badge: "100% Qualité",
      badgeColor: "bg-purple-700 text-white",
    },
  ];

  return (
    <section className="py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Floating Stat Capsules Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {statCapsules.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel rounded-3xl px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
            >
              <div>
                <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
                  {item.label}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {item.value}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            </motion.div>
          ))}

          {/* Floating Chrome Bubble on the right */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:block absolute -right-6 -top-6 w-10 h-10 rounded-full glass-bubble pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
}
