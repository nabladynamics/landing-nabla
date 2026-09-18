import type { ReactNode } from "react";

/**
 * Small technical schematics for the technology blocks. Pure SVG, styled to
 * read as engineering diagrams rather than decorative icons. All are
 * decorative (the accompanying copy carries the meaning), hence aria-hidden.
 */

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-lg border border-line bg-raise/40"
    >
      <svg viewBox="0 0 320 190" className="block h-auto w-full">
        {children}
      </svg>
    </div>
  );
}

function gridLines(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  step: number,
) {
  let d = "";
  for (let x = x0; x <= x1 + 0.01; x += step) d += `M${x} ${y0}V${y1}`;
  for (let y = y0; y <= y1 + 0.01; y += step) d += `M${x0} ${y}H${x1}`;
  return d;
}

const label = "font-mono uppercase";
const labelStyle = { fontSize: 8.5, letterSpacing: "0.12em" } as const;

export function AMRDiagram() {
  return (
    <Frame>
      <path d={gridLines(0, 0, 320, 190, 40)} stroke="#8fa0c2" strokeOpacity="0.12" fill="none" />
      <path d={gridLines(178, 56, 258, 136, 20)} stroke="#9674ff" strokeOpacity="0.22" fill="none" />
      <path d={gridLines(198, 76, 238, 116, 10)} stroke="#9674ff" strokeOpacity="0.38" fill="none" />
      <path d={gridLines(208, 86, 228, 106, 5)} stroke="#a78bff" strokeOpacity="0.55" fill="none" />
      <circle cx="218" cy="96" r="9" fill="none" stroke="#a18aff" strokeOpacity="0.9" strokeWidth="1.2" className="anim-ping-soft" />
      <circle cx="218" cy="96" r="2.4" fill="#a18aff" />
      <path
        d="M218 96c6 -1 8 -7 3 -10c-6 -3 -13 2 -12 9c1 9 11 13 19 9"
        fill="none"
        stroke="#7c5aff"
        strokeOpacity="0.65"
        strokeWidth="1.1"
      />
      <text x="14" y="24" className={`${label} fill-fog/70`} style={labelStyle}>
        Δx
      </text>
      <text x="185" y="50" className={`${label} fill-volt-bright`} style={labelStyle}>
        Δx / 2ᵏ
      </text>
    </Frame>
  );
}

export function OrchestratorDiagram() {
  const targets = [
    { y: 48, text: "scheme", active: false },
    { y: 95, text: "closure", active: true },
    { y: 142, text: "fidelity", active: false },
  ];
  return (
    <Frame>
      <rect x="16" y="80" width="76" height="30" rx="4" fill="#0a0e19" stroke="#8fa0c2" strokeOpacity="0.35" />
      <text x="54" y="98" textAnchor="middle" className={`${label} fill-fog`} style={labelStyle}>
        flow state
      </text>

      <path d="M92 95H128" stroke="#7c5aff" strokeOpacity="0.8" strokeDasharray="5 5" className="anim-dash" fill="none" />

      <rect x="128" y="76" width="86" height="38" rx="4" fill="#0a0e19" stroke="#7c5aff" strokeOpacity="0.75" />
      <text x="171" y="98" textAnchor="middle" className={`${label} fill-frost`} style={labelStyle}>
        orchestrator
      </text>

      {targets.map((t) => (
        <g key={t.text}>
          <path
            d={`M214 95C236 95 236 ${t.y + 12} 252 ${t.y + 12}`}
            fill="none"
            stroke={t.active ? "#7c5aff" : "#8fa0c2"}
            strokeOpacity={t.active ? 0.85 : 0.25}
            strokeDasharray={t.active ? "5 5" : undefined}
            className={t.active ? "anim-dash" : undefined}
          />
          <rect
            x="252"
            y={t.y}
            width="56"
            height="24"
            rx="4"
            fill="#0a0e19"
            stroke={t.active ? "#a18aff" : "#8fa0c2"}
            strokeOpacity={t.active ? 0.9 : 0.3}
          />
          <text
            x="280"
            y={t.y + 15}
            textAnchor="middle"
            className={`${label} ${t.active ? "fill-volt-bright" : "fill-fog/60"}`}
            style={{ ...labelStyle, fontSize: 7.5 }}
          >
            {t.text}
          </text>
        </g>
      ))}

      <text x="16" y="170" className={`${label} fill-fog/60`} style={labelStyle}>
        goal: automated solver selection
      </text>
    </Frame>
  );
}

