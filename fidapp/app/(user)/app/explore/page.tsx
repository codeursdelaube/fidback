"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Building2,
  Users,
  MessageSquareText,
  CheckCircle2,
  ArrowRight,
  Plus,
  Sparkles,
  Layers,
} from "lucide-react";
import { ServiceItem } from "@/lib/types";
import { pushNotification } from "@/lib/notifications";
import toast from "react-hot-toast";

type ServiceWithMeta = ServiceItem & {
  isSubscribed: boolean;
  bannerUrl?: string;
  companyName?: string;
};

export default function ExploreServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [services, setServices] = useState<ServiceWithMeta[]>([]);

  useEffect(() => {
    loadServices();
    const onUpdate = () => loadServices();
    window.addEventListener("storage", onUpdate);
    return () => window.removeEventListener("storage", onUpdate);
  }, []);

  function loadServices() {
    const collected: ServiceWithMeta[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("fidback_services_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed: ServiceWithMeta[] = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((s) => {
                if (s.visibility === "PUBLIC") {
                  const isSubbed = localStorage.getItem(`fidback_sub_${s.id}`) === "true";
                  collected.push({
                    ...s,
                    isSubscribed: isSubbed,
                    bannerUrl: s.logoUrl || s.bannerUrl,
                  });
                }
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("Explorer load services:", e);
    }
    setServices(collected);
  }

  const toggleSubscription = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;

    const next = !svc.isSubscribed;
    localStorage.setItem(`fidback_sub_${serviceId}`, String(next));

    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              isSubscribed: next,
              _count: {
                ...s._count!,
                subscriptions: next
                  ? (s._count?.subscriptions || 0) + 1
                  : Math.max(0, (s._count?.subscriptions || 1) - 1),
              },
            }
          : s
      )
    );

    if (next) {
      toast.success(`Abonné à "${svc.name}" — vous recevrez leurs mises à jour.`, { icon: "🔔" });
      pushNotification({
        type: "system",
        title: `Abonné à ${svc.name}`,
        body: `Vous recevrez désormais les mises à jour de ${svc.companyName || "cette entreprise"}.`,
        href: `/app/service/${serviceId}`,
      });
    } else {
      toast("Désabonné de ce service.", { icon: "ℹ️" });
    }
  };

  // Compute unique categories from actual services
  const categories = ["ALL", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[]];

  const filtered = services.filter((svc) => {
    const matchCat = selectedCategory === "ALL" || svc.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      svc.name.toLowerCase().includes(q) ||
      (svc.companyName || "").toLowerCase().includes(q) ||
      (svc.description || "").toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Annuaire & Écosystème Togo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Explorer les Services & Entreprises du Togo 🇹🇬
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Abonnez-vous aux fiches services pour recevoir leurs mises à jour et partager des retours qualitatifs.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, entreprise, secteur..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-xs"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-950 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat === "ALL" ? "Tous les secteurs" : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Layers className="w-12 h-12 text-slate-200" />
          <p className="text-base font-bold text-slate-500">
            {services.length === 0
              ? "Aucune fiche service publiée pour l'instant"
              : "Aucun service ne correspond à votre recherche"}
          </p>
          {services.length === 0 && (
            <p className="text-xs text-slate-400 text-center max-w-sm">
              Les entreprises partenaires de Fidback publient ici leurs services dès leur inscription. Revenez bientôt !
            </p>
          )}
        </div>
      )}

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              {service.bannerUrl && (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 border border-emerald-100 shadow-xs">
                  <Image
                    src={service.bannerUrl}
                    alt={service.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold text-slate-900 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                      {service.category || "Service"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                {!service.bannerUrl && service.category && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {service.category}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleSubscription(service.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ml-auto ${
                    service.isSubscribed
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold"
                      : "bg-slate-950 text-white shadow-xs hover:bg-emerald-950"
                  }`}
                >
                  {service.isSubscribed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Abonné</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>S&apos;abonner</span>
                    </>
                  )}
                </button>
              </div>

              {service.companyName && (
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-600">{service.companyName}</span>
                </div>
              )}

              <h3 className="text-lg font-bold text-slate-900 mb-2">{service.name}</h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
                {service.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-bold text-slate-800">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  {service._count?.subscriptions ?? 0} abonnés
                </span>
                <span>•</span>
                <span>{service._count?.feedbacks ?? 0} retours</span>
              </div>

              <Link
                href={`/app/service/${service.id}`}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:text-emerald-800"
              >
                <span>Fiche & Avis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
