tu travaille dans le dossier fidback  Projet "Fidback"

## Contexte
Tu vas construire la base d'une application web appelée **Fidback**, une plateforme togolaise de feedbacks produits (pas de notation par étoiles, uniquement du texte qualitatif). Les entreprises togolaises (apps, restaurants, services) paient pour entrer dans le programme de feedback : elles s'inscrivent, publient des fiches services, et reçoivent des feedbacks de leurs abonnés. Construis-la comme un vrai site d'entreprise (pas un MVP bâclé) : landing page premium, onboarding soigné, dashboard propre, checkout d'inscription payant.

## Inspiration UI/UX
Une image de référence est fournie (landing page style "Grow your business with smart digital solutions"). Inspire-toi de :
- La direction artistique : fond clair, accents violet/indigo, éléments 3D flottants (glassmorphism, cartes translucides)
- La structure : hero avec headline + CTA + visuel 3D, bandeau de stats/preuve sociale, sections features avec cartes, section pricing en 3 colonnes
- Garde le même niveau de finition (ombres douces, arrondis généreux, hiérarchie typographique claire) mais adapte le contenu au produit Fidback (feedback, abonnement, mise à jour), pas au template d'origine
- **Le site doit être professionnel avec de vraies images** (photos, illustrations cohérentes avec la marque) — pas de placeholders génériques type Lorem Picsum. **Si tu as besoin d'images précises (photos d'équipe, visuels de marque, etc.), demande-les-moi avant de continuer plutôt que d'improviser.**

## Contraintes techniques STRICTES (2026)
- **Next.js 16, App Router**. Il n'existe PAS de `middleware.ts` en Next.js 16 → utilise **`proxy.ts`** à la racine pour tout ce qui remplace l'ancien middleware (auth guard, redirections, headers)
- **Tailwind CSS v4** (config via CSS `@theme`, pas de `tailwind.config.js` classique sauf si strictement nécessaire)
- **DaisyUI** (dernière version compatible Tailwind v4) pour les composants de base
- **Lucide React** pour toutes les icônes
- **Motion** (le package s'appelle désormais `motion`, plus `framer-motion`) pour les animations — imports du type `import { motion } from "motion/react"`
- **Prisma** — utilise le client et la syntaxe les plus récents (vérifie les dernières nouveautés de génération de client, notamment le générateur ESM/edge-compatible si pertinent)
- **Supabase** — Auth + Postgres, utilise les derniers helpers/SDK Supabase pour Next.js App Router (SSR package le plus récent, pas l'ancien `@supabase/auth-helpers-nextjs` deprecated)
- Code en **TypeScript strict**, structure de dossiers propre et scalable

## Modèle de données (Prisma schema à générer)

User → id, pseudo (unique, global), email, createdAt
Company → id, name, email, subscriptionStatus (ACTIVE | INACTIVE | TRIAL), createdAt
Service → id, companyId, name, description, visibility (PUBLIC | PRIVATE), createdAt
Subscription→ id, userId, serviceId, createdAt
Feedback → id, subscriptionId, content, moderationStatus (PENDING | APPROVED | REJECTED), createdAt
UpdateAnnouncement → id, serviceId, title, message, sentAt
Payment → id, companyId, amount, status (PENDING | PAID | FAILED), provider, createdAt


## Ce que tu dois livrer dans cette base
1. **Landing page publique** (`/`) inspirée du visuel fourni : hero, stats, features (comment ça marche : s'abonner → feedbacker → recevoir les MAJ), section entreprises + pricing, footer
2. **Auth Supabase** : inscription/connexion utilisateur ET entreprise (deux rôles distincts)
3. **`proxy.ts`** : protège les routes `/dashboard/*` (entreprise) et `/app/*` (utilisateur connecté), redirige si non authentifié ; bloque l'accès au dashboard entreprise si `subscriptionStatus !== ACTIVE`
4. **Flow de paiement entreprise** : page de checkout/pricing pour rejoindre le programme de feedback, structure prête pour brancher un provider de paiement (Stripe ou équivalent) — squelette des routes/webhooks, sans clé API réelle pour l'instant
5. **Schéma Prisma complet** conforme au modèle ci-dessus (avec `Payment`), migrations prêtes
6. **Structure de dossiers** claire : `app/(marketing)`, `app/(auth)`, `app/(checkout)`, `app/(dashboard)`, `app/(user)`, `lib/supabase`, `lib/prisma`, `components/ui`, `components/marketing`
7. **Layout dashboard entreprise** (squelette) : liste des services, liste des feedbacks reçus, bouton "publier une mise à jour", statut d'abonnement/paiement visible
8. Pas de logique de modération IA pour l'instant — juste le champ `moderationStatus` dans le schéma, prêt à être branché plus tard

## Ne fais PAS
- N'intègre pas de vraies clés API de paiement (juste la structure/les routes)
- Ne génère pas encore le système d'email transactionnel (juste prévoir le hook côté `UpdateAnnouncement`)
- Ne surcharge pas de librairies non listées ci-dessus