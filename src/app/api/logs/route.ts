import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { astroLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const STARTER_LOGS = [
  {
    date: "2026-01-15",
    location: "Cherry Springs State Park, PA (Dark Sky Preserve)",
    bortleScale: 2,
    seeingScore: 90,
    targetName: "Orion Nebula & Pleiades Cluster",
    cameraSettings: "Sony A7IV, 24mm @ f/1.4, 15s, ISO 3200",
    notes: "Outstanding winter atmosphere with near-zero humidity. Orion was brilliant. Nebula details emerged clearly in raw sub-frames without trailing. Tracked 12 celestial exposures. Perfect evening!"
  },
  {
    date: "2026-02-12",
    location: "Death Valley National Park, CA (Bortle 1)",
    bortleScale: 1,
    seeingScore: 95,
    targetName: "Milky Way Arch & Zodiacal Light",
    cameraSettings: "Fuji X-T5, 16mm @ f/1.4, 20s, ISO 2000",
    notes: "Perfect transparency with zero high clouds. Seeing was sublime. Capturing the full winter arch was simple. Some airglow in the north but completely ignorable."
  }
];

export async function GET() {
  try {
    let list = await db.select().from(astroLogs);
    
    if (list.length === 0) {
      for (const log of STARTER_LOGS) {
        await db.insert(astroLogs).values(log);
      }
      list = await db.select().from(astroLogs);
    }
    
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error in GET /api/logs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, location, bortleScale, seeingScore, targetName, cameraSettings, notes } = body;

    if (!date || !location || !targetName || !cameraSettings) {
      return NextResponse.json({ error: "Missing essential logging fields" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(astroLogs)
      .values({
        date,
        location,
        bortleScale: parseInt(bortleScale) || 3,
        seeingScore: parseInt(seeingScore) || 75,
        targetName,
        cameraSettings,
        notes: notes || "",
      })
      .returning();

    return NextResponse.json({ message: "Observing log recorded successfully", data: inserted });
  } catch (error: any) {
    console.error("Error in POST /api/logs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
