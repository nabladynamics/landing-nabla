"use client";

import { Reveal } from "@/components/ui/reveal";
import { container } from "@/lib/site";

export function Vision() {
  return (
    <section
      id="vision"
      className="relative overflow-hidden border-y border-line py-28 md:py-40"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="anim-drift absolute inset-0 bg-[linear-gradient(rgba(124,90,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(124,90,255,0.07)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_75%_at_50%_50%,black,transparent)]" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/10 blur-[160px]" />
      </div>

      <div className={`${container} text-center`}>
        <Reveal>
          <p className="flex items-center justify-center gap-3 font-mono text-[13px] uppercase tracking-[0.22em] text-volt-bright">
            <span aria-hidden="true" className="h-px w-7 bg-volt" />
            Vision
            <span aria-hidden="true" className="h-px w-7 bg-volt" />
          </p>
          <h2 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-frost sm:text-5xl lg:text-6xl">
            Simulation should become an interactive engineering tool.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-fog">
            Instead of waiting days for a simulation result, engineers should
            be able to explore designs, test hypotheses and iterate at the
            speed of thought.
          </p>
          <p className="mx-auto mt-5 max-w-2xl font-display text-xl font-medium text-frost">
            Nabla AI is building the{" "}
            <span className="bg-gradient-to-r from-volt-bright to-pulse bg-clip-text text-transparent">
              computational layer
            </span>{" "}
            that makes this possible.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
