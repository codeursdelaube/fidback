"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import { ServiceItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function DashboardServicesPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "srv-1",
      companyId: "comp-1",
      name: "Course Moto & Taxi Lomé",
      description:
        "Service de transport urbain sécurisé et rapide pour tous vos déplacements dans le Grand Lomé.",
      visibility: "PUBLIC",
      category: "Transport & Mobilité",
      createdAt: "2026-01-15",
      logoUrl: "/img-entrepreneur.jpg",
      _count: {
        subscriptions: 890,
        feedbacks: 92,
        updateAnnouncements: 7,
      },
    },
    {
      id: "srv-2",
      companyId: "comp-1",
      name: "Livraison Gozem Food",
      description:
        "Commande et livraison express de repas depuis les meilleurs restaurants de Lomé.",
      visibility: "PUBLIC",
      category: "Restauration & FoodTech",
      createdAt: "2026-02-01",
      logoUrl: "/Chef.jpg",
      _count: {
        subscriptions: 530,
        feedbacks: 56,
        updateAnnouncements: 5,
      },
    },
    {
      id: "srv-3",
      companyId: "comp-1",
      name: "Gozem Wallet & Paiements Beta",
      description:
        "Module expérimental de portefeuille électronique et micro-crédits pour chauffeurs et usagers.",
      visibility: "PRIVATE",
      category: "Fintech & Expérimental",
      createdAt: "2026-02-18",
      _count: {
        subscriptions: 45,
        feedbacks: 18,
        updateAnnouncements: 2,
      },
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVisibility, setNewVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [newCategory, setNewCategory] = useState("Technologie & App");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    if (!newName.trim() || !newDescription.trim()) return;

    setUploading(true);
    let finalImageUrl = imagePreview || "/img-entrepreneur.jpg";

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
            upsert: false,
          });

        if (!error && data?.path) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);
          if (publicUrlData?.publicUrl) {
            finalImageUrl = publicUrlData.publicUrl;
          }
        }
      }
    } catch (err) {
      console.warn("Storage upload fallback:", err);
    } finally {
      setUploading(false);
    }

    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      companyId: "comp-1",
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

    setServices([newService, ...services]);
    setIsModalOpen(false);
    setNewName("");
    setNewDescription("");
    setImageFile(null);
    setImagePreview(null);
  };

  const toggleVisibility = (id: string) => {
    setServices(
      services.map((s) =>
        s.id === id
          ? { ...s, visibility: s.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC" }
          : s
      )
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fiches Services & Produits
          </h2>
          <p className="text-sm text-slate-600">
            Gérez vos offres référencées et personnalisez leur visuel d&apos;illustration visible par tous vos clients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une fiche service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="glass-card rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {service.logoUrl && (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-inner">
                  <Image
                    src={service.logoUrl}
                    alt={service.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold text-slate-900 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm">
                      {service.category || "Service"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                {!service.logoUrl && (
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {service.category || "Service"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleVisibility(service.id)}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ml-auto ${
                    service.visibility === "PUBLIC"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
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

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {service.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-3">
                {service.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="font-black text-slate-900">
                    {service._count?.subscriptions}
                  </div>
                  <div className="text-[10px] text-slate-400">Abonnés</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="font-black text-slate-900">
                    {service._count?.feedbacks}
                  </div>
                  <div className="text-[10px] text-slate-400">Feedbacks</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="font-black text-slate-900">
                    {service._count?.updateAnnouncements}
                  </div>
                  <div className="text-[10px] text-slate-400">Annonces</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Service with Image Upload to Bucket fidback-startup-img */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                Créer une nouvelle fiche service
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Cette fiche sera visible sur le catalogue Fidback pour recueillir les retours qualitatifs des clients togolais.
            </p>

            <form onSubmit={handleCreateService} className="space-y-4">
              {/* Image Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Image illustrative du service (Bannière visuelle)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-indigo-500 group">
                    <Image
                      src={imagePreview}
                      alt="Aperçu du service"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md"
                      >
                        Changer l&apos;image
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="p-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-indigo-50/40"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Téléverser une image d&apos;illustration
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      PNG, JPG ou WebP jusqu&apos;à 5MB
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nom du service ou produit
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Formule Buffet Dimanche, App V2, Livraisons Express..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catégorie
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="Technologie & App">Technologie & App</option>
                  <option value="Restauration & FoodTech">Restauration & FoodTech</option>
                  <option value="Transport & Logistique">Transport & Logistique</option>
                  <option value="Fintech & Paiement">Fintech & Paiement</option>
                  <option value="Santé & Bien-être">Santé & Bien-être</option>
                  <option value="Commerce & Retail">Commerce & Retail</option>
                  <option value="Autre Service">Autre Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Expliquez ce que propose ce service et sur quoi vous souhaitez recevoir des feedbacks qualitatifs..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

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
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public (Tout le Togo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVisibility("PRIVATE")}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      newVisibility === "PRIVATE"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Privé (Sur invitation)</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Téléversement...</span>
                    </>
                  ) : (
                    <span>Enregistrer la fiche service</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
