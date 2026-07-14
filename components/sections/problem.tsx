"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

const painPoints = [
  "Manual meshing and geometry clean-up",
  "Hand-tuned models, solvers and parameters",
  "Uniform or poorly allocated resolution",
  "Long iteration cycles",
  "Expensive compute infrastructure",
  "Highly specialised engineering teams",
];

const traditionalSteps = [
  "Geometry",
  "Meshing",
  "Solver setup",
  "Run",
  "Debug",
  "Remesh",
  "Run again",
];

const nablaSteps = ["Geometry", "Physics intent", "Adaptive simulation", "Results"];

function StepChips({
  steps,
  accent = false,
}: {
  steps: string[];
  accent?: boolean;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2.5">
          <span
            className={`rounded-md border px-3 py-1.5 text-[13px] ${
              accent
                ? "border-volt/40 bg-volt/10 text-frost"
                : "border-line bg-raise/60 text-fog"
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 ? (
            <ArrowRight
              aria-hidden="true"
              className={`h-3.5 w-3.5 shrink-0 ${accent ? "text-volt-bright" : "text-fog/40"}`}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function Problem() {
  return (
    <section id="problem" className="py-24 md:py-32">
      <div className={container}>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <SectionHeading
            eyebrow="The problem"
            title="High-fidelity simulation remains too slow and too manual."
            lede="A single trustworthy result can take days or weeks — most of it spent preparing the simulation rather than learning from it. Today's high-fidelity CFD workflows still depend on:"
          />
          <Reveal delay={0.15} className="lg:pt-14">
            <ul className="space-y-3.5">
              {painPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 border-b border-line pb-3.5 text-[15px] text-fog"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[9px] h-px w-4 shrink-0 bg-fog/50"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="mt-16 space-y-5 md:mt-20">
          <Reveal>
            <div className="rounded-xl border border-line bg-raise/30 p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-fog">
                  Traditional CFD workflow
                </h3>
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fog/60">
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  repeat for days–weeks
                </p>
              </div>
              <StepChips steps={traditionalSteps} />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-xl border border-volt/35 bg-gradient-to-b from-volt/[0.07] to-transparent p-6 shadow-[0_0_60px_rgba(124,90,255,0.08)] sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-volt-bright">
                  Nabla AI workflow
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fog/70">
                  automated · adaptive · continuous
                </p>
              </div>
              <StepChips steps={nablaSteps} accent />
              <div className="relative mt-7 h-px bg-line" aria-hidden="true">
                <span className="anim-travel absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-volt shadow-[0_0_10px_rgba(124,90,255,0.9)]" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
