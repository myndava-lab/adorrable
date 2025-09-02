import { NextResponse, NextRequest } from "next/server";

/**
 * Keep middleware ultra-light. Do NOT import Supabase here.
 * We only gate non-public routes by checking Supabase auth cookies.
 */
const PUBLIC_PATHS = new Set<string>([
  "/", "/favicon.ico", "/logo.png",
  "/robots.txt", "/sitemap.xml",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.match(/\\.(?:png|jpg|jpeg|svg|gif|ico|txt|xml|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Public pages
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Minimal auth check via cookies set by Supabase
  const hasAccess = req.cookies.get("sb-access-token")?.value;
  const hasRefresh = req.cookies.get("sb-refresh-token")?.value;

  if (!hasAccess && !hasRefresh) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Match everything except Next internals and static files.
 * Adjust if you want to exempt more routes.
 */
export const config = {
  matcher: ["/((?!_next|.*\\..*|api/public).*)"],
};