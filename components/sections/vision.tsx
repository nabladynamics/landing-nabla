"use client";

import { Reveal } from "@/components/ui/reveal";
import { container } from "@/lib/site";

export function Vision() {
  return (
    <section
      id="vision"
      className="border-y border-volt/10 bg-[#f1eef9] py-24 md:py-32"
    >
      <div className={`${container} text-center`}>
        <Reveal>
          <h2 className="mx-auto max-w-4xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-frost sm:text-5xl lg:text-6xl">
            Simulation should become an interactive engineering tool.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-fog">
            As AI generates more candidate designs, our ambition is to make
            physical evaluation fast enough to support a continuous cycle of
            generating, simulating and improving them.
          </p>
          <p className="mx-auto mt-5 max-w-2xl font-display text-xl font-medium text-frost">
            Nabla AI is building the{" "}
            <span className="text-volt">
              computational layer
            </span>{" "}
            to help make this possible.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
