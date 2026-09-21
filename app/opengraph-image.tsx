import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = "Nabla AI: Physics-first, adaptive CFD";
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
          background: "#f3f2ec",
          color: "#243333",
          fontSize: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="72" height="72" viewBox="0 0 32 32" aria-hidden="true">
            <path
              d="M3 5h26L16 27ZM6.25 6.9 16 23.4 25.75 6.9Z"
              fill="#111111"
              fillRule="evenodd"
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
            color: "#65706b",
            maxWidth: 900,
          }}
        >
          {`${site.tagline}. Developing faster simulations with higher resolution at lower cost.`}
        </div>
      </div>
    ),
    size,
  );
}
