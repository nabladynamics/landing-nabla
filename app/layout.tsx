import type { Metadata, Viewport } from "next";
import {
  Archivo,
  DM_Mono,
  DM_Sans,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Manrope,
} from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { StyleProvider } from "@/components/style-provider";
import { site } from "@/lib/site";
import { themeIds } from "@/lib/themes";
import "./globals.css";

// One family per style variant; see the data-theme blocks in globals.css.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });

const fontVariables = [inter, geist, geistMono, manrope, jetbrains, archivo, plexMono, dmSans, dmMono]
  .map((font) => font.variable)
  .join(" ");

// The URL owns the variant, including on refresh and before hydration.
const themeBootScript = `(function(){try{var p=location.pathname.split("/");var ids=${JSON.stringify(themeIds)};var t=p[1]==="styles"&&ids.indexOf(p[2])>-1?p[2]:"spatial";if(t!=="default"){document.documentElement.dataset.theme=t}else{delete document.documentElement.dataset.theme}if(new URLSearchParams(location.search).has("static")){document.documentElement.dataset.static="1"}}catch(e){}})();`;

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
  themeColor: "#f3f2ec",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${fontVariables}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes into <body> before hydration; only this element's
          attribute mismatches are suppressed, children still validate. */}
      <body
        suppressHydrationWarning
        className="font-sans"
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-ctl focus:bg-volt focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <StyleProvider><MotionProvider>{children}</MotionProvider></StyleProvider>
      </body>
    </html>
  );
}
