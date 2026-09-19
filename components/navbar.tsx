"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { container, navLinks, site } from "@/lib/site";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-void/95 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-void/90 backdrop-blur-md"
      }`}
    >
      <nav aria-label="Main" className={`${container} flex h-20 items-center justify-between`}>
        <a
          href="#main"
          className="rounded-sm"
          aria-label="Nabla AI — back to top"
          onClick={() => setOpen(false)}
        >
          <Wordmark />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-fog transition-colors hover:text-volt"
            >
              {link.label}
            </a>
          ))}
          <a
            href={site.calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-volt px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-volt-bright"
          >
            Book a call
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white text-frost md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-b border-line bg-void shadow-sm md:hidden"
          >
            <div className={`${container} flex flex-col gap-1 py-4`}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-2.5 text-[15px] text-fog transition-colors hover:bg-raise hover:text-frost"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={site.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-12 items-center justify-center rounded-lg bg-volt px-4 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-volt-bright"
                onClick={() => setOpen(false)}
              >
                Book a call
              </a>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
