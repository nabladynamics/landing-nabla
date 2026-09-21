export type ThemeId = "spatial" | "default" | "deeptech" | "editorial" | "industrial" | "lab";

export type SiteSection = "/" | "/industries" | "/platform" | "/contact";

export const THEME_STORAGE_KEY = "nabla-theme";
export const DEFAULT_THEME: ThemeId = "spatial";

export const themes: { id: ThemeId; name: string; hint: string }[] = [
  { id: "spatial", name: "Spatial", hint: "A continuous 3D journey, guided by scroll" },
  { id: "default", name: "Original", hint: "Inter, violet, soft corners" },
  { id: "deeptech", name: "Deep-tech", hint: "After nTop: paper, ink, engineering blue" },
  { id: "editorial", name: "Editorial", hint: "After Luminary: light type, mono labels" },
  { id: "industrial", name: "Industrial", hint: "After Varda: bold uppercase, navy and orange" },
  { id: "lab", name: "Lab", hint: "After Isomorphic: pastel tints, pill buttons" },
];

export const themeIds = themes.map((theme) => theme.id);

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && themeIds.includes(value as ThemeId);
}

function pathWithoutSuffix(href: string): string {
  return href.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
}

/** The URL owns the style; a saved preference never overrides a direct link. */
export function themeFromPath(pathname: string): ThemeId {
  const segments = pathWithoutSuffix(pathname).split("/");
  return segments[1] === "styles" && isThemeId(segments[2])
    ? segments[2]
    : DEFAULT_THEME;
}

function unstyledPath(pathname: string): string {
  const path = pathWithoutSuffix(pathname);
  const segments = path.split("/");
  if (segments[1] === "styles" && isThemeId(segments[2])) {
    return `/${segments.slice(3).join("/")}`;
  }
  return path;
}

function isSection(path: string): path is SiteSection {
  return path === "/" || path === "/industries" || path === "/platform" || path === "/contact";
}

export function sectionFromPath(pathname: string): SiteSection {
  const section = unstyledPath(pathname);
  return isSection(section) ? section : "/";
}

/** Rewrite only site pages, leaving assets, API URLs and external links intact. */
export function themeHref(href: string, theme: ThemeId): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const suffixIndex = href.search(/[?#]/);
  const suffix = suffixIndex === -1 ? "" : href.slice(suffixIndex);
  const path = unstyledPath(href);
  const section = path === "/experience" ? "/" : path;
  if (!isSection(section)) return href;

  const prefix = theme === "spatial" ? "" : `/styles/${theme}`;
  return `${prefix}${section === "/" && prefix ? "" : section}${suffix}`;
}
