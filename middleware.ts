import { NextResponse, type NextRequest } from "next/server";
import { isThemeId, themeHref } from "@/lib/themes";

// Preserve links from the earlier query-based style picker.
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const theme = url.searchParams.get("theme");
  if (isThemeId(theme)) {
    const destination = themeHref(url.pathname, theme);
    if (destination !== url.pathname || url.searchParams.has("theme")) {
      url.pathname = destination;
      url.searchParams.delete("theme");
      return NextResponse.redirect(url);
    }
  }
  if (url.pathname === "/styles/spatial" || url.pathname.startsWith("/styles/spatial/")) {
    url.pathname = url.pathname.replace(/^\/styles\/spatial/, "") || "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/industries", "/platform", "/contact", "/experience", "/styles/:path*"],
};
