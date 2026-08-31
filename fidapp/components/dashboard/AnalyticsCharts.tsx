"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Sparkles, BarChart3, PieChart as PieIcon, Layers } from "lucide-react";
import { FeedbackItem, ServiceItem } from "@/lib/types";

interface AnalyticsChartsProps {
  feedbacks: FeedbackItem[];
  services: ServiceItem[];
  subscribersCount: number;
}

const COLORS = ["#10b981", "#34d399", "#a7f3d0", "#059669", "#047857"];

export default function AnalyticsCharts({
  feedbacks,
  services,
  subscribersCount,
}: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Calculate 7-day or 30-day timeline data
  const activityData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : 14;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const displayLabel = d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
      });

      // Count feedbacks on this date
      const dayFeedbacks = feedbacks.filter((f) => {
        if (!f.createdAt) return false;
        return f.createdAt.startsWith(dateStr);
      }).length;

      // Base active subscribers spread across days
      const daySubs = Math.max(
        0,
        Math.round((subscribersCount / days) * (days - i))
      );

      result.push({
        date: displayLabel,
        feedbacks: dayFeedbacks,
        abonnés: daySubs,
      });
    }
    return result;
  }, [feedbacks, subscribersCount, timeRange]);

  // 2. Calculate AI Quality Score distribution
  const qualityData = useMemo(() => {
    let high = 0;
    let medium = 0;
    let standard = 0;

    feedbacks.forEach((f: any) => {
      const score = f.constructiveScore || 70;
      if (score >= 80) high++;
      else if (score >= 50) medium++;
      else standard++;
    });

    // If no feedbacks yet, show sample pilot state
    if (feedbacks.length === 0) {
      return [
        { name: "Haute Valeur (>80%)", value: 1, color: "#10b981" },
        { name: "Constructif (50-80%)", value: 1, color: "#34d399" },
        { name: "En cours d'IA", value: 1, color: "#a7f3d0" },
      ];
    }

    return [
      { name: "Haute Valeur (>80%)", value: high || 1, color: "#10b981" },
      { name: "Constructif (50-80%)", value: medium || 1, color: "#34d399" },
      { name: "Standard (<50%)", value: standard || 0, color: "#6ee7b7" },
    ].filter((item) => item.value > 0);
  }, [feedbacks]);

  // 3. Calculate Service comparison data
  const servicesPerformanceData = useMemo(() => {
    if (services.length === 0) {
      return [
        { name: "Service Principal", abonnés: subscribersCount || 0, feedbacks: feedbacks.length || 0 },
      ];
    }

    return services.slice(0, 5).map((s) => ({
      name: s.name.length > 14 ? s.name.slice(0, 14) + "..." : s.name,
      abonnés: s._count?.subscriptions || 0,
      feedbacks: feedbacks.filter((f) => f.serviceId === s.id).length,
    }));
  }, [services, subscribersCount, feedbacks]);

  if (!mounted) {
    return (
      <div className="h-64 rounded-3xl bg-slate-50 border border-slate-200 animate-pulse flex items-center justify-center text-xs text-slate-400">
        Chargement des graphiques interactifs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Analytique Recharts En Direct</span>
          </div>
          <h3 className="text-xl font-black text-slate-950 tracking-tight">
            Performances &amp; Engagement Produit
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setTimeRange("7d")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeRange === "7d"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            7 derniers jours
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              timeRange === "30d"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            14 derniers jours
          </button>
        </div>
      </div>

      {/* Grid: Main Activity AreaChart + AI Quality Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Timeline Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Évolution des Feedbacks &amp; Abonnés
              </h4>
              <p className="text-xs text-slate-500">
                Volume de retours qualitatifs reçus en temps réel
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Feedbacks
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                Abonnés
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFeedbacks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAbonnes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                  }}
                  itemStyle={{ color: "#34d399" }}
                />
                <Area
                  type="monotone"
                  dataKey="feedbacks"
                  name="Feedbacks"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorFeedbacks)"
                />
                <Area
                  type="monotone"
                  dataKey="abonnés"
                  name="Abonnés"
                  stroke="#0f172a"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorAbonnes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Constructive Quality Breakdown Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Index Qualité IA des Retours
            </h4>
            <p className="text-xs text-slate-500">
              Arbitrage et scoring constructif
            </p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-950">
                {feedbacks.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Avis IA
              </span>
            </div>
          </div>

          {/* Legend breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {qualityData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-extrabold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Performance Comparison Bar Chart */}
      {services.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Performance Comparative par Service
              </h4>
              <p className="text-xs text-slate-500">
                Comparaison du nombre d&apos;abonnés et de retours déposés
              </p>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicesPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "10px", fontSize: "11px", fontWeight: 700 }}
                />
                <Bar dataKey="abonnés" name="Abonnés" fill="#0f172a" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Bar dataKey="feedbacks" name="Feedbacks Reçus" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
