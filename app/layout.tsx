import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nabla AI | A new physics-first CFD engine",
    template: "%s | Nabla AI",
  },
  description: site.description,
  keywords: [
    "CFD",
    "computational fluid dynamics",
    "physics-led simulation",
    "adaptive resolution",
    "physical validation",
    "AI-generated design",
    "aerodynamic simulation",
    "engineering simulation",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Nabla AI | A new physics-first CFD engine",
    description: site.description,
    locale: "en_US",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nabla AI | A new physics-first CFD engine",
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes into <body> before hydration; only this element's
          attribute mismatches are suppressed, children still validate. */}
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-volt focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
