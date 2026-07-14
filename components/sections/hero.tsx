"use client";

import { m } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { CTA } from "@/components/ui/cta";
import { FlowCanvas } from "@/components/visuals/flow-canvas";
import { container, site } from "@/lib/site";

const ease: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 lg:pt-40">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(143,160,194,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(143,160,194,0.055)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_30%,black,transparent)]" />
        <div className="absolute -top-44 left-1/3 h-[460px] w-[620px] -translate-x-1/2 rounded-full bg-volt/15 blur-[150px]" />
        <div className="absolute right-0 top-1/3 h-[340px] w-[460px] translate-x-1/3 rounded-full bg-pulse/10 blur-[150px]" />
      </div>

      <div
        className={`${container} grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12`}
      >
        <div>
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
            className="mt-7 font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-frost sm:text-5xl lg:text-[3.5rem] xl:text-[3.9rem]"
          >
            High-fidelity CFD, rebuilt for the{" "}
            <span className="whitespace-nowrap bg-gradient-to-r from-volt-bright to-pulse bg-clip-text text-transparent">
              GPU era.
            </span>
          </m.h1>

          <m.p
            {...fadeUp(0.2)}
            className="mt-6 max-w-xl text-lg leading-relaxed text-fog"
          >
            Nabla AI is building a physics-first, GPU-native simulation engine
            that dynamically concentrates compute where it matters most.
          </m.p>

          <m.div {...fadeUp(0.3)} className="mt-9 flex flex-wrap gap-4">
            <CTA href={site.calendly}>
              Book a conversation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CTA>
            <CTA href="#technology" variant="secondary">
              Explore the technology
            </CTA>
          </m.div>

          <m.ul
            {...fadeUp(0.42)}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-2.5 border-t border-line pt-6 font-mono text-xs uppercase tracking-[0.14em] text-fog/80"
          >
            <li>Dynamic resolution</li>
            <li>Solver orchestration</li>
            <li>LES → near-DNS fidelity</li>
          </m.ul>
        </div>

        <m.div {...fadeUp(0.22)} className="relative">
          <div className="overflow-hidden rounded-xl border border-line bg-raise/50 shadow-[0_0_90px_rgba(124,90,255,0.10)]">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fog/80">
              <span>Adaptive simulation preview</span>
              <span className="text-volt-bright">AMR · L6</span>
            </div>
            <FlowCanvas className="aspect-[4/3] w-full sm:aspect-[16/10]" />
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-4 py-2.5 font-mono text-[11px] text-fog/80">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-14 rounded-full bg-gradient-to-r from-pulse via-frost/60 to-volt"
                />
                vorticity
              </span>
              <span>∇ · u = 0</span>
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-fog/60">
            Live in-browser demo — cells refine around the wake as vortices
            shed.
          </p>
        </m.div>
      </div>

      <div className="mt-14 flex justify-center lg:mt-16">
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
