import type { AnchorHTMLAttributes, ReactNode } from "react";

type CTAProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

const base =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-lg px-6 py-3 text-[15px] font-medium transition-colors duration-200";

const variants = {
  primary:
    "bg-volt text-white shadow-sm hover:bg-volt-bright",
  secondary:
    "border border-line-strong bg-white/80 text-frost hover:border-volt/50 hover:bg-white hover:text-volt",
} as const;

export function CTA({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}: CTAProps) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
