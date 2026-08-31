import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    const whereClause: any = companyId
      ? { companyId }
      : { visibility: "PUBLIC" };

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        company: true,
        _count: {
          select: {
            subscriptions: true,
            announcements: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = services.map((s: any) => ({
      id: s.id,
      companyId: s.companyId,
      companyName: s.company?.name || "Entreprise",
      companyLogoUrl: s.company?.logoUrl || null,
      name: s.name,
      description: s.description,
      logoUrl: s.logoUrl || null,
      visibility: s.visibility,
      createdAt: s.createdAt?.toISOString?.() || String(s.createdAt),
      _count: {
        subscriptions: s._count?.subscriptions || 0,
        feedbacks: 0,
        updateAnnouncements: s._count?.announcements || 0,
      },
    }));

    return NextResponse.json({ success: true, services: formatted });
  } catch (error: any) {
    console.error("Error in GET /api/services:", error);
    return NextResponse.json({ error: error.message || "Erreur de chargement des services." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      companyName = "Mon Entreprise",
      name,
      description,
      visibility = "PUBLIC",
      logoUrl = null,
    } = body;

    if (!name || !description || !companyId) {
      return NextResponse.json(
        { error: "companyId, nom et description obligatoires." },
        { status: 400 }
      );
    }

    // Reject blob: URLs — they are ephemeral, never persist them to DB
    const finalLogoUrl =
      logoUrl && !logoUrl.startsWith("blob:") ? logoUrl : null;

    // Ensure company exists in database
    await prisma.company.upsert({
      where: { id: companyId },
      update: {},
      create: {
        id: companyId,
        name: companyName,
        email: `company_${companyId.slice(0, 8)}@fidback.tg`,
        subscriptionStatus: "ACTIVE",
      },
    });

    const service = await prisma.service.create({
      data: {
        companyId,
        name: name.trim(),
        description: description.trim(),
        visibility,
        logoUrl: finalLogoUrl,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json({
      success: true,
      service: {
        ...service,
        companyName: service.company?.name || companyName,
        logoUrl: service.logoUrl || null,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/services:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la création du service." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, logoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "ID du service requis." }, { status: 400 });
    }

    const finalLogoUrl =
      logoUrl && !logoUrl.startsWith("blob:") ? logoUrl : null;

    const service = await prisma.service.update({
      where: { id },
      data: { logoUrl: finalLogoUrl },
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error("Error in PATCH /api/services:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la mise à jour." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID du service requis." }, { status: 400 });
    }

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/services:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la suppression." }, { status: 500 });
  }
}
