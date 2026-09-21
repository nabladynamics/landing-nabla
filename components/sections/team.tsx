"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";
import styles from "./team.module.css";

// Logos live in public/logos/ (trimmed, transparent background, 240px tall).
// `height` balances visual weight: wide wordmarks sit shorter than emblems.
const institutions = [
  { name: "Imperial College London", logo: "/logos/imperial.png", width: 2151, height: "h-5 sm:h-6" },
  { name: "CFIS · UPC", logo: "/logos/cfis.png", width: 459, height: "h-10 sm:h-12" },
  { name: "NASA", logo: "/logos/nasa.png", width: 293, height: "h-12 sm:h-14" },
  { name: "Rolls-Royce", logo: "/logos/rolls-royce.png", width: 209, height: "h-12 sm:h-14" },
  { name: "CIMNE", logo: "/logos/cimne.png", width: 827, height: "h-10 sm:h-12" },
  { name: "Barcelona Supercomputing Center", logo: "/logos/bsc.png", width: 985, height: "h-10 sm:h-12" },
];

export function Team({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section id="team" className={styles.strip} aria-labelledby="team-background-title">
        <div className={styles.inner}>
          <Reveal>
            <p id="team-background-title" className={styles.caption}>The experience our founders bring to Nabla</p>
            <div className={styles.viewport} role="region" aria-label="Founding team institutions" tabIndex={0}>
              <ul className={styles.logos}>
                {institutions.map((institution) => (
                  <li key={institution.name}>
                    <Image
                      src={institution.logo}
                      alt={institution.name}
                      width={institution.width}
                      height={240}
                      sizes="180px"
                      className={styles.logo}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="company" className="py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          align="center"
          title="A founding team from the institutions that define the field."
          lede="Aerospace engineers and computational physicists who have built and run CFD at:"
        />

        <Reveal delay={0.1}>
          <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-14 gap-y-10 sm:gap-x-20">
            {institutions.map((institution) => (
              <li
                key={institution.name}
                className="flex items-center opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={institution.logo}
                  alt={institution.name}
                  width={institution.width}
                  height={240}
                  className={`w-auto object-contain ${institution.height}`}
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
