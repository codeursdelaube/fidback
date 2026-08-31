import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const companyId = searchParams.get("companyId");

    const whereClause: any = {};
    if (serviceId) {
      whereClause.subscription = { serviceId };
    } else if (companyId) {
      whereClause.subscription = { service: { companyId } };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        subscription: {
          include: {
            service: true,
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = feedbacks.map((f: any) => ({
      id: f.id,
      subscriptionId: f.subscriptionId,
      serviceId: f.subscription?.serviceId,
      serviceName: f.subscription?.service?.name || "Service",
      userPseudo: f.subscription?.user?.pseudo || "membre",
      content: f.content,
      moderationStatus: f.moderationStatus,
      constructiveScore: f.constructiveScore,
      createdAt: f.createdAt?.toISOString?.() || String(f.createdAt),
    }));

    return NextResponse.json({ success: true, feedbacks: formatted });
  } catch (error: any) {
    console.error("Error in GET /api/feedbacks:", error);
    return NextResponse.json({ error: error.message || "Erreur de chargement des feedbacks." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subscriptionId,
      serviceId,
      userId = "default-user",
      content,
      moderationStatus = "PENDING",
      constructiveScore,
    } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Le contenu du feedback qualitatif ne peut pas être vide." },
        { status: 400 }
      );
    }

    let subId = subscriptionId;

    // If subscriptionId is not provided, ensure subscription exists
    if (!subId && serviceId) {
      // Ensure user exists
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          pseudo: `user_${userId.slice(0, 8)}`,
          email: `user_${userId.slice(0, 8)}@fidback.tg`,
        },
      });

      const sub = await prisma.subscription.upsert({
        where: {
          userId_serviceId: { userId, serviceId },
        },
        update: {},
        create: {
          userId,
          serviceId,
        },
      });
      subId = sub.id;
    }

    if (!subId) {
      return NextResponse.json({ error: "Abonnement introuvable pour déposer un feedback." }, { status: 400 });
    }

    const created = await prisma.feedback.create({
      data: {
        subscriptionId: subId,
        content: content.trim(),
        moderationStatus,
        constructiveScore: constructiveScore || null,
      },
    });

    return NextResponse.json({
      success: true,
      feedback: {
        id: created.id,
        subscriptionId: created.subscriptionId,
        content: created.content,
        moderationStatus: created.moderationStatus,
        constructiveScore: created.constructiveScore,
        createdAt: created.createdAt?.toISOString?.() || String(created.createdAt),
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/feedbacks:", error);
    return NextResponse.json({ error: error.message || "Erreur de dépôt du feedback." }, { status: 500 });
  }
}
