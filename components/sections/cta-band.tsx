"use client";

import { ArrowRight } from "lucide-react";
import { CTA } from "@/components/ui/cta";
import { Reveal } from "@/components/ui/reveal";
import { container, site } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="border-t border-line bg-raise/50 py-20 md:py-24">
      <div className={container}>
        <Reveal className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="text-balance font-display text-3xl font-medium leading-[1.15] tracking-tight text-frost sm:text-4xl">
              See it run on your geometry
            </h2>
            <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">
              Bring an STL that is hard to mesh. We will walk you through the
              engine and what it can do for your workloads.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-4">
            <CTA href={site.calendly}>
              Book a demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CTA>
            <CTA href="/contact" variant="secondary">
              Contact us
            </CTA>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
