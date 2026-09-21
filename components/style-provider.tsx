"use client";

import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_THEME, themeFromPath, themeHref, type ThemeId } from "@/lib/themes";

type StyleContextValue = {
  theme: ThemeId;
  href: (href: string) => string;
};

const StyleContext = createContext<StyleContextValue>({
  theme: DEFAULT_THEME,
  href: (href) => themeHref(href, DEFAULT_THEME),
});

export function StyleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = themeFromPath(pathname ?? "/");

  useLayoutEffect(() => {
    if (theme === "default") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const value = useMemo<StyleContextValue>(
    () => ({ theme, href: (href) => themeHref(href, theme) }),
    [theme],
  );

  return <StyleContext.Provider value={value}>{children}</StyleContext.Provider>;
}

export function useStyle(): StyleContextValue {
  return useContext(StyleContext);
}
