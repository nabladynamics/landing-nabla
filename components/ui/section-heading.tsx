import { Reveal } from "@/components/ui/reveal";

type SectionHeadingProps = {
  title: string;
  lede?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
};

export function SectionHeading({
  title,
  lede,
  align = "left",
  id,
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={`max-w-3xl ${centered ? "mx-auto text-center" : ""} ${className}`.trim()}
    >
      <h2
        id={id}
        className="text-balance font-display text-3xl font-medium leading-[1.12] tracking-tight text-frost sm:text-4xl lg:text-[2.9rem]"
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-6 text-base leading-relaxed text-fog sm:text-lg">
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
