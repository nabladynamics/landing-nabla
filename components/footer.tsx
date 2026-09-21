"use client";

import { StyleLink } from "@/components/style-link";
import { useStyle } from "@/components/style-provider";
import { SpatialWordmark } from "@/components/navbar";
import styles from "@/components/experience/spatial-navigation.module.css";
import { Linkedin } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { container, navLinks, site } from "@/lib/site";

export function Footer() {
  const { theme } = useStyle();
  if (theme === "spatial") {
    return (
      <footer className={styles.footer}>
        <StyleLink href="/" aria-label="Nabla AI — home"><SpatialWordmark /></StyleLink>
        <span className={styles.footerMeta}>{site.locations}</span>
        <nav className={styles.footerNav} aria-label="Footer">
          <StyleLink href="/industries">Industries</StyleLink>
          <StyleLink href="/platform">Platform</StyleLink>
          <StyleLink href="/contact">Let’s talk</StyleLink>
        </nav>
      </footer>
    );
  }
  return (
    <footer className="border-t border-line bg-raise/50">
      <div className={`${container} py-14`}>
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-fog">
              {site.tagline}.
            </p>
            <p className="mt-2 text-sm text-fog">
              {site.locations}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <nav aria-label="Footer">
              <p className="text-sm font-semibold text-frost">
                Explore
              </p>
              <ul className="mt-4 space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <StyleLink
                      href={link.href}
                      className="text-sm text-fog transition-colors hover:text-frost"
                    >
                      {link.label}
                    </StyleLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="text-sm font-semibold text-frost">
                Connect
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <StyleLink
                    href="/contact"
                    className="text-sm text-fog transition-colors hover:text-frost"
                  >
                    Contact us
                  </StyleLink>
                </li>
                <li>
                  <a
                    href="#"
                    aria-label="LinkedIn — profile coming soon"
                    className="inline-flex items-center gap-2 text-sm text-fog transition-colors hover:text-frost"
                  >
                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fog">
            © {new Date().getFullYear()} Nabla AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
