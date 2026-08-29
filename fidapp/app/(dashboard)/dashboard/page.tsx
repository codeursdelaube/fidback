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
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

export default function DashboardOverviewPage() {
  const supabase = createClient();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "6m">("30d");
  const [companyName, setCompanyName] = useState("Votre Entreprise");

  useEffect(() => {
    async function loadCompany() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          if (meta.companyName || meta.name) {
            setCompanyName(meta.companyName || meta.name);
          }
        } else {
          const cached = localStorage.getItem("fidback_company_profile");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.companyName) setCompanyName(parsed.companyName);
          }
        }
      } catch (e) {
        console.warn("Company load error:", e);
      }
    }
    loadCompany();
  }, [supabase]);

  const stats = [
    {
      title: "Feedbacks Reçus",
      value: "148",
      growth: "+18% ce mois",
      icon: MessageSquareText,
      color: "bg-indigo-600",
    },
    {
      title: "Abonnés Actifs",
      value: "1 420",
      growth: "+124 nouveaux",
      icon: Users,
      color: "bg-purple-600",
    },
    {
      title: "Fiches Services",
      value: "3",
      growth: "2 Publiques, 1 Privée",
      icon: Layers,
      color: "bg-blue-600",
    },
    {
      title: "Annonces Diffusées",
      value: "12",
      growth: "Dernière il y a 3j",
      icon: BellRing,
      color: "bg-emerald-600",
    },
  ];

  // Evolution data for Recharts AreaChart
  const feedbackEvolutionData = [
    { month: "Sept", feedbacks: 32, abonnes: 450, approuves: 30 },
    { month: "Oct", feedbacks: 54, abonnes: 620, approuves: 50 },
    { month: "Nov", feedbacks: 78, abonnes: 850, approuves: 74 },
    { month: "Déc", feedbacks: 96, abonnes: 1040, approuves: 91 },
    { month: "Jan", feedbacks: 122, abonnes: 1250, approuves: 118 },
    { month: "Fév", feedbacks: 148, abonnes: 1420, approuves: 142 },
  ];

  // Weekly breakdown by service for BarChart
  const weeklyServiceData = [
    { day: "Lun", courseMoto: 8, gozemFood: 5, walletBeta: 1 },
    { day: "Mar", courseMoto: 12, gozemFood: 7, walletBeta: 2 },
    { day: "Mer", courseMoto: 15, gozemFood: 9, walletBeta: 3 },
    { day: "Jeu", courseMoto: 11, gozemFood: 8, walletBeta: 2 },
    { day: "Ven", courseMoto: 19, gozemFood: 14, walletBeta: 4 },
    { day: "Sam", courseMoto: 24, gozemFood: 21, walletBeta: 1 },
    { day: "Dim", courseMoto: 16, gozemFood: 18, walletBeta: 0 },
  ];

  const recentFeedbacks = [
    {
      id: "fb-1",
      userPseudo: "kodjo_dev",
      serviceName: "Course Moto & Taxi",
      content:
        "L'application réagit beaucoup plus vite depuis la dernière mise à jour. En revanche, lors des paiements par T-Money le matin vers 8h, le code OTP tarde parfois de 45 secondes. Si vous pouvez optimiser ce délai, ce sera parfait !",
      date: "Il y a 2h",
      status: "APPROVED",
      arbitratorScore: 95,
    },
    {
      id: "fb-2",
      userPseudo: "amina_lome",
      serviceName: "Livraison Gozem Food",
      content:
        "Les livreurs sont très polis et professionnels. Ce serait génial d'ajouter une option pour pré-enregistrer un pourboire Flooz directement au moment de la validation du panier.",
      date: "Il y a 6h",
      status: "APPROVED",
      arbitratorScore: 92,
    },
    {
      id: "fb-3",
      userPseudo: "eric_k",
      serviceName: "Portefeuille & Recharge",
      content:
        "J'ai remarqué un petit décalage dans l'affichage du solde après une recharge par carte bancaire. Il faut rafraîchir manuellement l'écran.",
      date: "Hier",
      status: "PENDING",
      arbitratorScore: 84,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-850 to-purple-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-200 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Tableau de bord Fidback Togo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenue, {companyName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
              Vos abonnés partagent des retours qualitatifs réguliers. Pilotez vos tendances en temps réel et diffusez vos améliorations en direct.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/services"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-bold shadow-md hover:bg-slate-100 transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Nouveau service</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`w-9 h-9 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stat.growth}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feedback Evolution Curve (AreaChart) */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Évolution des Feedbacks Qualitatifs
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Courbe mensuelle des retours reçus et abonnés actifs
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setTimeRange("7d")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === "7d" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                7j
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("30d")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === "30d" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500"
                }`}
              >
                6 mois
              </button>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={feedbackEvolutionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="feedbacksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="approuvesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.92)",
                    borderRadius: "1rem",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Area
                  type="monotone"
                  dataKey="feedbacks"
                  name="Feedbacks totaux"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#feedbacksGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="approuves"
                  name="Validés par Arbitre IA"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#approuvesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                Feedbacks Reçus
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                Validés Arbitre IA (96%)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Statistiques en direct</span>
          </div>
        </div>

        {/* Weekly Breakdown by Service (BarChart) */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Répartition par Service
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Volumes journaliers cette semaine
              </p>
            </div>

            <div className="h-60 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyServiceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "0.75rem",
                      border: "none",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="courseMoto" name="Course Moto" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gozemFood" name="Gozem Food" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="walletBeta" name="Wallet Beta" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between">
            <span className="font-semibold">Service le plus actif :</span>
            <span className="font-bold text-indigo-700">Course Moto & Taxi</span>
          </div>
        </div>

      </div>

      {/* Two Column Grid: Feedbacks & Services summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Qualitative Feedbacks */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Derniers Feedbacks Qualitatifs
              </h3>
              <p className="text-xs text-slate-500">
                Retours textuels vérifiés et certifiés constructifs
              </p>
            </div>
            <Link
              href="/dashboard/feedbacks"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Voir tout (148)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      @{fb.userPseudo}
                    </span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full">
                      {fb.serviceName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{fb.date}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Qualité {fb.arbitratorScore}%</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                  &quot;{fb.content}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Service summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Services en ligne
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Course Moto & Taxi
                  </div>
                  <div className="text-[10px] text-slate-500">890 abonnés • 92 retours</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  PUBLIC
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Livraison Gozem Food
                  </div>
                  <div className="text-[10px] text-slate-500">530 abonnés • 56 retours</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  PUBLIC
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Gozem Wallet Beta
                  </div>
                  <div className="text-[10px] text-slate-500">Privé (Testeurs internes)</div>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                  PRIVATE
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/services"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 transition-colors"
            >
              <span>Gérer les fiches services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Announcement card */}
          <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
              <BellRing className="w-4 h-4 text-indigo-600" />
              <span>Boucle de Feedback</span>
            </div>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              Vous avez résolu un problème mentionné par vos clients ? Prévenez vos 1 420 abonnés avec une annonce de mise à jour !
            </p>
            <Link
              href="/dashboard/updates"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
            >
              <span>Rédiger une annonce maintenant</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
