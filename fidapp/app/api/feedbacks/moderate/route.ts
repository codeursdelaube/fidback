import { NextResponse, type NextRequest } from "next/server";

/** ── Types ── */
interface ModerationResponse {
  status: "APPROVED" | "REJECTED";
  reason: string;
  category: "INJURIOUS" | "HUMILIATING" | "UNFAIR_COMPARISON" | "SPAM" | "CONSTRUCTIVE_FEEDBACK" | "FEATURE_REQUEST";
  sentiment: "POSITIVE" | "NEUTRAL" | "CONSTRUCTIVE_CRITIQUE" | "NEGATIVE_UNHELPFUL";
  constructiveScore: number;
  highlight: string;
  suggestion: string;
  tags: string[];
}

/** ── Shared prompt ── */
function buildPrompt(content: string, serviceName: string, companyName: string) {
  return `Tu es l'Arbitre et Modérateur IA Officiel de la plateforme SaaS togolaise "Fidback" (fidback.tg).
Sur Fidback, il n'y a PAS de système d'étoiles : uniquement des retours d'expérience textuels constructifs, factuels et qualitatifs pour aider les entreprises et startups togolaises à perfectionner leurs produits.

Voici le feedback rédigé par un utilisateur :
- Service concerné : ${serviceName} (${companyName})
- Texte du feedback : "${content.trim()}"

Règles strictes d'arbitrage :
1. REJET OBLIGATOIRE si :
   - Le message contient des insultes, vulgarités, menaces ou attaques haineuses.
   - Le message vise à rabaisser, ridiculiser ou insulter personnellement un employé ou fondateur.
   - Le message est du spam vide, méchant ou sans aucun fondement constructif.
   - Le texte est trop court (moins de 10 caractères significatifs) et ne dit rien d'exploitable.

2. APPROBATION si :
   - Le message exprime un problème réel de façon respectueuse.
   - Le message propose des suggestions d'amélioration ou met en valeur ce qui fonctionne bien.
   - Les critiques sont acceptées tant qu'elles restent polies, argumentées et non injurieuses.

Réponds UNIQUEMENT au format JSON valide strict (pas de markdown, pas de backticks) :
{
  "status": "APPROVED",
  "reason": "Explication claire et bienveillante en français",
  "category": "CONSTRUCTIVE_FEEDBACK",
  "sentiment": "CONSTRUCTIVE_CRITIQUE",
  "constructiveScore": 85,
  "highlight": "Court résumé du retour en 1 phrase percutante",
  "suggestion": "",
  "tags": ["Performance"]
}`;
}

