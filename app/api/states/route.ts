import { NextResponse } from "next/server";
import { ensureStatesTable, getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureStatesTable();
    const sql = getSql();
    const rows = await sql`
      SELECT state_code, state_name, visited, places
      FROM states
      ORDER BY state_name ASC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}
