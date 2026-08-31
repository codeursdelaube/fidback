import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";

/**
 * POST /api/updates/dismiss
 * Body: { companyId: string, announcementId: string }
 * Marks an announcement as dismissed for a given company (not deleted globally).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, announcementId } = body;

    if (!companyId || !announcementId) {
      return NextResponse.json(
        { error: "companyId et announcementId requis." },
        { status: 400 }
      );
    }

    const dismissal = await prisma.notificationDismissal.upsert({
      where: {
        companyId_announcementId: { companyId, announcementId },
      },
      update: {},
      create: {
        companyId,
        announcementId,
      },
    });

    return NextResponse.json({ success: true, dismissal });
  } catch (error: any) {
    console.error("Error in POST /api/updates/dismiss:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors du dismiss." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/updates/dismiss?companyId=...&announcementId=...
 * Un-dismisses an announcement (restore it to the dashboard view).
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const announcementId = searchParams.get("announcementId");

    if (!companyId || !announcementId) {
      return NextResponse.json(
        { error: "companyId et announcementId requis." },
        { status: 400 }
      );
    }

    await prisma.notificationDismissal.deleteMany({
      where: { companyId, announcementId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/updates/dismiss:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors du rétablissement." },
      { status: 500 }
    );
  }
}
