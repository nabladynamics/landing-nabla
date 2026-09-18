import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = "Nabla AI — Physics-first, adaptive CFD";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(ellipse 80% 70% at 25% 20%, #16113a 0%, #05070d 60%)",
          color: "#eef1f8",
          fontSize: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
            <path
              d="M3.6 4.5h16.8L12 20.4 3.6 4.5Z"
              stroke="#a18aff"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ fontSize: 52, fontWeight: 700 }}>Nabla AI</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 950,
          }}
        >
          Building the next generation of CFD.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 30,
            color: "#9aa4bb",
            maxWidth: 900,
          }}
        >
          {`${site.tagline} — developing faster simulations with higher resolution at lower cost.`}
        </div>
      </div>
    ),
    size,
  );
}
