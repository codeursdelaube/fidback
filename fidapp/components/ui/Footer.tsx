import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Globe, Heart, Send, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950 flex items-center justify-center shadow-md">
                <Image
                  src="/logo.png"
                  alt="Fidback Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
                Fidback
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                  TOGO 🇹🇬
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              La plateforme togolaise de feedback produit sans étoiles. Nous connectons les entreprises togolaises à leurs abonnés pour des améliorations continues assistées par l&apos;IA.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full w-fit">
              <Globe className="w-3.5 h-3.5" />
              <span>Fièrement propulsé à Lomé, Togo 🇹🇬</span>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Produit & Solutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="#solutions" className="hover:text-emerald-400 transition-colors">
                  Nos fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="#comment-ca-marche" className="hover:text-emerald-400 transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-emerald-400 transition-colors">
                  Explorer les fiches services
                </Link>
              </li>
              <li>
                <Link href="#tarifs" className="hover:text-emerald-400 transition-colors">
                  Tarifs & Formules FCFA
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Entreprises
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/register-company" className="hover:text-emerald-400 transition-colors">
                  Inscrire mon entreprise
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-emerald-400 transition-colors">
                  Abonnement Mobile Money
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Tableau de bord entreprise
                </Link>
              </li>
              <li>
                <Link href="/dashboard/updates" className="hover:text-emerald-400 transition-colors">
                  Diffusion de mises à jour
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Newsletter (matching reference newsletter box) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Newsletter & Tendances
            </h4>
            <p className="text-xs text-slate-400 leading-snug">
              Recevez nos conseils pour améliorer l&apos;expérience client de vos produits au Togo.
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
              <input
                type="email"
                placeholder="Votre email..."
                className="bg-transparent text-xs text-white px-2.5 py-1 w-full focus:outline-none placeholder:text-slate-600"
              />
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 hover:bg-emerald-400 transition-colors"
                title="S'inscrire"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Fidback TG. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Conçu avec <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> pour l&apos;écosystème entrepreneurial togolais.
          </p>
        </div>
      </div>
    </footer>
  );
}
