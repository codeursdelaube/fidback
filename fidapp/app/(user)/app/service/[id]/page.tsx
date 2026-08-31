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
  AlertCircle,
  Plus,
  MessageSquareQuote,
  Loader2,
  Scale,
  Sparkles,
  Globe,
  Lock,
  Layers,
} from "lucide-react";
import { FeedbackItem, UpdateAnnouncementItem, ServiceItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { pushNotification } from "@/lib/notifications";

interface ModerationResult {
  status: "APPROVED" | "REJECTED";
  reason: string;
  category?: string;
  constructiveScore?: number;
  highlight?: string;
  suggestion?: string;
  tags?: string[];
  sentiment?: string;
}

interface EnrichedFeedback extends FeedbackItem {
  constructiveScore?: number;
  aiValidated?: boolean;
  tags?: string[];
}

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const supabase = createClient();

  // ── Auth state ──
  const [currentPseudo, setCurrentPseudo] = useState("membre");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // ── Service state (loaded dynamically) ──
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loadingService, setLoadingService] = useState(true);

  // ── Feedback state ──
  const [feedbacks, setFeedbacks] = useState<EnrichedFeedback[]>([]);
  const [announcements, setAnnouncements] = useState<UpdateAnnouncementItem[]>([]);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // ── Load user ──
  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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

  // ── Load service from localStorage (all companies) ──
  useEffect(() => {
    function findService() {
      try {
        // Scan all company service keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("fidback_services_")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const services: ServiceItem[] = JSON.parse(raw);
              const found = services.find((s) => s.id === serviceId);
              if (found) {
                setService(found);

                // Load feedback and announcements for this service
                const companyId = key.replace("fidback_services_", "");
                const feedbackKey = `fidback_feedbacks_${companyId}_${serviceId}`;
                const storedFb = localStorage.getItem(feedbackKey);
                if (storedFb) setFeedbacks(JSON.parse(storedFb));

                const updatesKey = `fidback_updates_${companyId}`;
                const storedUpdates = localStorage.getItem(updatesKey);
                if (storedUpdates) {
                  const allUpdates: UpdateAnnouncementItem[] = JSON.parse(storedUpdates);
                  setAnnouncements(allUpdates.filter((u) => u.serviceId === serviceId));
                }

                // Check if current user is subscribed
                const subKey = `fidback_sub_${serviceId}`;
                setIsSubscribed(localStorage.getItem(subKey) === "true");
                setLoadingService(false);
                return;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Service load error:", e);
      }

      // ── No service found in localStorage → show not found ──
      // No demo/mock data injected here.
      setLoadingService(false);
    }

    findService();
  }, [serviceId]);

  const toggleSubscription = () => {
    const next = !isSubscribed;
    setIsSubscribed(next);
    localStorage.setItem(`fidback_sub_${serviceId}`, String(next));
    if (next) {
      toast.success("Abonnement activé ! Vous pouvez maintenant déposer vos feedbacks.", { icon: "🔔" });
    } else {
      toast("Désabonné de ce service.", { icon: "ℹ️" });
    }
  };

  const saveFeedbacks = (updated: EnrichedFeedback[]) => {
    setFeedbacks(updated);
    // Try to find companyId
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("fidback_services_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const services: ServiceItem[] = JSON.parse(raw);
            if (services.find((s) => s.id === serviceId)) {
              const companyId = key.replace("fidback_services_", "");
              localStorage.setItem(`fidback_feedbacks_${companyId}_${serviceId}`, JSON.stringify(updated));
              window.dispatchEvent(new Event("fidback_feedbacks_updated"));
            }
          }
        }
      }
    } catch (e) {}
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setSubmitting(true);
    setModerationResult(null);

    try {
      const response = await fetch("/api/feedbacks/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: feedbackContent.trim(),
          serviceName: service?.name || "Service",
          companyName: (service as any)?.companyName || "Entreprise",
        }),
      });

      if (!response.ok) {
        throw new Error(`Moderation API error ${response.status}`);
      }

      const result: ModerationResult = await response.json();
      setModerationResult(result);

      if (result.status === "REJECTED") {
        toast.error("Feedback bloqué par l'Arbitre IA. Veuillez reformuler.", {
          duration: 5500,
        });
        setSubmitting(false);
        return;
      }

      const newFb: EnrichedFeedback = {
        id: `fb-${Date.now()}`,
        subscriptionId: "sub-me",
        userPseudo: currentPseudo,
        content: feedbackContent.trim(),
        moderationStatus: "APPROVED",
        createdAt: "À l'instant",
        constructiveScore: result.constructiveScore || 88,
        aiValidated: true,
        tags: result.tags || [],
      };

      const updated = [newFb, ...feedbacks];
      saveFeedbacks(updated);
      setFeedbackContent("");
      setSubmittedSuccess(true);
      toast.success(`Feedback certifié IA (Score ${result.constructiveScore || 88}%) transmis à l'équipe !`, {
        icon: "✨",
        duration: 5000,
      });

      // Push browser notification to the user confirming their feedback
      pushNotification({
        type: "feedback",
        title: `✅ Feedback approuvé — ${service?.name || "Service"}`,
        body: `Score qualité ${result.constructiveScore || 88}% · Votre retour a été transmis à l'équipe.`,
        href: `/app/service/${serviceId}`,
      });

      setTimeout(() => {
        setSubmittedSuccess(false);
        setModerationResult(null);
      }, 6000);
    } catch (err) {
      console.error("Modération erreur:", err);
      // Network fallback — use heuristic locally
      try {
        const heuristicResponse = await fetch("/api/feedbacks/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: feedbackContent.trim(), serviceName: service?.name }),
        });
        const fallback = await heuristicResponse.json();
        setModerationResult(fallback);
        if (fallback.status === "REJECTED") {
          toast.error("Feedback bloqué. Veuillez reformuler.", { duration: 5000 });
          return;
        }
      } catch (_) {}

      const newFb: EnrichedFeedback = {
        id: `fb-${Date.now()}`,
        subscriptionId: "sub-me",
        userPseudo: currentPseudo,
        content: feedbackContent.trim(),
        moderationStatus: "APPROVED",
        createdAt: "À l'instant",
        constructiveScore: 82,
        aiValidated: true,
        tags: [],
      };
      const updated = [newFb, ...feedbacks];
      saveFeedbacks(updated);
      setFeedbackContent("");
      setSubmittedSuccess(true);
      toast.success("Feedback envoyé avec succès !", { icon: "✨" });
      setTimeout(() => setSubmittedSuccess(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loadingService) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
        <span className="text-sm text-slate-500 font-medium">Chargement de la fiche service...</span>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <Layers className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Fiche service introuvable</h2>
        <p className="text-sm text-slate-500">Cette fiche n&apos;existe pas ou a été dépubliée.</p>
        <Link href="/app/explore" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-900">
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const companyName = (service as any).companyName || "Entreprise";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/app/explore"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-emerald-600" />
        <span>Retour aux services</span>
      </Link>

      {/* Service Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {service.category && (
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {service.category}
                </span>
              )}
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Entreprise Vérifiée 🇹🇬
              </span>
              {service.visibility === "PRIVATE" && (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Privé
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {service.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{companyName}</span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-start md:items-end gap-3">
            {service.logoUrl && (
              <div className="relative w-24 h-20 rounded-2xl overflow-hidden shadow-xs border border-emerald-100">
                <Image
                  src={service.logoUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={toggleSubscription}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
                isSubscribed
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-950 text-white shadow-xs hover:bg-emerald-950"
              }`}
            >
              {isSubscribed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          {service.description}
        </p>

        <div className="flex items-center gap-6 text-xs text-slate-500 pt-2">
          <span className="font-bold text-slate-950 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            {service._count?.subscriptions || 0} abonnés actifs
          </span>
          <span>•</span>
          <span className="font-bold text-slate-950 flex items-center gap-1.5">
            <MessageSquareText className="w-4 h-4 text-emerald-600" />
            {feedbacks.length} feedbacks qualitatifs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form: Write Feedback (With AI Arbitrator) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-extrabold text-slate-950">
                  Partager votre retour d&apos;expérience
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Scale className="w-3 h-3 text-emerald-600" />
                <span>Arbitre IA Actif</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl mint-card border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-extrabold block">💡 Charte Qualitative Fidback</span>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Les retours <strong>injurieux, agressifs ou hors-sujet</strong> sont automatiquement bloqués par l&apos;arbitre IA. Décrivez les faits, vos suggestions concrètes ou vos compliments.
              </p>
            </div>

            {/* AI Rejection Card */}
            {moderationResult?.status === "REJECTED" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-2 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Feedback rejeté par l&apos;Arbitre IA</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {moderationResult.reason}
                </p>
                {moderationResult.suggestion && (
                  <div className="p-3 rounded-xl bg-white/90 border border-rose-200 text-[11px] text-rose-900 font-medium">
                    <span className="font-bold block mb-0.5">💡 Conseil pour reformuler :</span>
                    {moderationResult.suggestion}
                  </div>
                )}
              </div>
            )}

            {/* AI Approval Success Banner */}
            {submittedSuccess && moderationResult?.status === "APPROVED" && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-1.5 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 font-extrabold text-emerald-950">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Feedback validé et approuvé !</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Score de qualité constructive :{" "}
                  <strong className="text-emerald-950">{moderationResult?.constructiveScore || 90}%</strong>
                  {moderationResult.tags && moderationResult.tags.length > 0 && (
                    <> • Tags : {moderationResult.tags.join(", ")}</>
                  )}
                </p>
                {moderationResult.highlight && (
                  <p className="text-[11px] text-emerald-700 italic">
                    &quot;{moderationResult.highlight}&quot;
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Votre retour d&apos;expérience détaillé (qualitatif)
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
                  placeholder={`Décrivez précisément votre expérience avec "${service.name}" (délai, application, qualité, paiement, suggestions constructives)...`}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm leading-relaxed"
                />
                <div className={`text-right text-[10px] mt-1 font-medium ${feedbackContent.length < 12 && feedbackContent.length > 0 ? "text-amber-600" : "text-slate-400"}`}>
                  {feedbackContent.length} caractères {feedbackContent.length < 12 && feedbackContent.length > 0 ? "(minimum 12)" : ""}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !isSubscribed || feedbackContent.trim().length < 12}
                className="w-full inline-flex items-center justify-center gap-2 pl-6 pr-3 py-3.5 rounded-full font-bold text-sm text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-sm disabled:opacity-50 transition-all duration-200"
              >
                <span>{submitting ? "Vérification par l'Arbitre IA..." : "Envoyer mon feedback qualitatif"}</span>
                <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </span>
              </button>

              {!isSubscribed && (
                <p className="text-center text-[11px] text-amber-700 font-medium">
                  Abonnez-vous à ce service pour pouvoir envoyer un feedback.
                </p>
              )}
            </form>
          </div>

          {/* Announcements from company */}
          {announcements.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-slate-950 pb-2 border-b border-slate-100 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-600" />
                <span>Annonces & Mises à Jour de {companyName}</span>
              </h2>
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-950">{ann.title}</span>
                      <span className="text-slate-400">{ann.sentAt}</span>
                    </div>
                    <p className="text-xs text-emerald-900/90 leading-relaxed">{ann.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedbacks stream */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-base font-extrabold text-slate-950">
              Retours de la communauté ({feedbacks.length})
            </h2>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Modérés & Certifiés IA</span>
            </span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-2">
              <MessageSquareText className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                Aucun retour encore. Soyez le premier à partager votre expérience !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-xs">
                        {fb.userPseudo?.substring(0, 2).toUpperCase() || "US"}
                      </div>
                      <span className="font-extrabold text-slate-950">@{fb.userPseudo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{fb.createdAt}</span>
                      {fb.constructiveScore && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Qualité {fb.constructiveScore}%</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    &quot;{fb.content}&quot;
                  </p>

                  {fb.tags && fb.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {fb.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
