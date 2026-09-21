import { NablaMark } from "@/components/logo";

/** Stand-in for industry visuals that are not produced yet. */
export function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label} visual coming soon`}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#eef0f6_0%,#f6f4fd_100%)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(100,70,215,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(100,70,215,0.08)_1px,transparent_1px)] [background-size:28px_28px]"
      />
      <NablaMark className="relative h-10 w-10 opacity-40" />
    </div>
  );
}
