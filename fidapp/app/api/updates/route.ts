import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, title, message } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Titre et message de mise à jour requis." },
        { status: 400 }
      );
    }

    /*
    const update = await prisma.updateAnnouncement.create({
      data: {
        serviceId: serviceId || "demo-service",
        title: title.trim(),
        message: message.trim(),
      },
    });

    // Note: Transactional email / push notifications hook can be dispatched here
    */

    return NextResponse.json({
      success: true,
      update: {
        id: `upd-${Date.now()}`,
        title: title.trim(),
        message: message.trim(),
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
