import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isStatePatch =
    request.method === "PATCH" &&
    pathname.startsWith("/api/states/") &&
    pathname.length > "/api/states/".length;

  if (!isAdminPage && !isStatePatch) {
    return NextResponse.next();
  }

  if (!isAdminRequest(request)) {
    if (isStatePatch) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/states/:path*"],
};
