import Link from "next/link";
import Image from "next/image";
import { Heart, Globe, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30">
                <Image
                  src="/logo.png"
                  alt="Fidback Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Fidback
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              La première plateforme togolaise de feedback produit sans étoiles. Nous connectons les entreprises ambitieuses du Togo avec leurs utilisateurs pour des améliorations continues basées sur des retours qualitatifs détaillés.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Globe className="w-3.5 h-3.5" />
              <span>Fièrement propulsé à Lomé, Togo 🇹🇬</span>
            </div>
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#comment-ca-marche" className="hover:text-white transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Explorer les services
                </Link>
              </li>
              <li>
                <Link href="#tarifs" className="hover:text-white transition-colors">
                  Tarifs & Formules
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Devenir testeur / utilisateur
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Pour Entreprises
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/register-company" className="hover:text-white transition-colors">
                  Rejoindre le programme
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Abonnement annuel / mensuel
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard Entreprise
                </Link>
              </li>
              <li>
                <Link href="#entreprises" className="hover:text-white transition-colors">
                  Fiches services & Annonces
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Sécurité & Légal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Modéré & Vérifié</span>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact support Togo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Fidback Inc. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Conçu avec <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> pour l&apos;écosystème entrepreneurial togolais.
          </p>
        </div>
      </div>
    </footer>
  );
}
