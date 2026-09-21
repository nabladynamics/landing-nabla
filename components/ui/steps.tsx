import { ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Drop in an STL",
    body: "Straight from CAD. No cleanup, no body-fitted volume mesh, no parameters to tune.",
  },
  {
    title: "Run",
    body: "Resolution follows the physics. Compute concentrates where the flow demands it, not where you guessed it would.",
  },
  {
    title: "Read the results",
    body: "One answer per geometry, independent of who set it up. Analyse, iterate, run the next candidate.",
  },
];

export function Steps() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="relative flex flex-col rounded-card border border-volt/20 bg-tint p-6 sm:p-7"
        >
          <span className="font-mono text-sm font-semibold text-volt">
            0{i + 1}
          </span>
          <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-frost">
            {step.title}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-fog">
            {step.body}
          </p>
          {i < steps.length - 1 ? (
            <ArrowRight
              aria-hidden="true"
              className="absolute -right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-volt md:block"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
