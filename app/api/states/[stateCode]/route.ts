import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import type { CityRecord } from "@/lib/states-data";
import { updateState } from "@/lib/states-repository";

function isValidCities(value: unknown): value is CityRecord[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (city) =>
      typeof city === "object" &&
      city !== null &&
      typeof city.name === "string" &&
      Array.isArray(city.places) &&
      city.places.every((p: unknown) => typeof p === "string")
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { stateCode: string } }
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stateCode = params.stateCode?.toUpperCase();
  if (!stateCode || stateCode.length !== 2) {
    return NextResponse.json({ error: "Invalid state code" }, { status: 400 });
  }

  let body: { visited?: boolean; cities?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hasVisited = typeof body.visited === "boolean";
  const hasCities = body.cities !== undefined;

  if (!hasVisited && !hasCities) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  if (hasCities && !isValidCities(body.cities)) {
    return NextResponse.json({ error: "Invalid cities payload" }, { status: 400 });
  }

  try {
    const updated = await updateState(stateCode, {
      visited: hasVisited ? body.visited : undefined,
      cities: hasCities ? (body.cities as CityRecord[]) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "State not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/states:", error);
    return NextResponse.json(
      { error: "Failed to update state" },
      { status: 500 }
    );
  }
}
