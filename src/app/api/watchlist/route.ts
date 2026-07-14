import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { astroWatchlist } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all watchlist items
export async function GET() {
  try {
    const list = await db.select().from(astroWatchlist);
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error in GET /api/watchlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST to add an item to the watchlist, or toggle it
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, eventName, eventDate, visibilityRating, notes, targetCoordinates, reminderEnabled } = body;

    if (!eventId || !eventName || !eventDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if already exists to avoid duplicates
    const existing = await db
      .select()
      .from(astroWatchlist)
      .where(eq(astroWatchlist.eventId, eventId));

    if (existing.length > 0) {
      // Return existing
      return NextResponse.json({ message: "Event already watched", data: existing[0], exists: true });
    }

    // Insert new item
    const [inserted] = await db
      .insert(astroWatchlist)
      .values({
        eventId,
        eventName,
        eventDate,
        visibilityRating: visibilityRating || "Good",
        notes: notes || "",
        targetCoordinates: targetCoordinates || "",
        reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : true,
      })
      .returning();

    return NextResponse.json({ message: "Event added to watchlist", data: inserted });
  } catch (error: any) {
    console.error("Error in POST /api/watchlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE to remove from watchlist
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    const eventIdStr = searchParams.get("eventId");

    if (idStr) {
      await db.delete(astroWatchlist).where(eq(astroWatchlist.id, parseInt(idStr)));
      return NextResponse.json({ message: "Successfully deleted by ID" });
    } else if (eventIdStr) {
      await db.delete(astroWatchlist).where(eq(astroWatchlist.eventId, eventIdStr));
      return NextResponse.json({ message: "Successfully deleted by eventId" });
    }

    return NextResponse.json({ error: "Either id or eventId must be provided" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in DELETE /api/watchlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
