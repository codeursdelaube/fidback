"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BellRing,
  MessageSquarePlus,
  Compass,
  ArrowRight,
  Building2,
  CheckCircle2,
  Users,
  Sparkles,
  ShieldCheck,
  MessageSquareText,
  Layers,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ServiceItem, UpdateAnnouncementItem, FeedbackItem } from "@/lib/types";

interface MyFeedback {
  id: string;
  serviceName: string;
  serviceId: string;
  content: string;
  createdAt: string;
  constructiveScore?: number;
}

interface SubscribedService {
  id: string;
  name: string;
  companyName?: string;
  category?: string;
  logoUrl?: string;
}

interface RecentUpdate extends UpdateAnnouncementItem {
  companyName?: string;
  serviceName?: string;
}

export default function UserHomePage() {
  const supabase = createClient();
  const [pseudo, setPseudo] = useState("membre");

  // Dynamic data from real DB + localStorage
  const [subscribedServices, setSubscribedServices] = useState<SubscribedService[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [myFeedbacks, setMyFeedbacks] = useState<MyFeedback[]>([]);
  const [currentPseudo, setCurrentPseudo] = useState("membre");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const uPseudo =
            user.user_metadata?.pseudo ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "membre";
          setPseudo(uPseudo);
          setCurrentPseudo(uPseudo);
        }
      } catch (err) {
        console.error("Erreur fetch user:", err);
      }
    }
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    loadFromStorage();

    // Supabase Realtime channel for live announcements
    const channel = supabase
      .channel("user-announcements-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "UpdateAnnouncement",
        },
        async (payload) => {
          console.log("Realtime UpdateAnnouncement received:", payload.new);
          await loadFromStorage();
        }
      )
      .subscribe();

    const onUpdate = () => loadFromStorage();
    window.addEventListener("fidback_feedbacks_updated", onUpdate);
    window.addEventListener("fidback_services_updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("fidback_feedbacks_updated", onUpdate);
      window.removeEventListener("fidback_services_updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [supabase]);

  async function loadFromStorage() {
    try {
      // ── Collect all services + subscriptions ──
      const subbedMap = new Map<string, SubscribedService>();
      const updates: RecentUpdate[] = [];
      const myFbs: MyFeedback[] = [];

      // 1. Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Services
        if (key.startsWith("fidback_services_")) {
          const companyId = key.replace("fidback_services_", "");
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const services: (ServiceItem & { companyName?: string })[] = JSON.parse(raw);
          services.forEach((svc) => {
            const isSubbed = localStorage.getItem(`fidback_sub_${svc.id}`) === "true";
            if (isSubbed) {
              subbedMap.set(svc.id, {
                id: svc.id,
                name: svc.name,
                companyName: svc.companyName,
                category: svc.category,
              });

              // Feedbacks I sent for this service
              const fbRaw = localStorage.getItem(`fidback_feedbacks_${companyId}_${svc.id}`);
              if (fbRaw) {
                const fbs: (FeedbackItem & { constructiveScore?: number })[] = JSON.parse(fbRaw);
                fbs.forEach((fb) => {
                  myFbs.push({
                    id: fb.id,
                    serviceName: svc.name,
                    serviceId: svc.id,
                    content: fb.content,
                    createdAt: fb.createdAt,
                    constructiveScore: fb.constructiveScore,
                  });
                });
              }
            }
          });

          // Updates for subscribed services
          const updRaw = localStorage.getItem(`fidback_updates_${companyId}`);
          if (updRaw) {
            const upds: UpdateAnnouncementItem[] = JSON.parse(updRaw);
            upds.forEach((u) => {
              const matchedSvc = services.find((s) => s.id === u.serviceId);
              if (matchedSvc && localStorage.getItem(`fidback_sub_${u.serviceId}`) === "true") {
                updates.push({
                  ...u,
                  companyName: matchedSvc.companyName,
                  serviceName: matchedSvc.name,
                });
              }
            });
          }
        }
      }

      // 2. Also check /api/services for subscriptions
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.services)) {
            data.services.forEach((svc: any) => {
              const isSubbed = localStorage.getItem(`fidback_sub_${svc.id}`) === "true";
              if (isSubbed && !subbedMap.has(svc.id)) {
                subbedMap.set(svc.id, {
                  id: svc.id,
                  name: svc.name,
                  companyName: svc.companyName,
                  category: svc.category,
                  logoUrl: svc.logoUrl,
                });
              }
            });
          }
        }
      } catch (_) {}

      // 3. Fetch server updates — filtered by userId on the server if we have it,
      //    falling back to localStorage subscription checks
      try {
        const currentUser = (await supabase.auth.getUser()).data.user;
        const uid = currentUser?.id;
        const updUrl = uid ? `/api/updates?userId=${uid}` : "/api/updates";
        const resUpd = await fetch(updUrl);
        if (resUpd.ok) {
          const dataUpd = await resUpd.json();
          if (Array.isArray(dataUpd.updates)) {
            dataUpd.updates.forEach((u: any) => {
              if (!updates.some((existing) => existing.id === u.id)) {
                updates.push(u);
              }
            });
          }
        } else {
          const errData = await resUpd.json().catch(() => ({}));
          console.error("Erreur /api/updates:", errData?.error || resUpd.status);
        }
      } catch (err) {
        console.error("Erreur fetch /api/updates:", err);
      }

      setSubscribedServices(Array.from(subbedMap.values()));
      setRecentUpdates(updates.slice(0, 10));
      setMyFeedbacks(myFbs.slice(0, 10));
    } catch (e) {
      console.warn("Erreur chargement données home:", e);
    }
  }


  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl forest-card p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Membre Testeur Certifié 🇹🇬</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Bonjour @{pseudo} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
            Vos retours qualitatifs aident directement les créateurs togolais à perfectionner leurs produits.
          </p>
        </div>

        <Link
          href="/app/explore"
          className="inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-extrabold shadow-sm transition-all"
        >
          <span>Explorer les services</span>
          <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Updates Feed */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-emerald-600" />
              <span>Dernières Mises à Jour de vos Abonnements</span>
            </h2>
          </div>

          {recentUpdates.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center space-y-3">
              <BellRing className="w-8 h-8 text-slate-200 mx-auto" />
              <p className="text-sm font-bold text-slate-500">Aucune annonce pour le moment</p>
              <p className="text-xs text-slate-400">
                Abonnez-vous à des services pour recevoir leurs mises à jour ici.
              </p>
              <Link
                href="/app/explore"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:text-emerald-900"
              >
                Découvrir les services <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentUpdates.map((upd) => (
                <div
                  key={upd.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-950">
                        {upd.companyName}
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                        {upd.serviceName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{upd.sentAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-950">{upd.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    &quot;{upd.message}&quot;
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Amélioration basée sur vos retours</span>
                    </span>
                    <Link
                      href={`/app/service/${upd.serviceId}`}
                      className="font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <span>Donner un retour</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Sent Feedbacks */}
          {myFeedbacks.length > 0 && (
            <div className="pt-4 space-y-4">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-emerald-600" />
                Mes Retours Récents
              </h2>
              <div className="space-y-3">
                {myFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{fb.serviceName}</span>
                      <div className="flex items-center gap-2">
                        {fb.constructiveScore && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Qualité {fb.constructiveScore}%</span>
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          Approuvé ✓
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic line-clamp-2">
                      &quot;{fb.content}&quot;
                    </p>
                    <div className="text-[10px] text-slate-400">{fb.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: My Subscriptions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-950 pb-2 border-b border-slate-100">
              Mes Services Abonnés ({subscribedServices.length})
            </h2>

            {subscribedServices.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Layers className="w-7 h-7 text-slate-200 mx-auto" />
                <p className="text-xs text-slate-400">Pas encore abonné à un service.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscribedServices.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {svc.logoUrl ? (
                        <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-emerald-100 shadow-2xs">
                          <Image
                            src={svc.logoUrl}
                            alt={svc.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                          {svc.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 line-clamp-1">
                          {svc.name}
                        </span>
                        {svc.companyName && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{svc.companyName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/app/service/${svc.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-emerald-100 text-xs font-bold text-slate-950 hover:bg-emerald-200 transition-colors mt-1"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Rédiger un feedback</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/app/explore"
              className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 py-2 border-t border-slate-100"
            >
              <span>Découvrir plus de services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
