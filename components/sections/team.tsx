"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import styles from "./team.module.css";

// Logos live in public/logos/ (trimmed, transparent background, 240px tall).
const institutions = [
  { name: "Imperial College London", logo: "/logos/imperial.png", width: 2151 },
  { name: "CFIS · UPC", logo: "/logos/cfis.png", width: 459 },
  { name: "NASA", logo: "/logos/nasa.png", width: 293 },
  { name: "Rolls-Royce", logo: "/logos/rolls-royce.png", width: 209 },
  { name: "CIMNE", logo: "/logos/cimne.png", width: 827 },
  { name: "Barcelona Supercomputing Center", logo: "/logos/bsc.png", width: 985 },
];

export function Team() {
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
