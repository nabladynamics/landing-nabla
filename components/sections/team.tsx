"use client";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

const founders = [
  {
    initials: "JN",
    name: "Jesús Navas Guerrero",
    role: "Co-founder · CEO",
    avatarClass:
      "border-volt/50 bg-gradient-to-br from-volt/25 to-pulse/10 text-volt-bright",
    highlights: [
      "Aerospace Engineering and Engineering Physics",
      "MSc in Advanced Mechanical Engineering, Imperial College London",
      "Computational fluid dynamics, plasma physics and computational MHD",
      "Former researcher at NASA Goddard",
      "La Caixa Fellow",
    ],
  },
  {
    initials: "MM",
    name: "Martí Massó Moreno",
    role: "Co-founder · CTO",
    avatarClass:
      "border-pulse/50 bg-gradient-to-br from-pulse/25 to-volt/10 text-pulse",
    highlights: [
      "Aerospace Engineering and Engineering Physics",
      "MSc in Astrophysics, Particle Physics and Cosmology",
      "Former CFD engineer at Near Space Labs",
      "Research experience at NASA Goddard",
      "Computational models for ICME reconstruction and propagation",
    ],
  },
];

export function Team() {
  return (
    <section id="company" className="scroll-mt-24 py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          eyebrow="Company"
          title="Built by engineers working across CFD, aerospace and computational physics."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {founders.map((founder, i) => (
            <Reveal key={founder.name} delay={0.1 * i} className="h-full">
              <article className="flex h-full flex-col rounded-xl border border-line bg-raise/30 p-7 sm:p-8">
                <div className="flex items-center gap-5">
                  <span
                    aria-hidden="true"
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border font-display text-lg font-semibold tracking-wide ${founder.avatarClass}`}
                  >
                    {founder.initials}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-frost">
                      {founder.name}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-volt-bright">
                      {founder.role}
                    </p>
                  </div>
                </div>
                <ul className="mt-7 space-y-3">
                  {founder.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed text-fog"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[9px] h-px w-4 shrink-0 bg-volt/60"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
