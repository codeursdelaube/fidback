"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Rocket, Sparkles, Users } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Programme Pilote 🇹🇬</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Devenez l&apos;une des premières entreprises pionnières
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Nous ouvrons l&apos;accès à une sélection d&apos;entreprises togolaises pour recueillir les premiers retours qualitatifs de leurs utilisateurs.
          </p>
        </div>

        {/* Pilot Program Card */}
        <div className="mint-card rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-900 text-xs font-extrabold">
                <Rocket className="w-4 h-4 text-emerald-600" />
                <span>Offre de Lancement & Accompagnement Dédié</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Votre avis et celui de vos clients façonnent Fidback
              </h3>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl">
                En rejoignant le programme pilote, votre fiche service est configurée avec vous, vos retours sont pris en compte en priorité et vos clients bénéficient d&apos;un espace d&apos;expression sans fausses étoiles ni spams.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Modération IA activée sans frais cachés</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Paiements T-Money & Flooz simplifiés</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Assistance directe à Lomé</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Notification directe de vos abonnés</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-emerald-200 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-emerald-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-950 block">
                  Rejoindre la cohorte pilote
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Places limitées pour un accompagnement soigné
                </span>
              </div>
              <Link
                href="/register-company"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs font-extrabold text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-sm transition-all"
              >
                <span>Inscrire mon entreprise</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
