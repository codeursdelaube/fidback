import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content, serviceName, companyName } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Le contenu du feedback est requis." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY
    process.env.NEXT_PUBLIC_GEMINI_API_KEY

    const prompt = `Tu es l'Arbitre et Modérateur IA Officiel de la plateforme togolaise "Fidback" (fidback.tg).
Sur Fidback, il n'y a PAS de système d'étoiles : uniquement des retours d'expérience textuels constructifs, factuels et qualitatifs pour aider les entreprises et startups togolaises à perfectionner leurs produits.

Voici le feedback rédigé par un utilisateur :
- Service concerné : ${serviceName || "Service"} (${companyName || "Entreprise"})
- Texte du feedback : "${content.trim()}"

Règles strictes d'arbitrage :
1. REJET OBLIGATOIRE si :
   - Le message contient des insultes, vulgarités ou attaques haineuses (injurieux).
   - Le message vise à rabaisser, ridiculiser ou insulter personnellement un employé/chauffeur/cuisinier/fondateur (humiliant).
   - Le message fait du dénigrement comparatif déloyal ou de la publicité agressive pour un concurrent sans retour factuel sur le service (comparatif / diffamatoire).
   - Le message est du spam vide, méchant ou sans aucun fondement constructif (ex: "nul nul à chier").

2. APPROBATION si :
   - Le message exprime un problème réel de façon respectueuse (ex: délai de livraison, bug d'OTP, lenteur, accueil).
   - Le message propose des suggestions d'amélioration ou met en valeur ce qui fonctionne bien.
   - Les critiques sont acceptées et bienvenues tant qu'elles restent polies, argumentées et non injurieuses.

Réponds UNIQUEMENT au format JSON valide strict suivant :
{
  "status": "APPROVED" | "REJECTED",
  "reason": "Explication claire, bienveillante et professionnelle en français à l'utilisateur",
  "category": "INJURIOUS" | "HUMILIATING" | "UNFAIR_COMPARISON" | "SPAM" | "CONSTRUCTIVE_FEEDBACK",
  "constructiveScore": 85,
  "highlight": "Court résumé du retour (1 phrase)",
  "suggestion": "Conseil de reformulation constructive si rejeté (ou vide si approuvé)"
}`;

    // Call Gemini REST API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      // Fallback local heuristic moderation if API is unreachable
      const lower = content.toLowerCase();
      const isBad =
        lower.includes("connard") ||
        lower.includes("merde") ||
        lower.includes("idiot") ||
        lower.includes("escroc") ||
        lower.includes("voleur") ||
        lower.includes("nul nul") ||
        lower.includes("degage");

      if (isBad) {
        return NextResponse.json({
          status: "REJECTED",
          category: "INJURIOUS",
          reason:
            "Votre feedback contient des termes injurieux ou non constructifs. Sur Fidback, nous privilégions les retours argumentés et respectueux.",
          constructiveScore: 15,
          highlight: "Langage inapproprié détecté.",
          suggestion:
            "Expliquez calmement le dysfonctionnement précis rencontré pour permettre à l'équipe d'intervenir.",
        });
      }

      return NextResponse.json({
        status: "APPROVED",
        category: "CONSTRUCTIVE_FEEDBACK",
        reason:
          "Feedback constructif respectant la charte qualitative de Fidback.",
        constructiveScore: 85,
        highlight: "Retour factuel et pertinent.",
        suggestion: "",
      });
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Réponse vide de l'arbitre IA.");
    }

    const parsedResult = JSON.parse(rawText);
    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("Erreur d'arbitrage Gemini:", error);

    // Graceful fallback
    return NextResponse.json({
      status: "APPROVED",
      category: "CONSTRUCTIVE_FEEDBACK",
      reason: "Feedback conforme à la charte Fidback.",
      constructiveScore: 80,
      highlight: "Retour qualitatif.",
      suggestion: "",
    });
  }
}
