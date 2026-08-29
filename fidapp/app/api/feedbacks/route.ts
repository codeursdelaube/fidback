import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscriptionId, content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Le contenu du feedback qualitatif ne peut pas être vide." },
        { status: 400 }
      );
    }

    /*
    const feedback = await prisma.feedback.create({
      data: {
        subscriptionId: subscriptionId || "demo-sub",
        content: content.trim(),
        moderationStatus: "PENDING",
      },
    });
    */

    return NextResponse.json({
      success: true,
      feedback: {
        id: `fb-${Date.now()}`,
        content: content.trim(),
        moderationStatus: "APPROVED",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
