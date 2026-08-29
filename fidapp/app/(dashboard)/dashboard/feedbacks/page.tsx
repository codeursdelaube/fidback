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
} from "lucide-react";
import { FeedbackItem, ModerationStatus } from "@/lib/types";

export default function DashboardFeedbacksPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: "fb-1",
      subscriptionId: "sub-1",
      serviceName: "Course Moto & Taxi Lomé",
      userPseudo: "kodjo_dev",
      userEmail: "kodjo@techlome.tg",
      content:
        "L'application réagit beaucoup plus vite depuis la dernière mise à jour. En revanche, lors des paiements par T-Money le matin vers 8h, le code OTP tarde parfois de 45 secondes. Si vous pouvez optimiser ce délai, ce sera parfait !",
      moderationStatus: "APPROVED",
      createdAt: "2026-02-28 08:30",
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
      createdAt: "2026-02-27 14:15",
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
      createdAt: "2026-02-26 19:40",
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
      createdAt: "2026-02-25 11:20",
    },
    {
      id: "fb-5",
      subscriptionId: "sub-5",
      serviceName: "Livraison Gozem Food",
      userPseudo: "anonymous_spammer",
      userEmail: "spam@bot.com",
      content: "Nul nul nul pas content",
      moderationStatus: "REJECTED",
      createdAt: "2026-02-24 09:10",
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
      fb.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Flux des Feedbacks Qualitatifs
        </h2>
        <p className="text-sm text-slate-600">
          Consultez et modérez les retours d&apos;expérience textuels partagés par vos abonnés togolais.
        </p>
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
            placeholder="Rechercher par mot-clé, pseudo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "ALL"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tous ({feedbacks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("APPROVED")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "APPROVED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approuvés
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("PENDING")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "PENDING"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            En attente
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("REJECTED")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === "REJECTED"
                ? "bg-rose-600 text-white shadow-sm"
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
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <MessageSquareText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">Aucun feedback trouvé</h3>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez vos critères de recherche ou attendez les prochains retours de vos abonnés.
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {fb.userPseudo?.substring(0, 2).toUpperCase() || "US"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        @{fb.userPseudo}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        {fb.serviceName}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{fb.createdAt}</div>
                  </div>
                </div>

                {/* Moderation Badges & Actions */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      fb.moderationStatus === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : fb.moderationStatus === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {fb.moderationStatus === "APPROVED"
                      ? "Approuvé"
                      : fb.moderationStatus === "PENDING"
                      ? "En attente de modération"
                      : "Rejeté"}
                  </span>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Approuver le feedback"
                      onClick={() => handleUpdateStatus(fb.id, "APPROVED")}
                      className={`p-1.5 rounded-xl border transition-all ${
                        fb.moderationStatus === "APPROVED"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Rejeter le feedback"
                      onClick={() => handleUpdateStatus(fb.id, "REJECTED")}
                      className={`p-1.5 rounded-xl border transition-all ${
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
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                &quot;{fb.content}&quot;
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
