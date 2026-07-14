"use client";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

const domains = [
  {
    name: "Aerospace",
    description:
      "Aerodynamics, propulsion, hypersonics and complex turbulent flows.",
  },
  {
    name: "Automotive",
    description:
      "External aerodynamics, thermal management and design optimisation.",
  },
  {
    name: "Energy",
    description:
      "Wind, combustion, heat transfer and next-generation energy systems.",
  },
  {
    name: "Turbomachinery",
    description:
      "Compressors, turbines and rotating flows requiring high-resolution simulation.",
  },
  {
    name: "Defence",
    description:
      "High-speed flows, propulsion, autonomous systems and complex mission environments.",
  },
  {
    name: "Industrial flows",
    description:
      "Multiphysics and turbulent flows across advanced manufacturing and infrastructure.",
  },
];

export function Applications() {
  return (
    <section id="applications" className="scroll-mt-24 py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          eyebrow="Applications"
          title="One engine, multiple engineering domains."
          lede="The same adaptive core applies wherever turbulence, heat and high-speed flow decide how a product performs."
        />

        <Reveal delay={0.1}>
          <div className="mt-14 grid overflow-hidden rounded-xl border border-line bg-line/70 gap-px sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain, i) => (
              <article
                key={domain.name}
                className="group bg-void p-7 transition-colors duration-300 hover:bg-raise/80 sm:p-8"
              >
                <p className="font-mono text-[11px] text-fog/50">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-frost transition-colors duration-300 group-hover:text-volt-bright">
                  {domain.name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fog">
                  {domain.description}
                </p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
