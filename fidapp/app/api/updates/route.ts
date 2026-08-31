import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const companyId = searchParams.get("companyId");
    const userId = searchParams.get("userId");

    const whereClause: any = {};
    if (serviceId) {
      whereClause.serviceId = serviceId;
    } else if (companyId) {
      whereClause.service = { companyId };
    } else if (userId) {
      // Return only updates for services this user is subscribed to
      whereClause.service = {
        subscriptions: {
          some: { userId },
        },
      };
    }

    const announcements = await prisma.updateAnnouncement.findMany({
      where: whereClause,
      include: {
        service: {
          include: { company: true },
        },
      },
      orderBy: { sentAt: "desc" },
    });

    const formatted = announcements.map((a: any) => ({
      id: a.id,
      serviceId: a.serviceId,
      serviceName: a.service?.name || "Service",
      companyName: a.service?.company?.name || "Entreprise",
      title: a.title,
      message: a.message,
      sentAt: a.sentAt?.toISOString?.() || String(a.sentAt),
    }));

    return NextResponse.json({ success: true, updates: formatted });
  } catch (error: any) {
    console.error("Error in GET /api/updates:", error);
    return NextResponse.json({ error: error.message || "Erreur de chargement des annonces." }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      title,
      message,
    } = body;

    if (!title || !message || !serviceId) {
      return NextResponse.json(
        { error: "serviceId, titre et message de mise à jour requis." },
        { status: 400 }
      );
    }

    const created = await prisma.updateAnnouncement.create({
      data: {
        serviceId,
        title: title.trim(),
        message: message.trim(),
      },
      include: {
        service: {
          include: { company: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      update: {
        id: created.id,
        serviceId: created.serviceId,
        serviceName: created.service?.name || "Service",
        companyName: created.service?.company?.name || "Entreprise",
        title: created.title,
        message: created.message,
        sentAt: created.sentAt?.toISOString?.() || String(created.sentAt),
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/updates:", error);
    return NextResponse.json({ error: error.message || "Erreur de publication de l'annonce." }, { status: 500 });
  }
}
