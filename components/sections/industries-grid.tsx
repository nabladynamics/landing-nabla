"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { container } from "@/lib/site";
import styles from "./industries-list.module.css";

const industries = [
  {
    name: "Aviation",
    body: "Airflow shapes lift, drag and aircraft noise. We are exploring how CFD could help engineers compare wings, airframes and unmanned aircraft designs, with less time spent preparing each simulation.",
    image: "aviation",
    alt: "Passenger aircraft approaching with its landing gear extended",
    position: "28% 50%",
    contain: false,
  },
  {
    name: "Space",
    body: "From launch vehicle aerodynamics to nozzle flows and thermal loads, space systems pose demanding physical questions. Our ambition is to help engineers explore those questions earlier as new designs take shape.",
    image: "space",
    alt: "Rocket engines firing during a ground test",
    position: "50% 43%",
    contain: false,
  },
  {
    name: "Marine",
    body: "Hulls and underwater vehicles must balance resistance, stability and efficiency. Fluid simulation can help examine how a design interacts with the surrounding water, from the bow to the propeller wake.",
    image: "marine",
    alt: "Overhead view of a motor yacht and its wake",
    position: "50% 50%",
    contain: true,
  },
  {
    name: "Rail",
    body: "Airflow affects high-speed train drag, crosswind response and ventilation. We see opportunities to bring earlier physical feedback into the design of train bodies and their cooling systems.",
    image: "rail",
    alt: "High-speed passenger train at a station",
    position: "62% 50%",
    contain: false,
  },
  {
    name: "Wind energy",
    body: "Rotor blades and turbine wakes influence how wind becomes useful power. Our goal is to support the study of aerodynamic loading and wake interactions, helping engineers explore designs across different operating conditions.",
    image: "wind-energy",
    alt: "Offshore wind turbines above the sea",
    position: "50% 48%",
    contain: false,
  },
  {
    name: "Turbomachinery",
    body: "Compressors and turbines bring moving blades, confined passages and complex flows together. We are exploring how more accessible fluid simulation could help engineers investigate performance, heat transfer and cooling within rotating machinery.",
    image: "turbomachinery",
    alt: "Close-up of the fan blades of a jet engine",
    position: "50% 38%",
    contain: false,
  },
] as const;

export function IndustriesGrid() {
  return (
    <section className={styles.section} aria-label="Industries">
      <div className={container}>
        <ul className={styles.list}>
          {industries.map((industry, index) => (
            <li key={industry.image} className={styles.item}>
              <Reveal y={16}>
                <article className={styles.row} aria-labelledby={`industry-${industry.image}`}>
                  <div className={`${styles.imageFrame} ${industry.contain ? styles.portraitFrame : ""}`}>
                    <Image
                      src={`/images/industries/${industry.image}.webp`}
                      alt={industry.alt}
                      fill
                      sizes="(min-width: 1152px) 304px, (min-width: 1024px) 28vw, (min-width: 640px) 34vw, calc(100vw - 48px)"
                      priority={index < 2}
                      className={`${styles.image} ${industry.contain ? styles.containedImage : ""}`}
                      style={{ objectPosition: industry.position }}
                    />
                  </div>
                  <h2 id={`industry-${industry.image}`} className={`font-display ${styles.title}`}>
                    {industry.name}
                  </h2>
                  <p className={styles.description}>{industry.body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
