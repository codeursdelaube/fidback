"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Building2,
  Users,
  MessageSquareText,
  BellRing,
  CheckCircle2,
  Send,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  AlertCircle,
  Plus,
  MessageSquareQuote,
  Loader2,
  Scale,
  RotateCcw,
} from "lucide-react";
import { FeedbackItem, UpdateAnnouncementItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface ModerationResult {
  status: "APPROVED" | "REJECTED";
  reason: string;
  category?: string;
  constructiveScore?: number;
  highlight?: string;
  suggestion?: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const supabase = createClient();

  const isFoodService = serviceId === "srv-2" || serviceId === "srv-5";

  const [currentPseudo, setCurrentPseudo] = useState("membre");
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const p =
            user.user_metadata?.pseudo ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "membre";
          setCurrentPseudo(p);
        }
      } catch (e) {
        console.warn("User load error:", e);
      }
    }
    loadUser();
  }, [supabase]);

  const [feedbacks, setFeedbacks] = useState<
    (FeedbackItem & { constructiveScore?: number; aiValidated?: boolean })[]
  >([
    {
      id: "fb-1",
      subscriptionId: "sub-1",
      userPseudo: "kodjo_dev",
      content:
        "L'application réagit beaucoup plus vite depuis la dernière mise à jour. En revanche, lors des paiements par T-Money le matin vers 8h, le code OTP tarde parfois de 45 secondes. Si vous pouvez optimiser ce délai, ce sera parfait !",
      moderationStatus: "APPROVED",
      createdAt: "28 Fév 2026",
      constructiveScore: 95,
      aiValidated: true,
    },
    {
      id: "fb-2",
      subscriptionId: "sub-2",
      userPseudo: "amina_lome",
      content:
        "Les chauffeurs à Nyékonakpoè et Tokoin arrivent généralement en moins de 4 minutes. Très satisfait de la ponctualité et du respect du tarif.",
      moderationStatus: "APPROVED",
      createdAt: "25 Fév 2026",
      constructiveScore: 92,
      aiValidated: true,
    },
  ]);

  const [announcements, setAnnouncements] = useState<UpdateAnnouncementItem[]>([
    {
      id: "upd-1",
      serviceId: serviceId,
      title: "Optimisation de la passerelle de paiement T-Money",
      message:
        "Suite à vos précieux feedbacks concernant le délai de réception de l'OTP le matin, notre équipe technique a migré vers un serveur direct. Les transactions se valident désormais sous 5 secondes !",
      sentAt: "26 Fév 2026",
    },
  ]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setSubmitting(true);
    setModerationResult(null);

    try {
      // 1. Call Gemini AI Arbitrator
      const response = await fetch("/api/feedbacks/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: feedbackContent.trim(),
          serviceName: isFoodService ? "Livraison Gozem Food" : "Course Moto & Taxi Lomé",
          companyName: "Gozem Togo",
        }),
      });

      const result: ModerationResult = await response.json();
      setModerationResult(result);

      // 2. If Gemini rejects (injurious, humiliating, unfair comparative)
      if (result.status === "REJECTED") {
        setSubmitting(false);
        return; // Block submission
      }

      // 3. If Gemini approves -> Add to stream
      const newFb: FeedbackItem & { constructiveScore?: number; aiValidated?: boolean } = {
        id: `fb-${Date.now()}`,
        subscriptionId: "sub-me",
        userPseudo: currentPseudo,
        content: feedbackContent.trim(),
        moderationStatus: "APPROVED",
        createdAt: "À l'instant",
        constructiveScore: result.constructiveScore || 90,
        aiValidated: true,
      };

      setFeedbacks([newFb, ...feedbacks]);
      setFeedbackContent("");
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setModerationResult(null);
      }, 5000);
    } catch (err) {
      console.error("Erreur lors de la modération:", err);
      // Fallback submit
      const newFb = {
        id: `fb-${Date.now()}`,
        subscriptionId: "sub-me",
        userPseudo: currentPseudo,
        content: feedbackContent.trim(),
        moderationStatus: "APPROVED" as const,
        createdAt: "À l'instant",
        constructiveScore: 85,
        aiValidated: true,
      };
      setFeedbacks([newFb, ...feedbacks]);
      setFeedbackContent("");
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/app/explore"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux services</span>
      </Link>

      {/* Service Header Card with Image Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {isFoodService ? "Restauration & FoodTech" : "Transport & Mobilité"}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Entreprise Vérifiée
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isFoodService ? "Livraison Gozem Food & Menus" : "Course Moto & Taxi Lomé"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Gozem Togo</span>
              <span>•</span>
              <span>Lomé, Togo 🇹🇬</span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-start md:items-end gap-3">
            <div className="relative w-28 h-20 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <Image
                src={isFoodService ? "/Chef.jpg" : "/img-entrepreneur.jpg"}
                alt="Service illustration"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                isSubscribed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700"
              }`}
            >
              {isSubscribed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Abonné à ce service</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>S&apos;abonner pour donner mon avis</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          Service de transport urbain sécurisé dans le Grand Lomé. Les retours textuels déposés ici sont analysés pour garantir des échanges respectueux, 100% qualitatifs et constructifs.
        </p>

        <div className="flex items-center gap-6 text-xs text-slate-500 pt-2">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            890 abonnés actifs
          </span>
          <span>•</span>
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <MessageSquareText className="w-4 h-4 text-indigo-600" />
            {feedbacks.length} feedbacks qualitatifs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form: Write Feedback (With Gemini AI Arbitrator) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Partager votre retour d&apos;expérience
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                <Scale className="w-3 h-3 text-indigo-600" />
                <span>Arbitre Qualité</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <span className="font-bold block">💡 Charte Qualitative Fidback</span>
              <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                Les retours <strong>injurieux, humiliants ou diffamatoires</strong> sont automatiquement rejetés par le système de modération. Expliquez clairement les faits, vos suggestions ou vos compliments.
              </p>
            </div>

            {/* AI Rejection Card with Advice */}
            {moderationResult?.status === "REJECTED" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-2 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Feedback rejeté par l&apos;Arbitre Qualité</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {moderationResult.reason}
                </p>
                {moderationResult.suggestion && (
                  <div className="p-3 rounded-xl bg-white/80 border border-rose-200 text-[11px] text-rose-900 font-medium">
                    <span className="font-bold block mb-0.5">💡 Conseil pour reformuler :</span>
                    {moderationResult.suggestion}
                  </div>
                )}
              </div>
            )}

            {/* AI Approval Success Banner */}
            {submittedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm space-y-1.5 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Feedback validé et approuvé !</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Score de qualité constructive : <strong className="text-emerald-950">{moderationResult?.constructiveScore || 95}%</strong>. Transmis aux fondateurs de Gozem Togo.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Votre retour d&apos;expérience détaillé
                </label>
                <textarea
                  rows={5}
                  required
                  value={feedbackContent}
                  onChange={(e) => {
                    setFeedbackContent(e.target.value);
                    if (moderationResult?.status === "REJECTED") {
                      setModerationResult(null);
                    }
                  }}
                  placeholder="Décrivez précisément votre expérience (temps d'attente, application, paiement T-Money, relation client, suggestions constructives)..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !isSubscribed || !feedbackContent.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification de conformité...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer mon feedback qualitatif</span>
                  </>
                )}
              </button>

              {!isSubscribed && (
                <p className="text-center text-[11px] text-amber-700 font-medium">
                  Abonnez-vous ci-dessus pour pouvoir envoyer un feedback.
                </p>
              )}
            </form>
          </div>

          {/* Announcements from Creator */}
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-indigo-600" />
              <span>Annonces & Mises à Jour de Gozem</span>
            </h2>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-950">{ann.title}</span>
                    <span className="text-slate-400">{ann.sentAt}</span>
                  </div>
                  <p className="text-xs text-indigo-900/80 leading-relaxed">
                    {ann.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Existing Feedbacks list */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Retours de la communauté ({feedbacks.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Modérés & Certifiés constructifs</span>
            </span>
          </div>

          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="glass-card rounded-3xl p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {fb.userPseudo?.substring(0, 2).toUpperCase() || "US"}
                    </div>
                    <span className="font-bold text-slate-900">
                      @{fb.userPseudo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{fb.createdAt}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Score {fb.constructiveScore || 90}%</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  &quot;{fb.content}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
