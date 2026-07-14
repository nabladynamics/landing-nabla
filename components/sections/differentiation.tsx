"use client";

import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

const principles = [
  "Physics-first numerical simulation",
  "Adaptive computation",
  "GPU-native execution",
  "Machine learning where it creates measurable value",
  "Physically consistent outputs",
  "Generalisation beyond narrow training distributions",
];

type Row = { text: string; pro?: boolean };

const approaches: {
  name: string;
  highlight?: boolean;
  rows: Row[];
}[] = [
  {
    name: "Traditional CFD",
    rows: [
      { text: "Physically rigorous", pro: true },
      { text: "Slow and manual" },
      { text: "Expensive" },
      { text: "Complex workflows" },
    ],
  },
  {
    name: "Pure AI surrogate",
    rows: [
      { text: "Extremely fast", pro: true },
      { text: "Limited generalisation" },
      { text: "Training-data dependent" },
      { text: "Hard to trust" },
    ],
  },
  {
    name: "Nabla AI",
    highlight: true,
    rows: [
      { text: "Physics-first", pro: true },
      { text: "Adaptive compute", pro: true },
      { text: "GPU-native", pro: true },
      { text: "Automated workflow", pro: true },
    ],
  },
];

export function Differentiation() {
  return (
    <section id="approach" className="scroll-mt-24 py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          eyebrow="Approach"
          title="Not another CFD surrogate model."
          lede="Neural surrogates trained on libraries of precomputed simulations can be extremely fast — but they inherit the limits of their training data and offer no physical guarantees on genuinely new designs. Nabla AI is a numerical simulation engine first; machine learning enters only where it accelerates the physics without compromising it."
        />

        <Reveal delay={0.1}>
          <ul className="mt-12 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex items-start gap-3 text-[15px] text-fog"
              >
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-volt"
                />
                {principle}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {approaches.map((approach, i) => (
            <Reveal key={approach.name} delay={0.08 * i} className="h-full">
              <div
                className={`flex h-full flex-col rounded-xl border p-6 sm:p-7 ${
                  approach.highlight
                    ? "border-volt/50 bg-gradient-to-b from-volt/10 to-transparent shadow-[0_0_60px_rgba(124,90,255,0.10)]"
                    : "border-line bg-raise/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <h3
                    className={`whitespace-nowrap font-display text-lg font-semibold tracking-tight ${
                      approach.highlight ? "text-frost" : "text-fog"
                    }`}
                  >
                    {approach.name}
                  </h3>
                  {approach.highlight ? (
                    <span className="rounded-full border border-volt/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-volt-bright">
                      our approach
                    </span>
                  ) : null}
                </div>
                <ul className="mt-6 space-y-3.5">
                  {approach.rows.map((row) => (
                    <li
                      key={row.text}
                      className={`flex items-center gap-3 border-b border-line pb-3.5 text-sm last:border-b-0 last:pb-0 ${
                        approach.highlight
                          ? "text-frost"
                          : row.pro
                            ? "text-fog"
                            : "text-fog/70"
                      }`}
                    >
                      {row.pro ? (
                        <Check
                          aria-hidden="true"
                          className={`h-4 w-4 shrink-0 ${
                            approach.highlight ? "text-volt-bright" : "text-fog/60"
                          }`}
                        />
                      ) : (
                        <Minus
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-fog/40"
                        />
                      )}
                      {row.text}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
