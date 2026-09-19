export const site = {
  name: "Nabla AI",
  tagline: "CFD, but faster, cheaper, more accurate and supercharged by AI",
  description:
    "Nabla AI is building a CFD engine with no body-fitted meshing: drop in an STL, run, and read the results. Faster simulations, lower costs and higher resolution, with compute concentrated where the physics demands it.",
  calendly: "https://calendly.com/massomarti/30min",
  locations: "Barcelona · San Francisco",
} as const;

export const navLinks = [
  { label: "Approach", href: "#approach" },
  { label: "Applications", href: "#applications" },
  { label: "Compare", href: "#compare" },
  { label: "Company", href: "#company" },
  { label: "Contact", href: "#contact" },
] as const;

export const container = "mx-auto w-full max-w-6xl px-6 lg:px-8";
