import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, isValidSessionCookie } from "@/lib/session";

// Named for Next.js 16's proxy.ts convention (the file formerly known as
// middleware.ts). Gates every route behind the PIN-derived session cookie.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!isValidSessionCookie(cookie)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
