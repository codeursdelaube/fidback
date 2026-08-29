"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  MessageSquarePlus,
  Compass,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UserHomePage() {
  const supabase = createClient();
  const [pseudo, setPseudo] = useState("membre");

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const uPseudo =
            user.user_metadata?.pseudo ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "membre";
          setPseudo(uPseudo);
        }
      } catch (err) {
        console.warn("Erreur fetch user:", err);
      }
    }
    fetchUser();
  }, [supabase]);

  const subscribedServices = [
    {
      id: "srv-1",
      name: "Course Moto & Taxi Lomé",
      companyName: "Gozem Togo",
      category: "Transport",
      unreadUpdates: 1,
    },
    {
      id: "srv-2",
      name: "Livraison Gozem Food",
      companyName: "Gozem Togo",
      category: "Restauration",
      unreadUpdates: 0,
    },
    {
      id: "srv-4",
      name: "Paiement & Transfert Mobile",
      companyName: "AfrikPay Togo",
      category: "Fintech",
      unreadUpdates: 1,
    },
  ];

  const recentUpdates = [
    {
      id: "upd-1",
      serviceName: "Course Moto & Taxi Lomé",
      companyName: "Gozem Togo",
      title: "Optimisation de la passerelle de paiement T-Money",
      message:
        "Suite à vos précieux feedbacks concernant le délai de réception de l'OTP le matin, notre équipe technique a migré vers un serveur direct. Les transactions se valident désormais sous 5 secondes !",
      date: "Il y a 2 jours",
    },
    {
      id: "upd-3",
      serviceName: "Paiement & Transfert Mobile",
      companyName: "AfrikPay Togo",
      title: "Nouveau : Génération de reçus PDF instantanés",
      message:
        "Vous nous l'aviez demandé pour votre comptabilité : vous pouvez désormais exporter tous vos historiques de transaction en un clic !",
      date: "Il y a 4 jours",
    },
  ];

  const myPastFeedbacks = [
    {
      id: "fb-1",
      serviceName: "Course Moto & Taxi Lomé",
      content:
        "L'application réagit beaucoup plus vite depuis la dernière mise à jour. En revanche, lors des paiements par T-Money le matin vers 8h, le code OTP tarde parfois de 45 secondes. Si vous pouvez optimiser ce délai, ce sera parfait !",
      date: "28 Fév 2026",
      status: "APPROVED",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner (Dynamic Pseudo) */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-850 to-purple-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-200 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-indigo-300" />
            <span>Membre Testeur Actif</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bonjour @{pseudo} 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
            Vos retours qualitatifs aident directement les créateurs togolais à perfectionner leurs produits.
          </p>
        </div>

        <Link
          href="/app/explore"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-bold shadow-md hover:bg-slate-100 transition-all"
        >
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>Explorer de nouveaux services</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Feed of Updates from Creators */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-indigo-600" />
              <span>Dernières Mises à Jour de vos Abonnements</span>
            </h2>
          </div>

          <div className="space-y-4">
            {recentUpdates.map((upd) => (
              <div
                key={upd.id}
                className="glass-card rounded-3xl p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {upd.companyName}
                    </span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full">
                      {upd.serviceName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{upd.date}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {upd.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  &quot;{upd.message}&quot;
                </p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Amélioration basée sur vos retours</span>
                  </span>
                  <Link
                    href={`/app/service/${upd.id.replace("upd-", "srv-")}`}
                    className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <span>Donner un nouveau retour</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* My Past Feedbacks */}
          <div className="pt-4 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Mes Retours Récents
            </h2>
            {myPastFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="glass-card rounded-3xl p-5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{fb.serviceName}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Transmis & Approuvé
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  &quot;{fb.content}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: My Subscribed Services */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Mes Services Abonnés ({subscribedServices.length})
            </h2>

            <div className="space-y-3">
              {subscribedServices.map((svc) => (
                <div
                  key={svc.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {svc.name}
                    </span>
                    {svc.unreadUpdates > 0 && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        1 MAJ
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{svc.companyName}</div>
                  <Link
                    href={`/app/service/${svc.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors mt-1"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Rédiger un feedback</span>
                  </Link>
                </div>
              ))}
            </div>

            <Link
              href="/app/explore"
              className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 py-2 border-t border-slate-100"
            >
              <span>Découvrir plus de services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
