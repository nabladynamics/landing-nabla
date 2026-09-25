import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionProvider } from "@/components/motion-provider";
import { site } from "@/lib/site";
import { googleSiteVerification, isPreview, publicPages, siteUrl } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Keep the static preview mode available before hydration.
const staticPreviewScript = `(function(){try{if(new URLSearchParams(location.search).has("static")){document.documentElement.dataset.static="1"}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: publicPages.home.title,
    template: "%s | Nabla AI",
  },
  description: site.description,
  verification: {
    google: [
      googleSiteVerification,
      ...(process.env.GOOGLE_SITE_VERIFICATION?.trim()
        ? [process.env.GOOGLE_SITE_VERIFICATION.trim()]
        : []),
    ],
  },
  robots: {
    index: !isPreview,
    follow: !isPreview,
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
    <html lang="en" className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: staticPreviewScript }} />
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
        <MotionProvider>{children}</MotionProvider>
        {process.env.VERCEL_ENV === "production" ? <Analytics /> : null}
      </body>
    </html>
  );
}
