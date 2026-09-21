"use client";

import { m } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { CTA } from "@/components/ui/cta";
import { HeroVideo } from "@/components/visuals/hero-video";
import { container, site } from "@/lib/site";

const ease: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[min(820px,100svh)] flex-col justify-center overflow-hidden bg-void pb-28 pt-36 sm:pt-40 lg:pb-32">
      <HeroVideo />

      <div className={`${container} relative z-10`}>
        <div className="max-w-[660px]">
          <m.h1
            data-reveal
            {...fadeUp(0)}
            className="text-balance font-display text-[2.7rem] font-medium leading-[1.08] tracking-tight text-frost sm:text-6xl lg:text-[4.25rem]"
          >
            Building the next generation of{" "}
            <span className="whitespace-nowrap text-volt">CFD.</span>
          </m.h1>

          <m.p
            data-reveal
            {...fadeUp(0.1)}
            className="mt-7 max-w-[560px] text-lg leading-relaxed text-fog"
          >
            Drop in a geometry, run, read the results. No meshing, no parameter
            tuning. Nabla AI is building a CFD engine that is faster, cheaper,
            more accurate and supercharged by AI.
          </m.p>

          <m.div data-reveal {...fadeUp(0.2)} className="mt-9 flex flex-wrap gap-4">
            <CTA href={site.calendly}>
              Book a conversation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CTA>
            <CTA href="/platform" variant="secondary">
              Explore the platform
            </CTA>
          </m.div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <a
          href="#problem"
          aria-label="Scroll to the next section"
          className="rounded-full p-2 text-fog transition-colors hover:text-frost"
        >
          <ChevronDown className="anim-bob h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
