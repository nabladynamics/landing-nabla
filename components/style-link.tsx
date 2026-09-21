"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useStyle } from "@/components/style-provider";

type StyleLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function StyleLink({ href, ...props }: StyleLinkProps) {
  const style = useStyle();
  return <Link {...props} href={style.href(href)} />;
}
