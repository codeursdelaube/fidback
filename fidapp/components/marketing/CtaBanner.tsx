import Link from "next/link";
import { ArrowRight, Building2, MessageSquareQuote } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-neutral-900 via-indigo-950 to-slate-900 p-8 sm:p-14 text-white overflow-hidden shadow-2xl">
          {/* Background shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Prêt à passer au feedback qualitatif ?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Donnez une voix concrète à vos clients dès aujourd&apos;hui.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Inscrivez votre entreprise en moins de 2 minutes, configurez vos fiches services et recevez des retours clairs pour faire grandir votre activité au Togo.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/register-company"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl shadow-lg transition-all duration-200"
              >
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Inscrire mon entreprise</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-200"
              >
                <span>Explorer les services</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
