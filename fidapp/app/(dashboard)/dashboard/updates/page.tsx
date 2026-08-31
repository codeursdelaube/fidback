"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BellRing,
  Send,
  Calendar,
  Sparkles,
  Plus,
  Loader2,
  X,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { UpdateAnnouncementItem, ServiceItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { pushNotification } from "@/lib/notifications";

export default function DashboardUpdatesPage() {
  const supabase = createClient();
  const [companyId, setCompanyId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("Mon Entreprise");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [announcements, setAnnouncements] = useState<(UpdateAnnouncementItem & { companyName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // ── Load data from real APIs ──────────────────────────────────────────────
  const loadData = useCallback(async (cid?: string) => {
    const resolvedCid = cid || companyId;
    if (!resolvedCid) return;

    try {
      // 1. Load services from API
      const srvRes = await fetch(`/api/services?companyId=${resolvedCid}`);
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (Array.isArray(srvData.services)) {
          setServices(srvData.services);
          if (srvData.services.length > 0) {
            setSelectedServiceId((prev) => prev || srvData.services[0].id);
          }
        }
      } else {
        const errData = await srvRes.json().catch(() => ({}));
        console.error("Erreur /api/services:", errData?.error || srvRes.status);
      }

      // 2. Load announcements from API — exclude already dismissed ones
      const updRes = await fetch(
        `/api/updates?companyId=${resolvedCid}&excludeDismissedFor=${resolvedCid}`
      );
      if (updRes.ok) {
        const updData = await updRes.json();
        if (Array.isArray(updData.updates)) {
          setAnnouncements(updData.updates);
        }
      } else {
        const errData = await updRes.json().catch(() => ({}));
        console.error("Erreur /api/updates:", errData?.error || updRes.status);
      }
    } catch (err) {
      console.error("Erreur chargement updates:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cid = user?.id || "";
      const cname =
        user?.user_metadata?.companyName ||
        user?.user_metadata?.name ||
        "Mon Entreprise";
      setCompanyId(cid);
      setCompanyName(cname);
      await loadData(cid);
    }
    init();
  }, [supabase]);

  // ── Realtime listener — refresh list on new INSERT ──────────────────────
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel("dashboard-updates-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "UpdateAnnouncement" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, supabase, loadData]);

  // ── Publish announcement ─────────────────────────────────────────────────
  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Veuillez renseigner un titre et un message.");
      return;
    }
    if (!selectedServiceId) {
      toast.error("Veuillez sélectionner un service.");
      return;
    }

    const currentService = services.find((s) => s.id === selectedServiceId);
    const serviceName = currentService?.name || "Service Principal";

    const res = await fetch("/api/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selectedServiceId,
        title: title.trim(),
        message: message.trim(),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      toast.error(errData?.error || "Erreur lors de la publication.");
      console.error("POST /api/updates error:", errData);
      return;
    }

    setTitle("");
    setMessage("");
    toast.success(`Annonce diffusée aux abonnés de « ${serviceName} » !`, {
      icon: "📢",
    });

    pushNotification({
      type: "update",
      title: `📢 MAJ diffusée — ${serviceName}`,
      body: title.trim(),
      href: `/dashboard/updates`,
    });

    // Reload list immediately (Realtime will also fire)
    await loadData();
  };

  // ── Dismiss announcement (persistent in DB with optimistic UI & rollback) ──
  const handleDismiss = async (announcementId: string) => {
    if (!companyId) return;
    setDismissingId(announcementId);

    // Save previous state for rollback in case of error
    const previousAnnouncements = [...announcements];
    // Optimistic UI update: remove immediately from list
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));

    try {
      const res = await fetch("/api/updates/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, announcementId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Rollback state if server returns error
        setAnnouncements(previousAnnouncements);
        toast.error(errData?.error || "Impossible d'effacer cette notification.");
        console.error("POST /api/updates/dismiss error:", errData);
        return;
      }

      toast.success("Notification effacée.", { icon: "✓", duration: 2000 });
    } catch (err) {
      // Rollback state on network exception
      setAnnouncements(previousAnnouncements);
      console.error("Erreur dismiss:", err);
      toast.error("Erreur réseau lors de la suppression.");
    } finally {
      setDismissingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Communication Abonnés</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Annonces &amp; Mises à Jour Produit
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Bouclez la boucle du feedback : informez vos abonnés des résolutions et améliorations apportées suite à leurs retours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form publish announcement */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                Publier une annonce
              </h3>
              <p className="text-xs text-slate-500">
                Diffusée instantanément dans le fil d&apos;actualité de vos abonnés
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
              Chargement des services...
            </div>
          ) : services.length === 0 ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-3">
              <p className="font-semibold">
                Vous n&apos;avez pas encore publié de fiche service pour <strong>{companyName}</strong>.
              </p>
              <Link
                href="/dashboard/services"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950 text-white font-bold text-xs hover:bg-emerald-950 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer une fiche service</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handlePublishUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service concerné
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} ({svc._count?.subscriptions || 0} abonnés)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Titre de la mise à jour
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Version 2.0 : Fonctionnalité demandée désormais disponible !"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message / Explication du changement
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez à vos abonnés ce qui a changé ou s'est amélioré grâce à leurs retours..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Diffuser la mise à jour aux abonnés</span>
              </button>
            </form>
          )}
        </div>

        {/* History of published announcements */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <h3 className="text-base font-extrabold text-slate-950">
              Historique des annonces ({announcements.length})
            </h3>
            {announcements.length > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                Cliquez sur ✕ pour effacer définitivement une entrée
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
              Chargement...
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-3">
              <BellRing className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                Aucune annonce publiée pour l&apos;instant. Vos messages diffusés s&apos;afficheront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {ann.serviceName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {ann.sentAt && ann.sentAt !== "À l'instant"
                          ? new Date(ann.sentAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ann.sentAt}
                      </span>
                      <button
                        type="button"
                        title="Effacer cette notification du tableau de bord"
                        onClick={() => handleDismiss(ann.id)}
                        disabled={dismissingId === ann.id}
                        className="w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        {dismissingId === ann.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-950">
                    {ann.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    {ann.message}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-emerald-700">
                    <CheckCheck className="w-3 h-3" />
                    <span>Diffusée aux abonnés</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
