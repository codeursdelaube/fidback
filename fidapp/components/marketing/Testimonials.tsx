import Image from "next/image";
import { Quote, CheckCircle2 } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      author: "Koffi Mensah",
      role: "Fondateur & CEO",
      company: "AfrikPay Togo",
      city: "Lomé, Nyékonakpoè",
      content:
        "Avant Fidback, nous recevions des notes 1 étoile sans explication sur les stores. Grâce aux retours textuels qualitatifs de nos abonnés Fidback, nous avons pu identifier précisément un bug sur l'intégration T-Money et multiplier notre rétention par 2.",
      image: "/img-entrepreneur.jpg",
    },
    {
      author: "Amina Lawson",
      role: "Cheffe & Directrice",
      company: "Le Palmier Gourmand (Restaurant)",
      city: "Lomé, Tokoin",
      content:
        "Les clients prennent le temps d'écrire des paragraphes constructifs sur l'accueil, les temps d'attente et les plats. Lorsque nous ajustons la carte, nous envoyons une annonce directe à nos 850 abonnés qui reviennent immédiatement.",
      image: "/Chef.jpg",
    },
    {
      author: "Jean-Paul Agbeko",
      role: "Utilisateur actif & Beta-testeur",
      company: "Membre communauté Lomé Tech",
      city: "Lomé, Bè",
      content:
        "J'adore le concept ! Je teste les services togolais au quotidien et je sais que mes remarques sont lues directement par les équipes produits sans être noyées dans du spam. On sent qu'on a un vrai impact.",
      initials: "JA",
      avatarBg: "bg-emerald-600",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60">
            <span>Témoignages & Retours d&apos;expérience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ils bâtissent des services d&apos;exception avec Fidback
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Découvrez comment des entrepreneurs et des utilisateurs togolais créent de la valeur ensemble.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-indigo-300 mb-4" />
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &quot;{t.content}&quot;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                {t.image ? (
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-white shrink-0">
                    <Image
                      src={t.image}
                      alt={t.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-12 h-12 rounded-2xl ${t.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0`}
                  >
                    {t.initials}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                    {t.author}
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="text-xs font-medium text-indigo-600">
                    {t.role} • {t.company}
                  </div>
                  <div className="text-[10px] text-slate-400">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
