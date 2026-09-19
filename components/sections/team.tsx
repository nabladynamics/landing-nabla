"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

// Drop an SVG or PNG in public/logos/ and set `logo` (e.g. "/logos/nasa.svg")
// to render it. Entries without a logo render as a typographic wordmark.
const institutions: { name: string; logo?: string }[] = [
  { name: "Imperial College London" },
  { name: "CFIS" },
  { name: "NASA" },
  { name: "Rolls-Royce" },
  { name: "CIMNE" },
];

export function Team() {
  return (
    <section id="company" className="py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          align="center"
          title="A founding team from the institutions that define the field."
          lede="Aerospace engineers and computational physicists who have built and run CFD at:"
        />

        <Reveal delay={0.1}>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16">
            {institutions.map((institution) => (
              <li
                key={institution.name}
                className="flex h-12 items-center opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              >
                {institution.logo ? (
                  <Image
                    src={institution.logo}
                    alt={institution.name}
                    width={160}
                    height={48}
                    className="h-10 w-auto object-contain sm:h-12"
                  />
                ) : (
                  <span className="font-display text-lg font-semibold tracking-tight text-frost sm:text-xl">
                    {institution.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
