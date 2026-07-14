import type { AnchorHTMLAttributes, ReactNode } from "react";

type CTAProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium transition-colors duration-200";

const variants = {
  primary:
    "bg-volt text-white shadow-[0_0_28px_rgba(124,90,255,0.32)] hover:bg-volt-bright",
  secondary:
    "border border-line-strong text-frost hover:border-volt/70 hover:text-white",
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
