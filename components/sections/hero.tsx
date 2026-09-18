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
    <section className="relative isolate flex min-h-[min(900px,100svh)] flex-col justify-center overflow-hidden bg-void pb-32 pt-36 sm:pt-40 lg:pb-36">
      <HeroVideo />

      <div
        className={`${container} relative z-10`}
      >
        <div className="max-w-2xl">
          <m.p
            {...fadeUp(0)}
            className="inline-flex items-center gap-2.5 rounded-full border border-line bg-raise/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-fog"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-volt shadow-[0_0_10px_rgba(124,90,255,0.9)]"
            />
            Physics-first · GPU-native
          </m.p>

          <m.h1
            {...fadeUp(0.1)}
            className="mt-7 font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-frost sm:text-6xl lg:text-[4.25rem]"
          >
            High-fidelity CFD, rebuilt for the{" "}
            <span className="whitespace-nowrap bg-gradient-to-r from-volt-bright to-pulse bg-clip-text text-transparent">
              GPU era.
            </span>
          </m.h1>

          <m.p
            {...fadeUp(0.2)}
            className="mt-6 max-w-xl text-lg leading-relaxed text-frost/80"
          >
            Nabla AI is building a physics-first, GPU-native simulation engine
            that dynamically concentrates compute where it matters most.
          </m.p>

          <m.div {...fadeUp(0.3)} className="mt-9 flex flex-wrap gap-4">
            <CTA href={site.calendly}>
              Book a conversation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CTA>
            <CTA href="#technology" variant="secondary" className="bg-void/35 backdrop-blur-sm">
              Explore the technology
            </CTA>
          </m.div>

          <m.ul
            {...fadeUp(0.42)}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-2.5 border-t border-white/15 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-frost/70"
          >
            <li>Dynamic resolution</li>
            <li>Solver orchestration</li>
            <li>LES → near-DNS fidelity</li>
          </m.ul>
        </div>

      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <a
          href="#problem"
          aria-label="Scroll to the next section"
          className="rounded-full p-2 text-fog/60 transition-colors hover:text-frost"
        >
          <ChevronDown className="anim-bob h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
