"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BellRing,
  Send,
  Layers,
  Calendar,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { UpdateAnnouncementItem, ServiceItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function DashboardUpdatesPage() {
  const supabase = createClient();
  const [companyId, setCompanyId] = useState<string>("default");
  const [companyName, setCompanyName] = useState<string>("Mon Entreprise");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [announcements, setAnnouncements] = useState<UpdateAnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const cid = user?.id || "guest-company";
        const cname = user?.user_metadata?.companyName || user?.user_metadata?.name || "Mon Entreprise";
        setCompanyId(cid);
        setCompanyName(cname);

        // Load services
        const servicesKey = `fidback_services_${cid}`;
        const savedServices = localStorage.getItem(servicesKey);
        if (savedServices) {
          try {
            const parsedServices: ServiceItem[] = JSON.parse(savedServices);
            setServices(parsedServices);
            if (parsedServices.length > 0) {
              setSelectedServiceId(parsedServices[0].id);
            }
          } catch (e) {
            setServices([]);
          }
        } else {
          setServices([]);
        }

        // Load announcements
        const updatesKey = `fidback_updates_${cid}`;
        const savedUpdates = localStorage.getItem(updatesKey);
        if (savedUpdates) {
          try {
            setAnnouncements(JSON.parse(savedUpdates));
          } catch (e) {
            setAnnouncements([]);
          }
        } else {
          setAnnouncements([]);
        }
      } catch (err) {
        console.warn("Erreur chargement updates:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const saveAnnouncements = (newUpdates: UpdateAnnouncementItem[]) => {
    setAnnouncements(newUpdates);
    if (companyId) {
      localStorage.setItem(`fidback_updates_${companyId}`, JSON.stringify(newUpdates));
      window.dispatchEvent(new Event("fidback_updates_updated"));
    }
  };

  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Veuillez renseigner un titre et un message.");
      return;
    }

    const currentService = services.find((s) => s.id === selectedServiceId);
    const serviceName = currentService ? currentService.name : "Service Principal";

    const newAnnouncement: UpdateAnnouncementItem = {
      id: `upd-${Date.now()}`,
      serviceId: selectedServiceId || "default-srv",
      serviceName,
      title: title.trim(),
      message: message.trim(),
      sentAt: "À l'instant",
    };

    const updated = [newAnnouncement, ...announcements];
    saveAnnouncements(updated);

    setTitle("");
    setMessage("");
    toast.success(`Annonce diffusée en direct aux abonnés de « ${serviceName} » !`, {
      icon: "📢",
    });
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
          Annonces & Mises à Jour Produit
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

          {services.length === 0 ? (
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
          <h3 className="text-base font-extrabold text-slate-950 pb-2 border-b border-slate-200/80">
            Historique des annonces diffusées ({announcements.length})
          </h3>

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
                    <span className="text-[10px] text-slate-400">{ann.sentAt}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-950">
                    {ann.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                    {ann.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
