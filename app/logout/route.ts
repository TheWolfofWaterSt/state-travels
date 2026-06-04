import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
