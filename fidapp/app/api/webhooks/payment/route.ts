import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { event, data } = payload;

    // Squelette de traitement de webhook (Stripe, T-Money, Flooz, Paygate Togo)
    // Exemple d'événement : 'payment.succeeded' ou 'checkout.session.completed'
    if (event === "payment.succeeded" || event === "checkout.session.completed") {
      const companyId = data?.companyId;
      const amount = data?.amount;
      const provider = data?.provider || "STRIPE";

      if (companyId) {
        // Enregistrer le paiement dans la base Prisma
        /*
        await prisma.payment.create({
          data: {
            companyId,
            amount: Number(amount),
            status: "PAID",
            provider,
          },
        });

        // Activer l'abonnement de l'entreprise
        await prisma.company.update({
          where: { id: companyId },
          data: { subscriptionStatus: "ACTIVE" },
        });
        */
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur de traitement webhook" },
      { status: 400 }
    );
  }
}
