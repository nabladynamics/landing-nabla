import { NextResponse, type NextRequest } from "next/server";

// Retired designs resolve to the same page on the single public site.
const legacyStylePath = /^\/styles\/(?:default|deeptech|editorial|industrial|lab|spatial)(?:\/(industries|contact|platform))?\/?$/;

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const legacy = url.pathname.match(legacyStylePath);
  const hasTheme = url.searchParams.has("theme");

  if (legacy) {
    url.pathname = legacy[1] && legacy[1] !== "platform" ? `/${legacy[1]}` : "/";
  }
  if (hasTheme) url.searchParams.delete("theme");

  if (legacy || hasTheme) return NextResponse.redirect(url, 308);
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/industries", "/platform", "/contact", "/experience", "/styles/:path*"],
};