/** ── Heuristic fallback (no API key) ── */
function heuristicModerate(content: string): ModerationResponse {
  const text = content.trim();
  const lower = text.toLowerCase();

  // ── 1. Explicit toxic words (Togo / French context) ──
  const toxicPatterns = [
    "connard", "salaud", "imbécile", "idiot", "merde", "putain",
    "escroc", "voleur", "voleurs", "arnaqueur", "arnaque",
    "dégagez", "dégage", "nul à chier", "bande d'incapables",
    "vendeur de sable", "menteur", "menteurs", "fumier", "fils de",
    "ta mère", "saligaud", "va te", "fdp", "trou du cul",
  ];
  if (toxicPatterns.some((w) => lower.includes(w))) {
    return {
      status: "REJECTED",
      category: "INJURIOUS",
      sentiment: "NEGATIVE_UNHELPFUL",
      reason: "Votre message contient des termes inappropriés ou injurieux. Sur Fidback, seuls les retours d'expérience respectueux et argumentés sont acceptés.",
      constructiveScore: 8,
      highlight: "Langage inapproprié détecté par l'arbitre IA.",
      suggestion: "Décrivez factuellement le problème rencontré (ex: délai, bug, service) pour permettre à l'entreprise d'agir.",
      tags: ["Inapproprié"],
    };
  }

  // ── 2. Too short / empty ──
  if (text.length < 12) {
    return {
      status: "REJECTED",
      category: "SPAM",
      sentiment: "NEGATIVE_UNHELPFUL",
      reason: "Votre feedback est trop court pour être exploitable par l'équipe. Merci de détailler votre expérience.",
      constructiveScore: 20,
      highlight: "Retour trop court sans explication.",
      suggestion: "Précisez ce qui a posé problème (ex: délai de livraison, navigation, paiement T-Money/Flooz).",
      tags: ["Incomplet"],
    };
  }

  // ── 3. All caps frustration without substance ──
  const uppercaseRatio = (text.replace(/[^A-ZÀ-Ÿ]/g, "").length) / text.replace(/\s/g, "").length;
  const aggressiveShort = text.length < 40 && uppercaseRatio > 0.7;
  if (aggressiveShort && (lower.includes("nul") || lower.includes("mauvais") || lower.includes("honte") || lower.includes("catastrophe"))) {
    return {
      status: "REJECTED",
      category: "SPAM",
      sentiment: "NEGATIVE_UNHELPFUL",
      reason: "Ce retour exprime une frustration sans détail exploitable. L'équipe ne peut pas agir sans contexte précis.",
      constructiveScore: 22,
      highlight: "Retour non constructif détecté.",
      suggestion: "Décrivez la situation précisément : quand, quoi, quel problème ?",
      tags: ["Incomplet"],
    };
  }

  // ── 4. Semantic topic detection ──
  const isPayment = /t-money|flooz|paiement|otp|carte|virement|recharge|orange money/i.test(lower);
  const isPerformance = /lent|rapide|bug|vitesse|temps|délai|retard|plante|crash|lag|chargement/i.test(lower);
  const isService = /accueil|chauffeur|livreur|plat|repas|colis|commande|qualité/i.test(lower);
  const isUX = /interface|application|app|bouton|design|écran|navigation|diffici/i.test(lower);
  const isSuggestion = /pourrait|serait|souhait|idée|suggestion|proposer|améliorer|ajouter|manque/i.test(lower);
  const isCritique = /problème|tarde|retard|erreur|manque|difficile|dommage|frustrant|déçu/i.test(lower);
  const isPositif = /bien|excellent|parfait|rapide|satisfait|bravo|super|génial|top|merci|bonne/i.test(lower);

  const tags: string[] = [];
  if (isPayment) tags.push("Paiement");
  if (isPerformance) tags.push("Performance");
  if (isService) tags.push("Service Client");
  if (isUX) tags.push("UX / Interface");
  if (isSuggestion) tags.push("Suggestion");
  if (tags.length === 0) tags.push("Expérience Générale");

  // ── 5. Score calculation ──
  let score = 55;
  if (text.length > 60) score += 10;
  if (text.length > 120) score += 8;
  if (isPayment || isPerformance) score += 6;
  if (isSuggestion) score += 8;
  if (isPositif && !isCritique) score += 5;
  if (isCritique && isSuggestion) score += 7;
  score = Math.min(97, Math.max(72, score));

  const category = isSuggestion ? "FEATURE_REQUEST" : "CONSTRUCTIVE_FEEDBACK";
  const sentiment = isPositif && !isCritique ? "POSITIVE" : isCritique ? "CONSTRUCTIVE_CRITIQUE" : "NEUTRAL";

  const highlight = text.length > 80 ? text.substring(0, 77) + "…" : text;

  return {
    status: "APPROVED",
    category,
    sentiment,
    reason: "Feedback conforme à la charte qualitative Fidback — retour clair, respectueux et exploitable.",
    constructiveScore: score,
    highlight,
    suggestion: "",
    tags,
  };
}

/** ── Main route ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, serviceName = "Service", companyName = "Entreprise" } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Le contenu du feedback est requis." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || "";

    // ── Try Gemini SDK if API key exists and looks valid ──
    if (apiKey && apiKey.startsWith("AIzaSy")) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });

        const prompt = buildPrompt(content, serviceName, companyName);
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();

        // Strip markdown fences if present
        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed: ModerationResponse = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (sdkErr) {
        console.warn("[Fidback] Gemini SDK error, falling back to heuristic:", sdkErr);
      }
    } else if (apiKey && !apiKey.startsWith("AIzaSy")) {
      // Invalid key format — warn in logs
      console.warn(
        "[Fidback] GEMINI_API_KEY has wrong format (should start with AIzaSy). Using heuristic fallback."
      );
    }

    // ── Fallback: robust heuristic ──
    const heuristic = heuristicModerate(content);
    return NextResponse.json(heuristic);
  } catch (error: any) {
    console.error("[Fidback] Erreur générale modération IA:", error);
    return NextResponse.json({
      status: "APPROVED",
      category: "CONSTRUCTIVE_FEEDBACK",
      sentiment: "NEUTRAL",
      reason: "Feedback enregistré et transmis à l'équipe.",
      constructiveScore: 80,
      highlight: "Retour qualitatif enregistré.",
      suggestion: "",
      tags: ["Expérience"],
    });
  }
}
