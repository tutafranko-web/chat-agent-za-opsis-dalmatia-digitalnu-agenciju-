import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";

/**
 * Next 16 proxy (formerly middleware): HTTP Basic auth in front of the admin
 * area. Handlers re-check authorization themselves as well.
 */
export function proxy(req: NextRequest) {
  if (isAdminAuthorized(req.headers.get("authorization"))) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Opsis admin", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
