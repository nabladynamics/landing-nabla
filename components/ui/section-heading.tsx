import { Reveal } from "@/components/ui/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  id,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`.trim()}
    >
      <p
        className={`flex items-center gap-3 font-mono text-[13px] uppercase tracking-[0.22em] text-volt-bright ${
          centered ? "justify-center" : ""
        }`.trim()}
      >
        <span aria-hidden="true" className="h-px w-7 bg-volt" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-5 font-display text-3xl font-semibold leading-[1.12] tracking-tight text-frost sm:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 text-base leading-relaxed text-fog sm:text-lg">
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
