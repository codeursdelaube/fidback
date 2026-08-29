import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    // In live postgres with prisma:
    // const services = await prisma.service.findMany({ where: { visibility: "PUBLIC" }, include: { company: true } });
    return NextResponse.json({
      services: [
        {
          id: "srv-1",
          name: "Course Moto & Taxi Lomé",
          description: "Service de transport urbain sécurisé et rapide pour tous vos trajets dans le Grand Lomé.",
          visibility: "PUBLIC",
          companyName: "Gozem Togo",
        },
        {
          id: "srv-2",
          name: "Livraison Gozem Food",
          description: "Commande et livraison express de repas depuis les meilleurs restaurants de Lomé.",
          visibility: "PUBLIC",
          companyName: "Gozem Togo",
        },
        {
          id: "srv-4",
          name: "Paiement & Transfert Mobile",
          description: "Application fintech unifiée pour recharger vos comptes T-Money et Flooz.",
          visibility: "PUBLIC",
          companyName: "AfrikPay Togo",
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, name, description, visibility } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Nom et description obligatoires." }, { status: 400 });
    }

    /*
    const service = await prisma.service.create({
      data: {
        companyId: companyId || "demo-company",
        name,
        description,
        visibility: visibility || "PUBLIC",
      },
    });
    */

    return NextResponse.json({
      success: true,
      service: {
        id: `srv-${Date.now()}`,
        name,
        description,
        visibility: visibility || "PUBLIC",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
