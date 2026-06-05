import { NextResponse } from "next/server";
import { fetchAllStates } from "@/lib/states-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await fetchAllStates();
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}
