import Link from "next/link";
import { ArrowUpRight, Lightbulb, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="forest-card rounded-3xl p-8 sm:p-14 text-white overflow-hidden relative">
          
          {/* Subtle Ambient green glow */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left text column */}
            <div className="lg:col-span-8 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Passez à l&apos;action dès aujourd&apos;hui</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Prêt à transformer vos retours clients en succès ?
              </h2>

              <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl leading-relaxed">
                Rejoignez le programme de feedback Fidback. Inscrivez votre entreprise, publiez vos fiches services et bénéficiez de notre arbitrage IA et des paiements T-Money & Flooz.
              </p>

              <div className="pt-2">
                <Link
                  href="/register-company"
                  className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-3.5 text-sm font-extrabold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-full shadow-lg shadow-lime-500/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Inscrire mon entreprise maintenant</span>
                  <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Right illustration column (Lightbulb & Green Orbiting Rings) */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                {/* Glowing Outer Rings */}
                <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-spin" style={{ animationDuration: "18s" }} />
                <div className="absolute inset-4 rounded-full border border-dashed border-lime-400/40 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
                
                {/* Center glowing badge */}
                <div className="w-28 h-28 rounded-full bg-emerald-900/90 border-2 border-emerald-400/60 flex flex-col items-center justify-center text-center p-3 shadow-2xl shadow-emerald-500/30">
                  <Lightbulb className="w-10 h-10 text-lime-300 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-200 mt-1 uppercase">
                    100% Impact
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
