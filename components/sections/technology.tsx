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
    body: "The engine continuously reallocates computational resolution toward shocks, vortices, boundary layers and other physically relevant structures — instead of spending compute uniformly across the domain.",
    diagram: <AMRDiagram />,
  },
  {
    index: "02",
    title: "Automated solver orchestration",
    body: "Nabla AI selects and coordinates numerical methods, fidelity levels and solver configurations based on the evolving flow — no manual tuning loop.",
    diagram: <OrchestratorDiagram />,
  },
  {
    index: "03",
    title: "GPU-native architecture",
    body: "The complete simulation pipeline is designed around modern GPU hardware, rather than adapted from legacy CPU-based architectures.",
    diagram: <GPUDiagram />,
  },
  {
    index: "04",
    title: "Configurable fidelity",
    body: "Users can balance speed and accuracy across a spectrum ranging from engineering-grade LES to near-DNS fidelity, per case and per question.",
    diagram: <FidelityDiagram />,
  },
];

export function Technology() {
  return (
    <section id="technology" className="scroll-mt-24 py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          eyebrow="Technology"
          title="A simulation engine that understands where compute matters."
          lede="Resolution is treated as a dynamic resource — allocated in space and time by the physics of the flow, not fixed upfront by a mesh."
        />

        <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {blocks.map((block, i) => (
            <Reveal key={block.index} delay={0.08 * (i % 2)}>
              {block.diagram}
              <div className="mt-6 flex items-baseline gap-4">
                <span className="font-mono text-xs text-volt-bright">
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
