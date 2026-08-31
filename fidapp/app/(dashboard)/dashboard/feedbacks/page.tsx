"use client";

import { useState, useEffect } from "react";
import {
  MessageSquareText,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Search,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Scale,
  Tag,
  Loader2,
} from "lucide-react";
import { FeedbackItem, ModerationStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface FeedbackWithAI extends FeedbackItem {
  constructiveScore: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "CONSTRUCTIVE_CRITIQUE" | "NEGATIVE_UNHELPFUL";
  aiHighlight: string;
  aiTag: string;
}

export default function DashboardFeedbacksPage() {
  const supabase = createClient();
  const [companyId, setCompanyId] = useState<string>("default");
  const [companyName, setCompanyName] = useState<string>("Mon Entreprise");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackWithAI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanyFeedbacks() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const cid = user?.id || "guest-company";
        const cname = user?.user_metadata?.companyName || user?.user_metadata?.name || "Mon Entreprise";
        setCompanyId(cid);
        setCompanyName(cname);

        const storageKey = `fidback_feedbacks_${cid}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            setFeedbacks(JSON.parse(saved));
          } catch (e) {
            setFeedbacks([]);
          }
        } else {
          setFeedbacks([]);
        }
      } catch (err) {
        console.warn("Erreur chargement feedbacks:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCompanyFeedbacks();
  }, [supabase]);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filterStatus !== "ALL" && fb.moderationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = fb.content.toLowerCase().includes(q);
      const matchUser = fb.userPseudo?.toLowerCase().includes(q);
      const matchService = fb.serviceName?.toLowerCase().includes(q);
      const matchTag = fb.aiTag?.toLowerCase().includes(q);
      if (!matchContent && !matchUser && !matchService && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Modération & Qualité IA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Feedbacks Qualitatifs Reçus
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Retours d&apos;expérience réels déposés par vos abonnés, vérifiés et arbitrés par le modèle IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Arbitre IA Actif</span>
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus("ALL")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filterStatus === "ALL"
                ? "bg-slate-950 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Tous ({feedbacks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("APPROVED")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterStatus === "APPROVED"
                ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approuvés ({feedbacks.filter((f) => f.moderationStatus === "APPROVED").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("PENDING")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterStatus === "PENDING"
                ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En attente ({feedbacks.filter((f) => f.moderationStatus === "PENDING").length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un retour..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Content Stream */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Chargement de vos retours...
        </div>
      ) : feedbacks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <MessageSquareText className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-950">
              Aucun feedback reçu pour l&apos;instant
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Dès que vos abonnés testeront vos services et déposeront des retours qualitatifs, ils apparaîtront ici après analyse constructive et arbitrage par le modèle IA.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-950 font-medium">
            💡 Astuce : Publiez une annonce ou partagez le lien de votre fiche service à vos clients pour encourager les retours d&apos;expérience.
          </div>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
          Aucun feedback ne correspond à vos filtres de recherche.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
            >
              {/* Top row: User & service info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-xs">
                    {fb.userPseudo?.substring(0, 2).toUpperCase() || "US"}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-950">@{fb.userPseudo}</span>
                    <span className="text-slate-400 ml-2">sur</span>
                    <span className="font-bold text-emerald-800 ml-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {fb.serviceName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{fb.createdAt}</span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Qualité {fb.constructiveScore || 90}%
                  </span>
                </div>
              </div>

              {/* Feedback text */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                &quot;{fb.content}&quot;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
