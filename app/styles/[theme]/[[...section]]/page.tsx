import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import HomePage from "@/components/pages/home-page";
import IndustriesPage from "@/components/pages/industries-page";
import PlatformPage from "@/components/pages/platform-page";
import ContactPage from "@/components/pages/contact-page";
import { isThemeId, themes } from "@/lib/themes";

type StylePageProps = {
  params: Promise<{ theme: string; section?: string[] }>;
};

const pages = {
  home: { Component: HomePage, title: "A new physics-first CFD engine" },
  industries: { Component: IndustriesPage, title: "Industries" },
  platform: { Component: PlatformPage, title: "Platform" },
  contact: { Component: ContactPage, title: "Contact" },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return themes.filter(({ id }) => id !== "spatial").flatMap(({ id }) =>
    Object.keys(pages).map((section) => ({
      theme: id,
      section: section === "home" ? [] : [section],
    })),
  );
}

async function resolvePage(params: StylePageProps["params"]) {
  const { theme, section = [] } = await params;
  if (!isThemeId(theme) || section.length > 1) notFound();
  const key = section[0] ?? "home";
  if (!Object.hasOwn(pages, key) || section[0] === "home") notFound();
  if (theme === "spatial") redirect(section.length ? `/${section[0]}` : "/");
  return pages[key as keyof typeof pages];
}

export async function generateMetadata({ params }: StylePageProps): Promise<Metadata> {
  const page = await resolvePage(params);
  return { title: page.title, robots: { index: false, follow: true } };
}

export default async function StylePage({ params }: StylePageProps) {
  const { Component } = await resolvePage(params);
  return <Component />;
}
