"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Steps } from "@/components/ui/steps";
import { container } from "@/lib/site";

const markets = [
  {
    name: "Aerospace",
    title: "Resolve the turbulence that decides an aircraft.",
    body: "Quieter, safer and more efficient aircraft are decided by turbulence, and turbulence has to be resolved, not approximated. Engines, pylons, flaps and wingtips are exactly where body-fitted meshes break. With Nabla the geometry goes in as it is, and resolution concentrates on the boundary layer and the wake, where drag and noise are actually decided.",
    image: "aircraft",
    alt: "Airliner with resolved wingtip vortices and streamlines over the wings",
  },
  {
    name: "Marine",
    title: "Hull, propeller and wake in a single run.",
    body: "Hull resistance and propeller wakes are long transient simulations, the kind where a mesh failure on day three hurts most. Without a mesh to fail, a hull form is evaluated from the STL, with resolution concentrated on the free surface and the wake instead of spread uniformly across the domain.",
    image: "ship",
    alt: "Ship hull with streamlines and wake visualisation",
  },
  {
    name: "AI-generated design",
    title: "Validate designs as fast as AI generates them.",
    body: "Geometries for drones, vehicles and rotor blades are now generated straight from performance objectives, faster than anyone can validate them. Each candidate used to need its own mesh. With Nabla each one is just another STL, evaluated with real physics rather than a surrogate that returns a plausible answer with no guarantee it holds for a design nobody has simulated before.",
    image: "drone",
    alt: "Drone with rotor flow visualisation",
  },
  {
    name: "Defence and underwater",
    title: "Signature is a turbulence problem.",
    body: "The noise and wake signature of a submarine are decided by the smallest eddies around the hull and sail. Resolving them below a tenth of the width of a human hair, the scale at which they dissipate, is the resolution the industry needs and that nothing on the market delivers at an affordable cost.",
    image: "submarine",
    alt: "Submarine with resolved flow structures along the hull",
  },
];

export function Approach() {
  return (
    <section id="approach" className="border-t border-line py-24 md:py-32">
      <div className={container}>
        <SectionHeading
          title="Skip the mesh. Drop in an STL, run, read the results."
          lede="Nature does not build a mesh or tune a model: the flow resolves itself. We have derived the formulation that makes this possible in an engineering tool, the one whose absence has held this class of methods back for thirty years, and validated it analytically and in simulation."
        />

        <Reveal delay={0.1} className="mt-14">
          <Steps />
        </Reveal>

        <div id="applications" className="mt-24 space-y-20 scroll-mt-24 md:mt-32 md:space-y-28">
          {markets.map((market, i) => {
            const flipped = i % 2 === 1;
            return (
              <Reveal key={market.name}>
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                  <div
                    className={`relative aspect-[16/9] overflow-hidden rounded-card border border-line bg-raise ${
                      flipped ? "lg:order-2" : ""
                    }`}
                  >
                    <Image
                      src={`/images/markets/${market.image}.webp`}
                      alt={market.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className={flipped ? "lg:order-1" : ""}>
                    <h3 className="text-balance font-display text-2xl font-semibold leading-snug tracking-tight text-frost sm:text-3xl">
                      {market.title}
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
                      {market.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
