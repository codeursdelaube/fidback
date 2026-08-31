import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const serviceId = searchParams.get("serviceId");

    const whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (serviceId) whereClause.serviceId = serviceId;

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        service: {
          include: { company: true },
        },
      },
    });
    return NextResponse.json({ success: true, subscriptions });
  } catch (error: any) {
    console.error("Error in GET /api/subscriptions:", error);
    return NextResponse.json({ error: error.message || "Erreur de chargement des abonnements." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceId } = body;

    if (!userId || !serviceId) {
      return NextResponse.json(
        { error: "userId et serviceId requis." },
        { status: 400 }
      );
    }

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

    const subscription = await prisma.subscription.upsert({
      where: {
        userId_serviceId: { userId, serviceId },
      },
      update: {},
      create: {
        userId,
        serviceId,
      },
    });
    return NextResponse.json({ success: true, subscription });
  } catch (error: any) {
    console.error("Error in POST /api/subscriptions:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'abonnement." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const serviceId = searchParams.get("serviceId");

    if (!userId || !serviceId) {
      return NextResponse.json({ error: "userId et serviceId requis." }, { status: 400 });
    }

    await prisma.subscription.delete({
      where: {
        userId_serviceId: { userId, serviceId },
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/subscriptions:", error);
    return NextResponse.json({ error: error.message || "Erreur lors du désabonnement." }, { status: 500 });
  }
}
