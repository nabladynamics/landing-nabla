"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";

const ease: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({ children, className, delay = 0, y = 22 }: RevealProps) {
  return (
    <m.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </m.div>
  );
}
