import { Linkedin } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { container, navLinks, site } from "@/lib/site";

export function Footer() {
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
                    <a
                      href={link.href}
                      className="text-sm text-fog transition-colors hover:text-frost"
                    >
                      {link.label}
                    </a>
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
                  <a
                    href="#contact"
                    className="text-sm text-fog transition-colors hover:text-frost"
                  >
                    Contact us
                  </a>
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
