export const site = {
  name: "Nabla AI",
  alternateNames: ["Nabla", "Nabla World"],
  tagline: "CFD, but faster, cheaper, more accurate and supercharged by AI",
  description:
    "Nabla AI is developing a computational fluid dynamics (CFD) simulation engine with adaptive resolution and no body-fitted meshing for engineering design.",
  calendly: "https://calendly.com/massomarti/30min",
  linkedin: "https://www.linkedin.com/company/nabla-dynamics",
  locations: "Barcelona · San Francisco",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Industries", href: "/industries" },
  { label: "Let’s Talk", href: "/contact" },
] as const;

export const container = "mx-auto w-full max-w-6xl px-6 lg:px-8";
