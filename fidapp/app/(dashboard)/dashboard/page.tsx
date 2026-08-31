"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquareText,
  Users,
  Layers,
  TrendingUp,
  ArrowRight,
  Plus,
  BellRing,
  Building2,
  ShieldCheck,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Layers2,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ServiceItem, UpdateAnnouncementItem, FeedbackItem } from "@/lib/types";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";

export default function DashboardOverviewPage() {
  const supabase = createClient();
  const [companyName, setCompanyName] = useState("Votre Entreprise");
  const [servicesCount, setServicesCount] = useState(0);
  const [feedbacksCount, setFeedbacksCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [updatesCount, setUpdatesCount] = useState(0);
  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackItem[]>([]);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);

  const loadCompanyData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.id || "guest-company";
      const cname =
        user?.user_metadata?.companyName ||
        user?.user_metadata?.name ||
        "Votre Entreprise";
      setCompanyName(cname);

      // 1. Load services & real subscription counts from Prisma API
      const srvRes = await fetch(`/api/services?companyId=${cid}`);
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (Array.isArray(srvData.services)) {
          setServicesList(srvData.services);
          setServicesCount(srvData.services.length);

          const totalSubs = srvData.services.reduce(
            (acc: number, s: any) => acc + (s._count?.subscriptions || 0),
            0
          );
          setSubscribersCount(totalSubs);
        }
      }

      // 2. Load real feedbacks from Prisma API
      const fbRes = await fetch(`/api/feedbacks?companyId=${cid}`);
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (Array.isArray(fbData.feedbacks)) {
          setFeedbacksCount(fbData.feedbacks.length);
          setRecentFeedbacks(fbData.feedbacks.slice(0, 3));
        }
      }

      // 3. Load real update announcements from Prisma API
      const updRes = await fetch(`/api/updates?companyId=${cid}`);
      if (updRes.ok) {
        const updData = await updRes.json();
        if (Array.isArray(updData.updates)) {
          setUpdatesCount(updData.updates.length);
        }
      }
    } catch (e) {
      console.warn("Erreur chargement aperçu:", e);
    }
  };

  useEffect(() => {
    loadCompanyData();

    // Supabase Realtime listeners for live updates on Subscription and Feedback
    const channel = supabase
      .channel("dashboard-overview-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Subscription" },
        () => loadCompanyData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Feedback" },
        () => loadCompanyData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "UpdateAnnouncement" },
        () => loadCompanyData()
      )
      .subscribe();

    const handleServicesUpdate = () => loadCompanyData();
    window.addEventListener("fidback_services_updated", handleServicesUpdate);
    window.addEventListener("fidback_profile_updated", handleServicesUpdate);
    window.addEventListener("fidback_updates_updated", handleServicesUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("fidback_services_updated", handleServicesUpdate);
      window.removeEventListener("fidback_profile_updated", handleServicesUpdate);
      window.removeEventListener("fidback_updates_updated", handleServicesUpdate);
    };
  }, [supabase]);

  const stats = [
    {
      title: "Feedbacks Reçus",
      value: feedbacksCount.toString(),
      growth: feedbacksCount > 0 ? `${feedbacksCount} qualitatifs` : "En attente",
      icon: MessageSquareText,
      color: "bg-emerald-500 text-slate-950",
    },
    {
      title: "Abonnés Connectés",
      value: subscribersCount.toString(),
      growth: subscribersCount > 0 ? `Abonnés actifs` : "Visiteurs réguliers",
      icon: Users,
      color: "bg-slate-950 text-emerald-400",
    },
    {
      title: "Fiches Services",
      value: servicesCount.toString(),
      growth: `${servicesList.filter((s) => s.visibility === "PUBLIC").length} Publique(s)`,
      icon: Layers,
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Annonces Diffusées",
      value: updatesCount.toString(),
      growth: updatesCount > 0 ? "Boucle active" : "0 diffusée",
      icon: BellRing,
      color: "bg-lime-300 text-slate-950",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl forest-card p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Espace Startups Pilotes • Togo 🇹🇬</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bienvenue, {companyName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Votre tableau de bord centralise vos fiches services, la réception de retours qualitatifs certifiés par l&apos;IA et la diffusion de vos mises à jour.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/services"
              className="inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-extrabold shadow-md transition-all"
            >
              <span>{servicesCount === 0 ? "Créer mon 1er service" : "Nouveau service"}</span>
              <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-2xl ${stat.color} flex items-center justify-center shadow-xs font-bold`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stat.growth}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboarding Steps Card for New Companies */}
      {servicesCount === 0 && (
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-emerald-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                🚀 Démarrage Rapide
              </span>
              <h3 className="text-lg font-black text-slate-950">
                Bien configurer votre espace {companyName}
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
              Étape 1 sur 3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="font-extrabold text-sm text-slate-950">
                  Publier une fiche service
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ajoutez votre première offre (application, service, menu) pour la rendre visible auprès de vos utilisateurs.
                </p>
              </div>
              <Link
                href="/dashboard/services"
                className="inline-flex items-center gap-1.5 font-extrabold text-xs text-emerald-800 hover:text-emerald-950 pt-2"
              >
                <span>Créer un service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="font-extrabold text-sm text-slate-950">
                  Personnaliser le profil
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Téléversez votre logo officiel dans le bucket Supabase et complétez les coordonnées de l&apos;entreprise.
                </p>
              </div>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-1.5 font-extrabold text-xs text-slate-700 hover:text-slate-950 pt-2"
              >
                <span>Accéder aux paramètres</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="font-extrabold text-sm text-slate-950">
                  Collecter les retours IA
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vos clients déposeront des feedbacks constructifs, modérés et valorisés par notre modèle d&apos;arbitrage IA.
                </p>
              </div>
              <Link
                href="/dashboard/feedbacks"
                className="inline-flex items-center gap-1.5 font-extrabold text-xs text-slate-700 hover:text-slate-950 pt-2"
              >
                <span>Voir les feedbacks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recharts Analytics Section */}
      <AnalyticsCharts
        feedbacks={recentFeedbacks}
        services={servicesList}
        subscribersCount={subscribersCount}
      />

      {/* Two Column Grid: Feedbacks & Services summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Qualitative Feedbacks */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                Derniers Feedbacks Qualitatifs
              </h3>
              <p className="text-xs text-slate-500">
                Retours textuels vérifiés et certifiés constructifs par l&apos;IA
              </p>
            </div>
            <Link
              href="/dashboard/feedbacks"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Voir tout ({feedbacksCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentFeedbacks.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <MessageSquareText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                Aucun feedback reçu pour l&apos;instant sur vos services.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-950">
                        @{fb.userPseudo}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{fb.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/70">
                    &quot;{fb.content}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Services summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-950">
                Vos Services ({servicesCount})
              </h3>
              <Link
                href="/dashboard/services"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Gérer
              </Link>
            </div>

            {servicesList.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <Layers className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  Aucune fiche service publiée.
                </p>
                <Link
                  href="/dashboard/services"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                >
                  <span>Créer une fiche maintenant</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {servicesList.slice(0, 3).map((svc) => (
                  <div
                    key={svc.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{svc.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {svc._count?.subscriptions || 0} abonnés • {svc.category || "Service"}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {svc.visibility}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Announcement card */}
          <div className="p-6 rounded-3xl mint-card border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <BellRing className="w-4 h-4 text-emerald-600" />
              <span>Boucle de Feedback Client</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Vous avez résolu un problème mentionné par vos clients ? Informez directement vos abonnés avec une annonce de mise à jour !
            </p>
            <Link
              href="/dashboard/updates"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 underline"
            >
              <span>Rédiger une annonce</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
