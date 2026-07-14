import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { astroGear } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Starter presets for astrophotography gear
const STARTER_PRESETS = [
  {
    name: "Sony A7IV + 24mm f/1.4 GM",
    sensorSize: "Full Frame",
    focalLength: 24,
    maxAperture: 1.4,
    isDefault: true,
  },
  {
    name: "Fujifilm X-T5 + 16mm f/1.4",
    sensorSize: "APS-C (1.5x)",
    focalLength: 16,
    maxAperture: 1.4,
    isDefault: false,
  },
  {
    name: "Canon EOS R10 + 50mm f/1.8",
    sensorSize: "APS-C (1.6x)",
    focalLength: 50,
    maxAperture: 1.8,
    isDefault: false,
  },
  {
    name: "OM System OM-1 + 12mm f/2.0",
    sensorSize: "Micro Four Thirds",
    focalLength: 12,
    maxAperture: 2.0,
    isDefault: false,
  }
];

export async function GET() {
  try {
    let list = await db.select().from(astroGear);
    
    // Seed standard equipment presets if empty
    if (list.length === 0) {
      for (const preset of STARTER_PRESETS) {
        await db.insert(astroGear).values(preset);
      }
      list = await db.select().from(astroGear);
    }
    
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("Error in GET /api/gear:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, sensorSize, focalLength, maxAperture, isDefault } = body;

    if (!name || !sensorSize || !focalLength || !maxAperture) {
      return NextResponse.json({ error: "Missing gear details" }, { status: 400 });
    }

    // If setting as default, clear default status of others
    if (isDefault) {
      await db.update(astroGear).set({ isDefault: false });
    }

    const [inserted] = await db
      .insert(astroGear)
      .values({
        name,
        sensorSize,
        focalLength: parseInt(focalLength),
        maxAperture: parseFloat(maxAperture),
        isDefault: isDefault || false,
      })
      .returning();

    return NextResponse.json({ message: "Equipment profile saved", data: inserted });
  } catch (error: any) {
    console.error("Error in POST /api/gear:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "Missing gear id" }, { status: 400 });
    }

    await db.delete(astroGear).where(eq(astroGear.id, parseInt(idStr)));
    return NextResponse.json({ message: "Equipment configuration removed" });
  } catch (error: any) {
    console.error("Error in DELETE /api/gear:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
