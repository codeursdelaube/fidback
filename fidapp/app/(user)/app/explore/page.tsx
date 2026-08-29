"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Building2,
  Users,
  MessageSquareText,
  CheckCircle2,
  Filter,
  ArrowRight,
  Plus,
} from "lucide-react";
import { ServiceItem } from "@/lib/types";

export default function ExploreServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [services, setServices] = useState<
    (ServiceItem & { isSubscribed: boolean; bannerUrl?: string })[]
  >([
    {
      id: "srv-1",
      companyId: "comp-1",
      companyName: "Gozem Togo",
      name: "Course Moto & Taxi Lomé",
      description:
        "Plateforme de transport urbain sécurisé et rapide pour tous vos trajets dans le Grand Lomé.",
      visibility: "PUBLIC",
      category: "Transport & Mobilité",
      createdAt: "2026-01-15",
      isSubscribed: true,
      bannerUrl: "/img-entrepreneur.jpg",
      _count: {
        subscriptions: 890,
        feedbacks: 92,
        updateAnnouncements: 7,
      },
    },
    {
      id: "srv-2",
      companyId: "comp-1",
      companyName: "Gozem Togo",
      name: "Livraison Gozem Food",
      description:
        "Commande et livraison express de vos plats favoris depuis les restaurants réputés de la capitale.",
      visibility: "PUBLIC",
      category: "Restauration",
      createdAt: "2026-02-01",
      isSubscribed: true,
      bannerUrl: "/Chef.jpg",
      _count: {
        subscriptions: 530,
        feedbacks: 56,
        updateAnnouncements: 5,
      },
    },
    {
      id: "srv-4",
      companyId: "comp-2",
      companyName: "AfrikPay Togo",
      name: "Paiement & Transfert Mobile",
      description:
        "Application fintech unifiée pour recharger vos comptes T-Money, Flooz et payer vos factures CEET / TdE.",
      visibility: "PUBLIC",
      category: "Fintech",
      createdAt: "2026-01-20",
      isSubscribed: true,
      bannerUrl: "/img-entrepreneur.jpg",
      _count: {
        subscriptions: 1240,
        feedbacks: 140,
        updateAnnouncements: 9,
      },
    },
    {
      id: "srv-5",
      companyId: "comp-3",
      companyName: "Le Palmier Gourmand",
      name: "Expérience Restaurant & Menu du Jour",
      description:
        "Table gastronomique à Tokoin. Donnez votre retour sur l'accueil, les saveurs de nos plats togolais et le cadre.",
      visibility: "PUBLIC",
      category: "Restauration",
      createdAt: "2026-02-10",
      isSubscribed: false,
      bannerUrl: "/Chef.jpg",
      _count: {
        subscriptions: 420,
        feedbacks: 68,
        updateAnnouncements: 4,
      },
    },
    {
      id: "srv-6",
      companyId: "comp-4",
      companyName: "Clinique Santé Lomé",
      name: "Prise de Rendez-vous Médical en Ligne",
      description:
        "Service numérique de consultation et réservation de créneaux avec nos médecins spécialistes.",
      visibility: "PUBLIC",
      category: "Santé",
      createdAt: "2026-02-15",
      isSubscribed: false,
      _count: {
        subscriptions: 290,
        feedbacks: 34,
        updateAnnouncements: 3,
      },
    },
  ]);

  const toggleSubscription = (serviceId: string) => {
    setServices(
      services.map((svc) =>
        svc.id === serviceId
          ? {
              ...svc,
              isSubscribed: !svc.isSubscribed,
              _count: {
                ...svc._count!,
                subscriptions: svc.isSubscribed
                  ? svc._count!.subscriptions - 1
                  : svc._count!.subscriptions + 1,
              },
            }
          : svc
      )
    );
  };

  const filtered = services.filter((svc) => {
    const matchesCategory =
      selectedCategory === "ALL" || svc.category === selectedCategory;
    const matchesQuery =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explorer les Services & Entreprises du Togo 🇹🇬
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Abonnez-vous aux fiches services pour recevoir leurs mises à jour et partager des retours qualitatifs détaillés.
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
            placeholder="Rechercher par nom de service, entreprise..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {["ALL", "Transport & Mobilité", "Fintech", "Restauration", "Santé"].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat === "ALL" ? "Tous les secteurs" : cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {service.bannerUrl && (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-inner">
                  <Image
                    src={service.bannerUrl}
                    alt={service.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold text-slate-900 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm">
                      {service.category}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                {!service.bannerUrl && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {service.category}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleSubscription(service.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ml-auto ${
                    service.isSubscribed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                  }`}
                >
                  {service.isSubscribed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
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

              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">
                  {service.companyName}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {service.name}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
                {service.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  {service._count?.subscriptions} abonnés
                </span>
                <span>•</span>
                <span>{service._count?.feedbacks} feedbacks</span>
              </div>

              <Link
                href={`/app/service/${service.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
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
