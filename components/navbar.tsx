"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { container, navLinks } from "@/lib/site";
import styles from "@/components/experience/spatial-navigation.module.css";

const links = navLinks.filter((link) => link.href !== "/contact");

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeSection = pathname;

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
      className={styles.header}
    >
      <nav aria-label="Main" className={styles.nav}>
        <Link href="/" className="shrink-0 rounded-sm" aria-label="Nabla AI home">
          <Wordmark />
        </Link>

        <div className={styles.controls}>
          <div className={styles.desktopLinks}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activeSection === link.href ? "page" : undefined}
                className={styles.navLink}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              aria-current={activeSection === "/contact" ? "page" : undefined}
              className={styles.navCta}
            >
              Let’s Talk <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.mobileButton}
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
            className={styles.mobilePanel}
          >
            <nav aria-label="Mobile navigation" className={`${container} flex flex-col gap-1 py-4`}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={activeSection === link.href ? "page" : undefined}
                  className={styles.mobileLink}
                  onClick={() => setOpen(false)}
                >
                  {link.label}{link.href === "/contact" && <ArrowUpRight size={16} aria-hidden="true" />}
                </Link>
              ))}
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
