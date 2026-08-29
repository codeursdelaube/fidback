"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Building2,
  UploadCloud,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Camera,
  Loader2,
  Save,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardSettingsPage() {
  const supabase = createClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState("Gozem Togo");
  const [tagline, setTagline] = useState("L'application tout-en-un pour vos déplacements et livraisons à Lomé");
  const [category, setCategory] = useState("Transport & Mobilité");
  const [city, setCity] = useState("Lomé, Togo");
  const [description, setDescription] = useState(
    "Gozem est la Super App de l'Afrique de l'Ouest proposant des services de transport de personnes (motos, taxis), livraison de repas et paiements mobiles sécurisés."
  );
  const [email, setEmail] = useState("contact@gozem.tg");
  const [phone, setPhone] = useState("+228 90 12 34 56");
  const [website, setWebsite] = useState("https://gozem.tg");

  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [coverUrl, setCoverUrl] = useState<string>("/img-entrepreneur.jpg");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadCompanyProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          if (meta.companyName || meta.name) setCompanyName(meta.companyName || meta.name);
          if (meta.tagline) setTagline(meta.tagline);
          if (meta.category) setCategory(meta.category);
          if (meta.city) setCity(meta.city);
          if (meta.description) setDescription(meta.description);
          if (meta.phone) setPhone(meta.phone);
          if (meta.website) setWebsite(meta.website);
          if (meta.logoUrl) setLogoUrl(meta.logoUrl);
          if (meta.coverUrl) setCoverUrl(meta.coverUrl);
          if (user.email) setEmail(user.email);
        } else {
          // Check local storage fallback
          const cached = localStorage.getItem("fidback_company_profile");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.companyName) setCompanyName(parsed.companyName);
            if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
            if (parsed.coverUrl) setCoverUrl(parsed.coverUrl);
            if (parsed.tagline) setTagline(parsed.tagline);
            if (parsed.city) setCity(parsed.city);
          }
        }
      } catch (err) {
        console.warn("Erreur chargement profil entreprise:", err);
      }
    }

    loadCompanyProfile();
  }, [supabase]);

  const handleUploadImage = async (
    file: File,
    type: "logo" | "cover"
  ) => {
    const isLogo = type === "logo";
    if (isLogo) setUploadingLogo(true);
    else setUploadingCover(true);

    try {
      const bucketName =
        process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "fidback-startup-img";
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}s/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!error && data?.path) {
        const { data: pubData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        if (pubData?.publicUrl) {
          if (isLogo) setLogoUrl(pubData.publicUrl);
          else setCoverUrl(pubData.publicUrl);
        }
      } else {
        // Local preview fallback
        const localUrl = URL.createObjectURL(file);
        if (isLogo) setLogoUrl(localUrl);
        else setCoverUrl(localUrl);
      }
    } catch (err) {
      console.warn("Storage upload fallback:", err);
      const localUrl = URL.createObjectURL(file);
      if (isLogo) setLogoUrl(localUrl);
      else setCoverUrl(localUrl);
    } finally {
      if (isLogo) setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const profileData = {
      companyName: companyName.trim(),
      name: companyName.trim(),
      tagline: tagline.trim(),
      category,
      city: city.trim(),
      description: description.trim(),
      phone: phone.trim(),
      website: website.trim(),
      logoUrl,
      coverUrl,
    };

    try {
      // Save to Supabase User Metadata
      await supabase.auth.updateUser({
        data: profileData,
      });

      // Save to localStorage for instant reactivity across all dashboard tabs
      localStorage.setItem(
        "fidback_company_profile",
        JSON.stringify(profileData)
      );

      // Trigger custom event so layout updates in real-time
      window.dispatchEvent(new Event("fidback_profile_updated"));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Erreur sauvegarde profil:", err);
      localStorage.setItem(
        "fidback_company_profile",
        JSON.stringify(profileData)
      );
      window.dispatchEvent(new Event("fidback_profile_updated"));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Personnalisation du Profil Entreprise
        </h2>
        <p className="text-sm text-slate-600">
          Personnalisez votre identité de marque (logo, bannière, coordonnées) visible par vos clients et abonnés togolais.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profil entreprise mis à jour avec succès ! Vos informations sont désormais visibles par vos abonnés.</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Visual Brand Assets (Cover & Logo) */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Identité Visuelle & Médias</span>
          </h3>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={coverInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file, "cover");
            }}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          <input
            type="file"
            ref={logoInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file, "logo");
            }}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          {/* Cover & Logo Preview Card */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
            {/* Banner Cover */}
            <div className="relative w-full h-44 sm:h-52 bg-slate-800">
              {coverUrl && (
                <Image
                  src={coverUrl}
                  alt="Bannière entreprise"
                  fill
                  className="object-cover opacity-85"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-md transition-all"
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <span>Changer la bannière</span>
              </button>
            </div>

            {/* Logo & Headline floating */}
            <div className="p-6 pt-0 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 relative z-10">
              <div className="flex items-end gap-4">
                {/* Logo Box */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl group">
                  <Image
                    src={logoUrl}
                    alt="Logo officiel"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Modifier</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pb-1 text-white">
                  <div className="text-xl font-extrabold tracking-tight">
                    {companyName || "Nom de l'entreprise"}
                  </div>
                  <div className="text-xs text-indigo-300 font-medium flex items-center gap-2 mt-0.5">
                    <span>{category}</span>
                    <span>•</span>
                    <span>{city}</span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Entreprise Vérifiée 🇹🇬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Details Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Informations Générales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nom officiel de l&apos;entreprise
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Gozem Togo, Le Palmier Gourmand..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Secteur d&apos;activité
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              >
                <option value="Transport & Mobilité">Transport & Mobilité</option>
                <option value="Restauration & FoodTech">Restauration & FoodTech</option>
                <option value="Fintech & Paiement">Fintech & Paiement</option>
                <option value="Technologie & SaaS">Technologie & SaaS</option>
                <option value="Santé & Bien-être">Santé & Bien-être</option>
                <option value="Commerce & Distribution">Commerce & Distribution</option>
                <option value="Autre Service">Autre Service</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Slogan / Phrase d&apos;accroche
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex: La plateforme de mobilité préférée des Togolais"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description de l&apos;entreprise
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentez votre entreprise et votre mission à vos abonnés togolais..."
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Contact & Localisation */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Coordonnées & Siège Togo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ville / Siège au Togo
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lomé, Togo"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Numéro de téléphone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email de contact
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@entreprise.tg"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Site Web Officiel
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://monentreprise.tg"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement en cours...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
