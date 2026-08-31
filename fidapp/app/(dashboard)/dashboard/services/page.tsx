"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Layers,
  Plus,
  Globe,
  Lock,
  Users,
  MessageSquareText,
  Calendar,
  CheckCircle2,
  Trash2,
  UploadCloud,
  ImageIcon,
  X,
  Loader2,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ServiceItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function DashboardServicesPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyId, setCompanyId] = useState<string>("default");
  const [companyName, setCompanyName] = useState<string>("Mon Entreprise");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVisibility, setNewVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [newCategory, setNewCategory] = useState("Technologie & App");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load actual company services
  useEffect(() => {
    async function loadCompanyServices() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const cid = user?.id || "guest-company";
        const cname = user?.user_metadata?.companyName || user?.user_metadata?.name || "Mon Entreprise";
        setCompanyId(cid);
        setCompanyName(cname);

        const storageKey = `fidback_services_${cid}`;
        const saved = localStorage.getItem(storageKey);
        let localList: ServiceItem[] = [];

        if (saved) {
          try {
            localList = JSON.parse(saved);
          } catch (e) {
            localList = [];
          }
        }

        // Try to fetch from server API
        try {
          const res = await fetch(`/api/services?companyId=${cid}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.services) && data.services.length > 0) {
              setServices(data.services);
              localStorage.setItem(storageKey, JSON.stringify(data.services));
              setLoading(false);
              return;
            }
          }
        } catch (_) {}

        // If server had nothing but local had services, push local to server
        if (localList.length > 0) {
          setServices(localList);
          localList.forEach((s) => {
            fetch("/api/services", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...s, companyName: cname }),
            }).catch(() => {});
          });
        } else {
          setServices([]);
        }
      } catch (err) {
        console.warn("Erreur chargement services:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCompanyServices();
  }, [supabase]);

  // Persist services whenever they change
  const saveServices = (newServices: ServiceItem[]) => {
    setServices(newServices);
    if (companyId) {
      localStorage.setItem(`fidback_services_${companyId}`, JSON.stringify(newServices));
      window.dispatchEvent(new Event("fidback_services_updated"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim()) {
      toast.error("Veuillez renseigner le nom et la description.");
      return;
    }

    setUploading(true);
    let finalImageUrl: string | undefined = undefined;

    try {
      if (imageFile) {
        const bucketName =
          process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "fidback-startup-img";
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `services/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (!error && data?.path) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);
          if (publicUrlData?.publicUrl) {
            finalImageUrl = publicUrlData.publicUrl;
          }
        } else {
          finalImageUrl = imagePreview || undefined;
        }
      }
    } catch (err) {
      console.warn("Storage upload fallback:", err);
      finalImageUrl = imagePreview || undefined;
    } finally {
      setUploading(false);
    }

    const newService: ServiceItem & { companyName?: string } = {
      id: `srv-${Date.now()}`,
      companyId: companyId,
      companyName: companyName,
      name: newName.trim(),
      description: newDescription.trim(),
      visibility: newVisibility,
      category: newCategory,
      createdAt: new Date().toISOString().split("T")[0],
      logoUrl: finalImageUrl,
      _count: {
        subscriptions: 0,
        feedbacks: 0,
        updateAnnouncements: 0,
      },
    };

    // Sync to backend API so all clients/devices see it
    try {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      });
    } catch (apiErr) {
      console.warn("API sync error:", apiErr);
    }

    const updated = [newService, ...services];
    saveServices(updated);

    setIsModalOpen(false);
    setNewName("");
    setNewDescription("");
    setImageFile(null);
    setImagePreview(null);
    toast.success(`Fiche service « ${newService.name} » publiée avec succès !`, {
      icon: "✨",
    });
  };

  const toggleVisibility = async (id: string) => {
    const updated = services.map((s) => {
      if (s.id === id) {
        const nextVis = s.visibility === "PUBLIC" ? ("PRIVATE" as const) : ("PUBLIC" as const);
        toast.success(
          `Visibilité changée en ${nextVis === "PUBLIC" ? "Publique" : "Privée"} pour ${s.name}`,
          { icon: nextVis === "PUBLIC" ? "🌐" : "🔒" }
        );
        const modified = { ...s, visibility: nextVis, companyName };
        // Sync visibility to API
        fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modified),
        }).catch(() => {});
        return modified;
      }
      return s;
    });
    saveServices(updated);
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de la fiche service « ${name} » ?`)) {
      const updated = services.filter((s) => s.id !== id);
      saveServices(updated);
      try {
        await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      } catch (_) {}
      toast.success(`Fiche « ${name} » supprimée.`, { icon: "🗑️" });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Catalogue & Fiches</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Fiches Services & Produits
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Publiez vos offres réelles pour permettre aux abonnés togolais de vous envoyer leurs retours qualitatifs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-extrabold shadow-sm transition-all"
        >
          <span>Ajouter une fiche service</span>
          <span className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          Chargement de vos fiches services...
        </div>
      ) : services.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-300 text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-950">
              Aucune fiche service publiée pour {companyName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Créez votre première fiche (ex: application mobile, service de livraison, menu restaurant, plateforme) pour commencer à collecter des feedbacks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Créer ma première fiche service</span>
          </button>
        </div>
      ) : (
        /* Services Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Visual Header / Banner */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  {service.logoUrl ? (
                    <Image
                      src={service.logoUrl}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-950 to-emerald-950 flex flex-col items-center justify-center text-emerald-400 gap-2">
                      <Layers className="w-10 h-10" />
                      <span className="text-xs font-bold text-white/80">{service.category || "Service"}</span>
                    </div>
                  )}

                  {/* Badges overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold bg-slate-950/80 text-white px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                      {service.category || "Service"}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(service.id)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 transition-all ${
                        service.visibility === "PUBLIC"
                          ? "bg-emerald-500/90 text-slate-950"
                          : "bg-amber-500/90 text-slate-950"
                      }`}
                    >
                      {service.visibility === "PUBLIC" ? (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>PUBLIC</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>PRIVÉ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-base font-extrabold text-slate-950 tracking-tight">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Stats Footer & Actions */}
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <div className="font-extrabold text-slate-950">
                      {service._count?.subscriptions || 0}
                    </div>
                    <div className="text-[10px] text-slate-400">Abonnés</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-950">
                      {service._count?.feedbacks || 0}
                    </div>
                    <div className="text-[10px] text-slate-400">Feedbacks</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteService(service.id, service.name)}
                  title="Supprimer la fiche"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-950">
                  Nouvelle Fiche Service
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              {/* Image Upload Area (bucket fidback-startup-img) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Illustration du service (Optionnelle)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-slate-200 group">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-950/70 text-white hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50/40 transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold">Téléverser une image (Bucket Supabase)</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WebP jusqu&apos;à 5MB</span>
                  </button>
                )}
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom du service / produit
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Application Chauffeur, Livraison Express, Menu Midi..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catégorie
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                >
                  <option value="Technologie & App">Technologie & App</option>
                  <option value="Transport & Mobilité">Transport & Mobilité</option>
                  <option value="Restauration & FoodTech">Restauration & FoodTech</option>
                  <option value="Fintech & Paiement">Fintech & Paiement</option>
                  <option value="Santé & Bien-être">Santé & Bien-être</option>
                  <option value="Commerce & Boutique">Commerce & Boutique</option>
                  <option value="Autre Service">Autre Service</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Décrivez brièvement le service et les aspects sur lesquels vous souhaitez recevoir des avis..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Visibility selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Visibilité
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVisibility("PUBLIC")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      newVisibility === "PUBLIC"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public (Tous les abonnés)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVisibility("PRIVATE")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      newVisibility === "PRIVATE"
                        ? "border-amber-600 bg-amber-50 text-amber-950 font-black"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Privé (Testeurs internes)</span>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full font-bold text-sm text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-sm disabled:opacity-50 transition-all mt-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Envoi vers le bucket...</span>
                  </>
                ) : (
                  <>
                    <span>Publier la fiche service</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
