import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_VALUE } from "@/lib/auth";
import { ensureStatesTable, getSql } from "@/lib/db";
import { cookies } from "next/headers";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  if (session !== ADMIN_COOKIE_VALUE) {
    return false;
  }
  return true;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { stateCode: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stateCode = params.stateCode?.toUpperCase();
  if (!stateCode || stateCode.length !== 2) {
    return NextResponse.json({ error: "Invalid state code" }, { status: 400 });
  }

  let body: { visited?: boolean; places?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body.visited !== "boolean" &&
    typeof body.places !== "string"
  ) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    await ensureStatesTable();
    const sql = getSql();

    const visited = typeof body.visited === "boolean" ? body.visited : null;
    const places = typeof body.places === "string" ? body.places : null;

    const rows = await sql`
      UPDATE states
      SET
        visited = COALESCE(${visited}, visited),
        places = COALESCE(${places}, places)
      WHERE state_code = ${stateCode}
      RETURNING state_code, state_name, visited, places
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("PATCH /api/states:", error);
    return NextResponse.json(
      { error: "Failed to update state" },
      { status: 500 }
    );
  }
}
