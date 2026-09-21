import { Reveal } from "@/components/ui/reveal";
import { container } from "@/lib/site";

type PageHeaderProps = {
  title: string;
  lede?: string;
};

/** Top block for the inner pages; the padding clears the fixed navbar. */
export function PageHeader({ title, lede }: PageHeaderProps) {
  return (
    <section className="pb-6 pt-36 sm:pt-40">
      <div className={container}>
        <Reveal className="max-w-3xl">
          <h1 className="text-balance font-display text-4xl font-medium leading-[1.08] tracking-tight text-frost sm:text-5xl lg:text-[3.75rem]">
            {title}
          </h1>
          {lede ? (
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-fog">
              {lede}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
