"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles,
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardBillingPage() {
  const supabase = createClient();
  const [companyName, setCompanyName] = useState("Mon Entreprise");

  useEffect(() => {
    async function loadCompany() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const cname =
            user.user_metadata?.companyName ||
            user.user_metadata?.name ||
            "Mon Entreprise";
          setCompanyName(cname);
        }
      } catch (e) {
        console.warn("Billing user load error:", e);
      }
    }
    loadCompany();
  }, [supabase]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gestion Financière</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Abonnement & Facturation
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Suivez votre formule active et votre accès au programme de feedbacks qualitatifs au Togo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Subscription Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Formule en cours
              </span>
              <h3 className="text-xl font-black text-slate-950 mt-1 flex items-center gap-2">
                <span>Programme Pilote Startups 🇹🇬</span>
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>STATUT ACTIF</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">
                Tarification
              </span>
              <div className="text-lg font-black text-slate-950">
                Offert (Phase Pilote)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">
                Bénéficiaire
              </span>
              <div className="text-sm font-bold text-slate-800 truncate">
                {companyName}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl mint-card border border-emerald-200 space-y-2 text-xs text-emerald-950">
            <div className="font-extrabold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Avantages Programme Pilote Togolais</span>
            </div>
            <ul className="text-[11px] text-emerald-900 space-y-1 pl-1">
              <li>• Création de fiches services illimitée</li>
              <li>• Réception illimitée de feedbacks qualitatifs modérés par l&apos;IA</li>
              <li>• Diffusion d&apos;annonces de mise à jour à tous vos abonnés</li>
              <li>• Support dédié pour les startups partenaires à Lomé</li>
            </ul>
          </div>
        </div>

        {/* Info Side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-950 pb-2 border-b border-slate-100">
              Paiements & Historique
            </h3>

            <div className="py-6 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-900">
                Aucune facture en attente
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Votre entreprise bénéficie de l&apos;accès pilote gratuit. Les options de règlement Mobile Money (T-Money / Flooz) seront disponibles lors du lancement commercial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
