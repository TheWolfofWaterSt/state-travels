import { NextRequest, NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin-token";
import { ADMIN_COOKIE, ADMIN_COOKIE_VALUE } from "@/lib/auth";

function readPassword(request: NextRequest, body: unknown): string {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") && body && typeof body === "object") {
    const record = body as { password?: unknown };
    return typeof record.password === "string" ? record.password : "";
  }
  return "";
}

export async function POST(request: NextRequest) {
  let password = "";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      password = readPassword(request, await request.json());
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    password = formData.get("password")?.toString() ?? "";
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  let token: string;
  try {
    token = createAdminToken();
  } catch {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true, token });

  response.cookies.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
