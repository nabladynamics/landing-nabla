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
    title: "No body-fitted volume mesh",
    body: "The geometry goes in as an STL straight from CAD. There is no volume mesh to build, tune, debug or regenerate, so the largest share of preprocessing disappears with it.",
    diagram: <GPUDiagram />,
  },
  {
    index: "02",
    title: "Resolution that follows the flow",
    body: "Instead of fixing resolution upfront, compute concentrates where the evolving flow demands it: boundary layers, wakes, shear layers and the small eddies that decide drag and noise.",
    diagram: <AMRDiagram />,
  },
  {
    index: "03",
    title: "Automated end to end",
    body: "Upload, run, analyse. No solver expertise required to get a first result, and one answer per geometry regardless of who set it up.",
    diagram: <OrchestratorDiagram />,
  },
  {
    index: "04",
    title: "Resolved turbulence, affordable",
    body: "Turbulence is resolved rather than approximated by a surrogate, at a cost that makes it practical for design iteration. Performance is validated against published experiments.",
    diagram: <FidelityDiagram />,
  },
];

export function Technology() {
  return (
    <section id="technology" className="border-t border-line py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          title="What is under the hood"
          lede="A CFD engine that eliminates conventional body-fitted volume meshing and concentrates computational power where the physics demands it."
        />

        <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {blocks.map((block, i) => (
            <Reveal key={block.index} delay={0.08 * (i % 2)}>
              {block.diagram}
              <div className="mt-6 flex items-baseline gap-4">
                <span className="font-mono text-sm font-medium text-volt-bright">
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
