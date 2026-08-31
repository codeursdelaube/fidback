"use client";

import { useState } from "react";
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
} from "lucide-react";
import { FeedbackItem, ModerationStatus } from "@/lib/types";

interface FeedbackWithAI extends FeedbackItem {
  constructiveScore: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "CONSTRUCTIVE_CRITIQUE" | "NEGATIVE_UNHELPFUL";
  aiHighlight: string;
  aiTag: string;
}

export default function DashboardFeedbacksPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [feedbacks, setFeedbacks] = useState<FeedbackWithAI[]>([
    {
      id: "fb-1",
      subscriptionId: "sub-1",
      serviceName: "Course Moto & Taxi Lomé",
      userPseudo: "kodjo_dev",
      userEmail: "kodjo@techlome.tg",
      content:
        "L'application réagit beaucoup plus vite depuis la dernière mise à jour. En revanche, lors des paiements par T-Money le matin vers 8h, le code OTP tarde parfois de 45 secondes. Si vous pouvez optimiser ce délai, ce sera parfait !",
      moderationStatus: "APPROVED",
      createdAt: "28 Fév 2026 • 08:30",
      constructiveScore: 95,
      sentiment: "CONSTRUCTIVE_CRITIQUE",
      aiHighlight: "Optimisation demandée sur l'envoi de l'OTP T-Money à 8h.",
      aiTag: "Paiement T-Money",
    },
    {
      id: "fb-2",
      subscriptionId: "sub-2",
      serviceName: "Livraison Gozem Food",
      userPseudo: "amina_lome",
      userEmail: "amina@gmail.com",
      content:
        "Les livreurs sont très polis et professionnels. Ce serait génial d'ajouter une option pour pré-enregistrer un pourboire Flooz directement au moment de la validation du panier.",
      moderationStatus: "APPROVED",
      createdAt: "27 Fév 2026 • 14:15",
      constructiveScore: 92,
      sentiment: "POSITIVE",
      aiHighlight: "Suggestion de pourboire direct via Flooz lors du panier.",
      aiTag: "Suggestion Flooz",
    },
    {
      id: "fb-3",
      subscriptionId: "sub-3",
      serviceName: "Course Moto & Taxi Lomé",
      userPseudo: "eric_k",
      userEmail: "eric.k@yahoo.fr",
      content:
        "J'ai remarqué un petit décalage dans l'affichage du solde après une recharge par carte bancaire. Il faut rafraîchir manuellement l'écran.",
      moderationStatus: "PENDING",
      createdAt: "26 Fév 2026 • 19:40",
      constructiveScore: 84,
      sentiment: "CONSTRUCTIVE_CRITIQUE",
      aiHighlight: "Décalage d'affichage du solde après recharge carte.",
      aiTag: "Performance",
    },
    {
      id: "fb-4",
      subscriptionId: "sub-4",
      serviceName: "Gozem Wallet Beta",
      userPseudo: "selom_togo",
      userEmail: "selom@startup.tg",
      content:
        "Le module de virement inter-utilisateurs fonctionne très bien. Petit point d'ergonomie : le bouton de confirmation est un peu trop bas sur les petits écrans Android.",
      moderationStatus: "APPROVED",
      createdAt: "25 Fév 2026 • 11:20",
      constructiveScore: 94,
      sentiment: "POSITIVE",
      aiHighlight: "Ergonomie bouton de confirmation sur petits écrans Android.",
      aiTag: "Interface UI",
    },
    {
      id: "fb-5",
      subscriptionId: "sub-5",
      serviceName: "Livraison Gozem Food",
      userPseudo: "anonymous_spammer",
      userEmail: "spam@bot.com",
      content: "Nul nul nul à chier dégager",
      moderationStatus: "REJECTED",
      createdAt: "24 Fév 2026 • 09:10",
      constructiveScore: 10,
      sentiment: "NEGATIVE_UNHELPFUL",
      aiHighlight: "Langage injurieux sans fondement constructif bloqué par l'arbitre IA.",
      aiTag: "Rejet IA",
    },
  ]);

  const handleUpdateStatus = (id: string, newStatus: ModerationStatus) => {
    setFeedbacks(
      feedbacks.map((fb) =>
        fb.id === id ? { ...fb, moderationStatus: newStatus } : fb
      )
    );
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesStatus =
      filterStatus === "ALL" || fb.moderationStatus === filterStatus;
    const matchesQuery =
      fb.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.userPseudo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.aiTag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with AI badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Centre de Modération IA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Feedbacks des Abonnés & Arbitrage IA
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Chaque retour textuel est vérifié en temps réel par l&apos;IA pour garantir des échanges factuels, respectueux et exploitables.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, pseudo, tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm shadow-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-full text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterStatus("ALL")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              filterStatus === "ALL"
                ? "bg-slate-950 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tous ({feedbacks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("APPROVED")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              filterStatus === "APPROVED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approuvés IA
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("PENDING")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              filterStatus === "PENDING"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            En attente
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("REJECTED")}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              filterStatus === "REJECTED"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rejetés
          </button>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <MessageSquareText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-900">Aucun feedback trouvé</h3>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez vos critères de recherche ou attendez les prochains retours de vos abonnés.
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-extrabold text-sm border border-emerald-200">
                    {fb.userPseudo?.substring(0, 2).toUpperCase() || "US"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-950 text-sm">
                        @{fb.userPseudo}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {fb.serviceName}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {fb.aiTag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{fb.createdAt}</div>
                  </div>
                </div>

                {/* Moderation Badges & Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Score IA {fb.constructiveScore}%</span>
                  </span>

                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                      fb.moderationStatus === "APPROVED"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : fb.moderationStatus === "PENDING"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-rose-100 text-rose-900 border-rose-300"
                    }`}
                  >
                    {fb.moderationStatus === "APPROVED"
                      ? "Approuvé"
                      : fb.moderationStatus === "PENDING"
                      ? "En attente"
                      : "Rejeté"}
                  </span>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      title="Approuver le feedback"
                      onClick={() => handleUpdateStatus(fb.id, "APPROVED")}
                      className={`p-2 rounded-full border transition-all ${
                        fb.moderationStatus === "APPROVED"
                          ? "bg-slate-950 text-emerald-400 border-slate-950"
                          : "border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Rejeter le feedback"
                      onClick={() => handleUpdateStatus(fb.id, "REJECTED")}
                      className={`p-2 rounded-full border transition-all ${
                        fb.moderationStatus === "REJECTED"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback text body */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                &quot;{fb.content}&quot;
              </p>

              {/* AI Summary Banner */}
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Synthèse IA :</span>
                  <span className="font-normal text-emerald-900">{fb.aiHighlight}</span>
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  {fb.sentiment === "POSITIVE"
                    ? "Positif"
                    : fb.sentiment === "CONSTRUCTIVE_CRITIQUE"
                    ? "Critique Constructive"
                    : "Inapproprié"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
