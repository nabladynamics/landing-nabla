"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { StyleLink } from "@/components/style-link";
import { useStyle } from "@/components/style-provider";
import { container, navLinks } from "@/lib/site";
import { sectionFromPath } from "@/lib/themes";
import styles from "@/components/experience/spatial-navigation.module.css";

const links = navLinks.filter((link) => link.href !== "/contact");

export function SpatialWordmark() {
  return (
    <span className={styles.brand}>
      <svg viewBox="0 0 32 32" width="29" height="29" fill="none" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11h14L16 25Z" stroke="#b56b4b" strokeWidth="2" />
        <path d="M5 5h22L16 27Z" stroke="currentColor" strokeWidth="2.2" />
      </svg>
      <span>Nabla AI</span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { theme } = useStyle();
  const spatial = theme === "spatial";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeSection = sectionFromPath(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={spatial ? styles.header : `fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? "border-b border-line bg-void/95 shadow-sm backdrop-blur-md" : "border-b border-transparent bg-void/90 backdrop-blur-md"}`}
    >
      <nav aria-label="Main" className={`${styles.navigation} ${spatial ? styles.nav : `${container} flex h-20 items-center justify-between gap-3`}`}>
        <StyleLink href="/" className="shrink-0 rounded-sm" aria-label="Nabla AI — home">
          {spatial ? <SpatialWordmark /> : <Wordmark />}
        </StyleLink>

        <div className={`${styles.controls} ${spatial ? styles.spatialControls : ""}`}>
          <div className={styles.desktopLinks}>
            {links.map((link) => (
              <StyleLink
                key={link.href}
                href={link.href}
                aria-current={activeSection === link.href ? "page" : undefined}
                className={spatial ? styles.navLink : `text-[15px] font-medium transition-colors hover:text-volt ${activeSection === link.href ? "text-frost" : "text-fog"}`}
              >
                {link.label}
              </StyleLink>
            ))}
            <StyleLink
              href="/contact"
              aria-current={activeSection === "/contact" ? "page" : undefined}
              className={spatial ? styles.navCta : "inline-flex items-center gap-5 rounded-ctl bg-cta px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cta-bright"}
            >
              Let’s Talk <ArrowUpRight size={15} aria-hidden="true" />
            </StyleLink>
          </div>
          <ThemeSwitcher />
          <button
            ref={menuButtonRef}
            type="button"
            className={`${styles.mobileButton} ${spatial ? styles.spatialMobileButton : "rounded-ctl border border-line bg-white text-frost"}`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`${styles.mobilePanel} ${spatial ? styles.spatialMobilePanel : "border-b border-line bg-void shadow-sm"}`}
          >
            <nav aria-label="Mobile navigation" className={`${container} flex flex-col gap-1 py-4`}>
              {navLinks.map((link) => (
                <StyleLink
                  key={link.href}
                  href={link.href}
                  aria-current={activeSection === link.href ? "page" : undefined}
                  className={spatial ? styles.mobileLink : `rounded-ctl px-2 py-3 text-[15px] transition-colors hover:bg-raise hover:text-frost ${activeSection === link.href ? "text-frost" : "text-fog"}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}{link.href === "/contact" && <ArrowUpRight size={16} aria-hidden="true" />}
                </StyleLink>
              ))}
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
