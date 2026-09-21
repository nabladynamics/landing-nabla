"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { container } from "@/lib/site";
import styles from "./industries-list.module.css";

const industries = [
  {
    name: "Aviation",
    body: "A wing must deliver low drag in cruise and enough lift for takeoff and landing. CFD helps engineers evaluate both, but resolving thin boundary layers and flow separation across many flight conditions makes reliable design comparisons computationally demanding.",
    image: "aviation",
    alt: "Passenger aircraft approaching with its landing gear extended",
    position: "28% 50%",
    contain: false,
  },
  {
    name: "Space",
    body: "During engine start-up, shocks and flow separation can produce damaging side loads inside a rocket nozzle. CFD helps engineers assess these transient pressures and wall heating, but resolving them requires fine spatial and temporal detail.",
    image: "space",
    alt: "Rocket engines firing during a ground test",
    position: "50% 43%",
    contain: false,
  },
  {
    name: "Marine",
    body: "The wake behind a hull determines how evenly water reaches the propeller, affecting efficiency, cavitation and noise. CFD helps predict these interactions at full scale. The difficulty is resolving ship-scale flow alongside the small, rapidly changing structures around the blades.",
    image: "marine",
    alt: "Overhead view of a motor yacht and its wake",
    position: "50% 50%",
    contain: true,
  },
  {
    name: "Rail",
    body: "Tunnel pressure pulses and crosswinds can set a train’s operating limits. CFD helps engineers assess these loads alongside drag and slipstream effects. Each design must be checked across train speeds, wind directions and tunnel geometries, making the number of cases a bottleneck.",
    image: "rail",
    alt: "High-speed passenger train at a station",
    position: "62% 50%",
    contain: false,
  },
  {
    name: "Wind energy",
    body: "Turbines in a wake receive less energy and more turbulent inflow, reducing power and increasing fatigue loads. CFD helps compare layouts and operating strategies. The challenge is capturing interactions across an entire wind farm without losing the flow detail around individual rotors.",
    image: "wind-energy",
    alt: "Offshore wind turbines above the sea",
    position: "50% 48%",
    contain: false,
  },
  {
    name: "Turbomachinery",
    body: "Leakage through blade-tip gaps and interactions between blade rows reduce efficiency and create unsteady loads. CFD helps identify these losses across the operating range. The challenge is resolving narrow clearances and rotating flow without making each design iteration prohibitively slow.",
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
