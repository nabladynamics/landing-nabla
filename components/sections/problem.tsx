"use client";

import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { container } from "@/lib/site";

const stats = [
  {
    value: "30 years",
    label: "since the core CFD workflow last changed: mesh, tune, solve, wait.",
  },
  {
    value: "~60%",
    label:
      "of the human effort in a simulation is preprocessing, mostly mesh generation.",
  },
  {
    value: "Days",
    label:
      "of compute lost each time a run diverges on a mesh that looked fine.",
  },
];

const pains = [
  {
    title: "The run diverges on day three.",
    body: "You spent a week on the mesh, handed it to the solver and waited. Then a handful of bad cells blew up the residuals, and you are back at the mesh. Again.",
  },
  {
    title: "Preprocessing eats the schedule.",
    body: "NASA's CFD Vision 2030 study names mesh generation as a major workflow bottleneck, often dominating the human effort a simulation requires. The physics has not even started.",
  },
  {
    title: "Same geometry, two engineers, two drag numbers.",
    body: "The answer depends on the mesh and the parameters you picked, not only on the physics. Nobody actually wants that.",
  },
  {
    title: "It takes a whole team.",
    body: "Meshing specialists, solver experts, an HPC budget and weeks of calendar time. All of it for a single design point.",
  },
  {
    title: "The wind tunnel is still the fallback.",
    body: "Not because blowing air at a scale model is cheap, fast or convenient, but because nobody has made simulation trustworthy enough to replace it.",
  },
  {
    title: "Turbulence gets approximated, not resolved.",
    body: "Quieter, safer, more efficient vehicles are decided by eddies a tenth of a hair wide. Resolving them costs more than anyone can afford, so it rarely happens.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="py-24 md:py-32">
      <div className={container}>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <SectionHeading
            title="Simulation is the cheapest place to find out you got it wrong. It is still far too expensive."
          />
          <Reveal delay={0.12} className="space-y-5 text-base leading-relaxed text-fog sm:text-lg lg:pt-2">
            <p>
              Every aircraft, ship, submarine and rocket is a shape that has to
              survive contact with air or water. CFD is how engineers find out
              on a computer whether it flies, goes fast or holds together,
              before anyone cuts metal.
            </p>
            <p>
              Yet the workflow has not fundamentally changed in three decades:
              wrap the geometry in a body-fitted mesh, tune the parameters, hand
              it to a finite-volume solver, wait. The industry feels that cost
              every day.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <dl className="mt-16 grid gap-6 border-y border-line py-8 sm:grid-cols-3 sm:gap-10 md:mt-20">
            {stats.map((stat) => (
              <div key={stat.value}>
                <dt className="font-display text-4xl font-semibold tracking-tight text-volt sm:text-5xl">
                  {stat.value}
                </dt>
                <dd className="mt-3 max-w-xs text-[15px] leading-relaxed text-fog">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-16 md:mt-20">
          <Reveal>
            <h3 className="font-display text-2xl font-medium tracking-tight text-frost sm:text-3xl">
              If you have run CFD, you know these.
            </h3>
          </Reveal>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pains.map((pain, i) => (
              <li key={pain.title} className="h-full">
                <Reveal delay={0.06 * (i % 3)} className="h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 sm:p-7">
                    <p className="font-display text-xl font-semibold leading-snug tracking-tight text-frost">
                      {pain.title}
                    </p>
                    <p className="mt-4 text-[15px] leading-relaxed text-fog">
                      {pain.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