export function GPUDiagram() {
  const cells: ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      const active = (i + j) % 3 === 0;
      cells.push(
        <rect
          key={`${i}-${j}`}
          x={112 + i * 18}
          y={52 + j * 18}
          width="14"
          height="14"
          rx="2"
          fill={active ? "#7c5aff" : "#8fa0c2"}
          fillOpacity={active ? 0.5 : 0.1}
          className={active ? "anim-cell" : undefined}
          style={active ? { animationDelay: `${(i * 0.35 + j * 0.2).toFixed(2)}s` } : undefined}
        />,
      );
    }
  }
  return (
    <Frame>
      <rect x="100" y="40" width="120" height="102" rx="6" fill="none" stroke="#8fa0c2" strokeOpacity="0.4" />
      {cells}
      {[0, 1].map((k) => (
        <g key={k}>
          <rect x={k === 0 ? 52 : 240} y="52" width="26" height="78" rx="3" fill="#0a0e19" stroke="#4f8dff" strokeOpacity="0.5" />
          <text
            x={k === 0 ? 65 : 253}
            y="95"
            textAnchor="middle"
            className={`${label} fill-pulse`}
            style={{ ...labelStyle, fontSize: 7 }}
          >
            FLOW
          </text>
        </g>
      ))}
      <path d="M78 91H100M220 91H240" stroke="#4f8dff" strokeOpacity="0.5" strokeDasharray="3 4" className="anim-dash" fill="none" />
      <text x="160" y="170" textAnchor="middle" className={`${label} fill-fog/60`} style={labelStyle}>
        physics-led computation
      </text>
    </Frame>
  );
}

export function FidelityDiagram() {
  const patches = [
    { cx: 62, step: 10 },
    { cx: 160, step: 5 },
    { cx: 258, step: 2.5 },
  ];
  return (
    <Frame>
      <defs>
        <linearGradient id="fidelity-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f8dff" />
          <stop offset="100%" stopColor="#a18aff" />
        </linearGradient>
      </defs>
      {patches.map((p) => (
        <path
          key={p.cx}
          d={gridLines(p.cx - 20, 36, p.cx + 20, 76, p.step)}
          stroke={p.step < 5 ? "#a18aff" : "#8fa0c2"}
          strokeOpacity={p.step === 10 ? 0.3 : p.step === 5 ? 0.35 : 0.5}
          fill="none"
        />
      ))}
      <path d="M30 122H290" stroke="url(#fidelity-grad)" strokeWidth="1.6" fill="none" />
      {[30, 160, 290].map((x) => (
        <path key={x} d={`M${x} 117V127`} stroke="#8fa0c2" strokeOpacity="0.5" fill="none" />
      ))}
      <circle cx="228" cy="122" r="8" fill="none" stroke="#a18aff" strokeOpacity="0.9" className="anim-ping-soft" />
      <circle cx="228" cy="122" r="4" fill="#7c5aff" stroke="#eef1f8" strokeWidth="1" />
      <text x="30" y="146" className={`${label} fill-fog/70`} style={labelStyle}>
        flow scales
      </text>
      <text x="290" y="146" textAnchor="end" className={`${label} fill-volt-bright`} style={labelStyle}>
        finer detail
      </text>
      <text x="30" y="170" className={`${label} fill-fog/50`} style={labelStyle}>
        goal: detail where physics demands
      </text>
    </Frame>
  );
}
