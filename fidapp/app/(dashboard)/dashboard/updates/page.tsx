"use client";

import { useState } from "react";
import {
  BellRing,
  Send,
  Layers,
  Calendar,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { UpdateAnnouncementItem } from "@/lib/types";

export default function DashboardUpdatesPage() {
  const [selectedServiceId, setSelectedServiceId] = useState("srv-1");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const [announcements, setAnnouncements] = useState<UpdateAnnouncementItem[]>([
    {
      id: "upd-1",
      serviceId: "srv-1",
      serviceName: "Course Moto & Taxi Lomé",
      title: "Optimisation de la passerelle de paiement T-Money",
      message:
        "Suite à vos précieux feedbacks concernant le délai de réception de l'OTP le matin, notre équipe technique a migré vers un serveur direct. Les transactions se valident désormais sous 5 secondes chrono !",
      sentAt: "26 Fév 2026 • 10:00",
    },
    {
      id: "upd-2",
      serviceId: "srv-2",
      serviceName: "Livraison Gozem Food",
      title: "Ajout de 8 nouveaux restaurants partenaires à Lomé",
      message:
        "Vous nous aviez demandé plus de choix culinaires togolais et ouest-africains. Nous venons d'intégrer 8 nouvelles enseignes traditionnelles !",
      sentAt: "20 Fév 2026 • 16:30",
    },
  ]);

  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newAnnouncement: UpdateAnnouncementItem = {
      id: `upd-${Date.now()}`,
      serviceId: selectedServiceId,
      serviceName:
        selectedServiceId === "srv-1"
          ? "Course Moto & Taxi Lomé"
          : selectedServiceId === "srv-2"
          ? "Livraison Gozem Food"
          : "Gozem Wallet Beta",
      title: title.trim(),
      message: message.trim(),
      sentAt: "À l'instant",
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle("");
    setMessage("");
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
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

          {sentSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Annonce diffusée avec succès à vos abonnés !</span>
            </div>
          )}

          <form onSubmit={handlePublishUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Service concerné
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="srv-1">Course Moto & Taxi Lomé (890 abonnés)</option>
                <option value="srv-2">Livraison Gozem Food (530 abonnés)</option>
                <option value="srv-3">Gozem Wallet Beta (45 abonnés)</option>
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
                placeholder="Ex: Version 2.4 : Paiement T-Money accéléré !"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                placeholder="Expliquez à vos abonnés ce qui a changé grâce à leurs retours qualitatifs..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
        </div>

        {/* History of published announcements */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-950 pb-2 border-b border-slate-200/80">
            Historique des annonces diffusées ({announcements.length})
          </h3>

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
        </div>
      </div>
    </div>
  );
}
