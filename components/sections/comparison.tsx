"use client";

import { Check, Minus, X } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

type Verdict = "good" | "partial" | "bad";
type Cell = { text: string; verdict: Verdict };

const columns = [
  { name: "Nabla AI", sub: "No-mesh, adaptive CFD", highlight: true },
  { name: "Traditional CFD", sub: "Fluent, STAR-CCM+, OpenFOAM" },
  { name: "AI surrogates", sub: "PhysicsX, Neural Concept" },
  { name: "Wind tunnel", sub: "Physical testing" },
];

const rows: { label: string; cells: Cell[] }[] = [
  {
    label: "Preprocessing",
    cells: [
      { text: "Drop in an STL", verdict: "good" },
      { text: "Days to weeks of meshing and setup", verdict: "bad" },
      { text: "A trained model for that design family", verdict: "partial" },
      { text: "Build and instrument a scale model", verdict: "bad" },
    ],
  },
  {
    label: "Who can run it",
    cells: [
      { text: "Any engineer", verdict: "good" },
      { text: "Specialised meshing and solver team", verdict: "bad" },
      { text: "ML team plus CFD team for training data", verdict: "bad" },
      { text: "Test facility and crew", verdict: "bad" },
    ],
  },
  {
    label: "The answer depends on",
    cells: [
      { text: "The physics", verdict: "good" },
      { text: "The mesh and parameters chosen", verdict: "bad" },
      { text: "The training data", verdict: "bad" },
      { text: "Scale effects and model fidelity", verdict: "partial" },
    ],
  },
  {
    label: "Turbulence",
    cells: [
      { text: "Resolved, compute where the flow demands it", verdict: "good" },
      { text: "Modelled, or resolved at prohibitive cost", verdict: "partial" },
      { text: "Approximated, no guarantee", verdict: "bad" },
      { text: "Real, but only where the sensors are", verdict: "partial" },
    ],
  },
  {
    label: "Designs nobody has simulated before",
    cells: [
      { text: "Same physics, same engine", verdict: "good" },
      { text: "Yes, with a new mesh", verdict: "partial" },
      { text: "Unreliable outside the training set", verdict: "bad" },
      { text: "Yes, with a new model", verdict: "partial" },
    ],
  },
  {
    label: "Can it fail mid-run",
    cells: [
      { text: "No mesh to fail", verdict: "good" },
      { text: "Yes: remesh and rerun", verdict: "bad" },
      { text: "No, but it can be silently wrong", verdict: "bad" },
      { text: "Rarely, but rescheduling costs weeks", verdict: "partial" },
    ],
  },
  {
    label: "Cost per design iteration",
    cells: [
      { text: "Compute only, concentrated where it matters", verdict: "good" },
      { text: "Engineering hours plus compute", verdict: "bad" },
      { text: "Cheap to run, expensive to trust", verdict: "partial" },
      { text: "Very high", verdict: "bad" },
    ],
  },
];

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  if (verdict === "good") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-volt/10 text-volt">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Advantage</span>
      </span>
    );
  }
  if (verdict === "partial") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-raise text-fog">
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Partial</span>
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-raise text-fog/60">
      <X className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">Limitation</span>
    </span>
  );
}

export function Comparison() {
  return (
    <section id="compare" className="border-t border-line py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          title="How it compares."
          lede="Three ways to find out how a shape behaves in a fluid today, and what changes when the mesh goes away."
        />

        <Reveal delay={0.1}>
          <div className="mt-12 overflow-x-auto rounded-card border border-line bg-white [scrollbar-width:thin]">
            <table className="w-full min-w-[880px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="w-[18%] px-5 py-5 align-bottom sm:px-6">
                    <span className="sr-only">Criterion</span>
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.name}
                      scope="col"
                      className={`px-5 py-5 align-bottom sm:px-6 ${
                        column.highlight ? "bg-tint" : ""
                      }`}
                    >
                      <span
                        className={`block font-display text-lg font-semibold tracking-tight ${
                          column.highlight ? "text-volt" : "text-frost"
                        }`}
                      >
                        {column.name}
                      </span>
                      <span className="font-mono mt-1 block text-sm font-normal text-fog">
                        {column.sub}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-b-0">
                    <th
                      scope="row"
                      className="px-5 py-5 align-top font-medium text-frost sm:px-6"
                    >
                      {row.label}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td
                        key={`${row.label}-${columns[i].name}`}
                        className={`px-5 py-5 align-top sm:px-6 ${
                          columns[i].highlight
                            ? "bg-tint font-medium text-frost"
                            : "text-fog"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <VerdictIcon verdict={cell.verdict} />
                          <span className="leading-relaxed">{cell.text}</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
