"use client";

import type { ReactNode } from "react";
import {
  AMRDiagram,
  FidelityDiagram,
  GPUDiagram,
  OrchestratorDiagram,
} from "@/components/visuals/diagrams";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

type Block = {
  index: string;
  title: string;
  body: string;
  diagram: ReactNode;
};

const blocks: Block[] = [
  {
    index: "01",
    title: "Dynamic resolution allocation",
    body: "Adaptive resolution is intended to concentrate computation where the evolving flow demands it and where aerodynamic detail matters.",
    diagram: <AMRDiagram />,
  },
  {
    index: "02",
    title: "Workflow automation",
    body: "We are developing automation to reduce simulation preparation and manual solver setup, helping engineers move from geometry to physical evaluation.",
    diagram: <OrchestratorDiagram />,
  },
  {
    index: "03",
    title: "Beyond body-fitted volume meshes",
    body: "Our approach removes the need for conventional body-fitted volume meshing, with the aim of reducing preparation time and computing cost.",
    diagram: <GPUDiagram />,
  },
  {
    index: "04",
    title: "Higher resolution, targeted effort",
    body: "Our goal is to resolve more flow detail while keeping simulations practical in time and cost. Performance will be assessed through benchmarks against published experiments.",
    diagram: <FidelityDiagram />,
  },
];

export function Technology() {
  return (
    <section id="technology" className="py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          title="Resolution where the physics demands it."
          lede="We are developing a CFD engine with adaptive resolution guided by the evolving flow. Faster preparation, shorter simulations and lower computing costs are development goals."
        />

        <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {blocks.map((block, i) => (
            <Reveal key={block.index} delay={0.08 * (i % 2)}>
              {block.diagram}
              <div className="mt-6 flex items-baseline gap-4">
                <span className="text-sm font-medium text-volt-bright">
                  {block.index}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-frost">
                    {block.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-fog">
                    {block.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
