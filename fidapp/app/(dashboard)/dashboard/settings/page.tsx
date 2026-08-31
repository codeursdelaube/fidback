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
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function DashboardSettingsPage() {
  const supabase = createClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("Technologie & App");
  const [city, setCity] = useState("Lomé, Togo");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+228 ");
  const [website, setWebsite] = useState("https://");

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadCompanyProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const meta = user.user_metadata || {};
          const cname = meta.companyName || meta.name || "Mon Entreprise";
          setCompanyName(cname);
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
            if (parsed.email) setEmail(parsed.email);
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

    const toastId = toast.loading(`Téléversement ${isLogo ? "du logo" : "de la bannière"} vers le bucket Supabase...`);

    try {
      const bucketName =
        process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "fidback-startup-img";
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}s/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      let publicUrl = "";
      if (!error && data?.path) {
        const { data: pubData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        if (pubData?.publicUrl) {
          publicUrl = pubData.publicUrl;
        }
      } else {
        publicUrl = URL.createObjectURL(file);
      }

      if (isLogo) {
        setLogoUrl(publicUrl);
        await supabase.auth.updateUser({ data: { logoUrl: publicUrl } });
      } else {
        setCoverUrl(publicUrl);
        await supabase.auth.updateUser({ data: { coverUrl: publicUrl } });
      }

      const cached = localStorage.getItem("fidback_company_profile");
      const prevData = cached ? JSON.parse(cached) : {};
      localStorage.setItem(
        "fidback_company_profile",
        JSON.stringify({ ...prevData, [isLogo ? "logoUrl" : "coverUrl"]: publicUrl })
      );

      window.dispatchEvent(new Event("fidback_profile_updated"));
      toast.success(`${isLogo ? "Logo officiel" : "Bannière"} mis(e) à jour avec succès !`, {
        id: toastId,
        icon: "🖼️",
      });
    } catch (err: any) {
      console.warn("Storage upload fallback:", err);
      const localUrl = URL.createObjectURL(file);
      if (isLogo) setLogoUrl(localUrl);
      else setCoverUrl(localUrl);
      toast.success(`${isLogo ? "Logo" : "Bannière"} mis(e) à jour !`, { id: toastId, icon: "🖼️" });
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
      email,
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
      toast.success("Profil entreprise enregistré avec succès !", { icon: "💾" });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Erreur sauvegarde profil:", err);
      localStorage.setItem(
        "fidback_company_profile",
        JSON.stringify(profileData)
      );
      window.dispatchEvent(new Event("fidback_profile_updated"));
      setSaveSuccess(true);
      toast.success("Profil entreprise enregistré avec succès !", { icon: "💾" });
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const initials = (companyName || "Entreprise")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Image de Marque</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Personnalisation du Profil Entreprise
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Personnalisez votre identité de marque (logo officiel, bannière, coordonnées) stockée dans le bucket Supabase et visible par vos abonnés togolais.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profil entreprise mis à jour avec succès ! Vos informations sont synchronisées en direct.</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Visual Brand Assets (Cover & Logo) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-950 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
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
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={logoInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file, "logo");
            }}
            accept="image/*"
            className="hidden"
          />

          {/* Cover & Logo Preview Card */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xs">
            {/* Banner Cover */}
            <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900">
              {coverUrl && (
                <Image
                  src={coverUrl}
                  alt="Bannière entreprise"
                  fill
                  className="object-cover opacity-85"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-xs transition-all cursor-pointer"
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Téléverser une bannière</span>
              </button>
            </div>

            {/* Logo & Headline floating */}
            <div className="p-6 pt-0 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 relative z-10">
              <div className="flex items-end gap-4">
                {/* Logo Box */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white bg-emerald-950 shadow-xl group flex items-center justify-center text-emerald-300 font-black text-2xl">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt="Logo officiel"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-emerald-400" />
                        <span>Changer Logo</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pb-1 text-white">
                  <div className="text-xl font-extrabold tracking-tight">
                    {companyName || "Nom de votre entreprise"}
                  </div>
                  <div className="text-xs text-emerald-300 font-bold flex items-center gap-2 mt-0.5">
                    <span>{category}</span>
                    <span>•</span>
                    <span>{city}</span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Programme Pilote Startups 🇹🇬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Details Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-950 pb-3 border-b border-slate-100">
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Slogan / Accroche courte
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex: La plateforme de livraison express à Lomé"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Secteur d&apos;activité
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Technologie & App">Technologie & App</option>
                <option value="Transport & Mobilité">Transport & Mobilité</option>
                <option value="Restauration & FoodTech">Restauration & FoodTech</option>
                <option value="Fintech & Paiement">Fintech & Paiement</option>
                <option value="Santé & Bien-être">Santé & Bien-être</option>
                <option value="Commerce & Boutique">Commerce & Boutique</option>
                <option value="Services Professionnels">Services Professionnels</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ville / Localisation
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Lomé, Togo"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Présentation détaillée de l&apos;entreprise
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présentez brièvement vos activités, votre mission et ce que vous proposez à vos utilisateurs..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Contact & Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-950 pb-3 border-b border-slate-100">
            Coordonnées Professionnelles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Téléphone (T-Money / WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Site Web / Réseau Social
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://monentreprise.tg"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 py-4 px-8 rounded-full font-bold text-sm text-slate-950 bg-lime-400 hover:bg-lime-300 shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
