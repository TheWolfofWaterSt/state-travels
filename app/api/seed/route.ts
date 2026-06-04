import { NextResponse } from "next/server";
import { seedStates } from "@/lib/seed";

export async function POST() {
  try {
    const result = await seedStates();
    return NextResponse.json({
      ok: true,
      inserted: result.inserted,
      message: `Seeded ${result.inserted} new state(s)`,
    });
  } catch (error) {
    console.error("POST /api/seed:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
