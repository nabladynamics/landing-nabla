"use client";

import { useId } from "react";
import styles from "./approach-visual.module.css";

type Point = readonly [number, number];

// Cosine spacing keeps the leading edge smooth even at small display sizes.
const stations = Array.from({ length: 81 }, (_, index) =>
  (1 - Math.cos((index / 80) * Math.PI)) / 2,
);

function sectionPoint(x: number, upper: boolean, span: number): Point {
  const thickness =
    5 * 0.15 *
    (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x ** 2 +
      0.2843 * x ** 3 - 0.1036 * x ** 4);
  const camber = 0.022 * Math.sin(Math.PI * x);
  const chord = 362 - span * 83;
  return [
    65 + span * 160 + x * chord,
    343 - span * 162 - x * (41 - span * 11) -
      (camber + (upper ? thickness : -thickness)) * chord,
  ];
}

function trace(points: readonly Point[], close = false) {
  return points.map(([x, y], index) =>
    `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`,
  ).join(" ") + (close ? " Z" : "");
}

function surface(upper: boolean, from = 0, to = 1) {
  return trace([
    ...stations.map((x) => sectionPoint(x, upper, from)),
    ...[...stations].reverse().map((x) => sectionPoint(x, upper, to)),
  ], true);
}

function section(span: number) {
  return trace([
    ...stations.map((x) => sectionPoint(x, true, span)),
    ...[...stations].reverse().map((x) => sectionPoint(x, false, span)),
  ], true);
}

const streamlines = [
  "M-15 232 C75 221 123 196 179 191 C269 182 340 199 605 152",
  "M-15 257 C57 249 106 225 155 216 C235 201 317 223 605 181",
  "M-15 286 C32 284 73 257 121 250 C214 237 279 259 605 216",
  "M-15 314 C24 312 37 297 67 291 C125 276 193 289 251 290 C370 289 458 260 605 251",
  "M-15 368 C37 361 56 374 93 379 C173 389 226 362 304 351 C406 335 479 333 605 315",
  "M-15 398 C78 380 99 405 161 401 C267 394 411 373 605 350",
];

/** Editorial geometry study, deliberately separate from a product UI or CFD result. */
export function ApproachVisual() {
  const id = useId().replace(/:/g, "");

  return (
    <figure className={styles.figure}>
      <div className={styles.heading}>
        <p>A clearer view of the physics</p>
        <span aria-hidden="true">↗</span>
      </div>

      <div className={styles.drawing}>
        <svg viewBox="0 0 580 470" fill="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`${id}-surface`} x1="268" y1="163" x2="213" y2="341" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e0e7de" />
              <stop offset=".28" stopColor="#a9beb1" />
              <stop offset=".72" stopColor="#52746b" />
              <stop offset="1" stopColor="#284e48" />
            </linearGradient>
            <linearGradient id={`${id}-underside`} x1="271" y1="204" x2="271" y2="360" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4c6b62" />
              <stop offset="1" stopColor="#183f3b" />
            </linearGradient>
            <linearGradient id={`${id}-section`} x1="212" y1="304" x2="212" y2="362" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f8f3e5" />
              <stop offset="1" stopColor="#ded9c7" />
            </linearGradient>
            <linearGradient id={`${id}-flow`} x1="0" y1="240" x2="580" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#799b94" stopOpacity="0" />
              <stop offset=".19" stopColor="#799b94" stopOpacity=".6" />
              <stop offset=".65" stopColor="#466f67" stopOpacity=".8" />
              <stop offset="1" stopColor="#799b94" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${id}-shadow`}>
              <stop stopColor="#36534a" stopOpacity=".16" />
              <stop offset="1" stopColor="#36534a" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g stroke="#738477" strokeOpacity=".11" strokeWidth=".7">
            <path d="M21 399 352 107M65 436 396 144M158 449 489 157M256 450 561 181" />
            <path d="M26 358 548 285M35 393 560 320M58 426 561 355" />
          </g>
          <ellipse cx="300" cy="362" rx="235" ry="66" fill={`url(#${id}-shadow)`} transform="rotate(-10 300 362)" />

          <g stroke={`url(#${id}-flow)`} strokeWidth="1.35" strokeLinecap="round">
            {streamlines.slice(0, 4).map((path) => <path d={path} key={path} />)}
          </g>

          <path d={surface(false)} fill={`url(#${id}-underside)`} />
          <path d={section(1)} fill="#c8d4c6" stroke="#647e70" strokeWidth=".8" />
          <path d={surface(true)} fill={`url(#${id}-surface)`} stroke="#547166" strokeWidth=".7" />
          {[0.36, 0.7].map((span) => (
            <path d={trace(stations.map((x) => sectionPoint(x, true, span)))} key={span}
              stroke="#d7e3d8" strokeOpacity=".34" strokeWidth=".65" />
          ))}
          <path d={trace([sectionPoint(0, true, 0), sectionPoint(0, true, 1)])} stroke="#e8ede2" strokeWidth="1.5" />
          <path d={surface(true, 0, 0.025)} fill="#c98755" />
          <path d={section(0)} fill={`url(#${id}-section)`} stroke="#a86540" strokeWidth="1.35" />
          <path d="M65 343 427 302" stroke="#968a72" strokeOpacity=".6" strokeWidth=".8" strokeDasharray="3 5" />
          <path d={trace(stations.map((x) => sectionPoint(x, true, .025)))} stroke="#f0d3ac" strokeWidth=".8" />

          <g stroke={`url(#${id}-flow)`} strokeWidth="1.35" strokeLinecap="round">
            {streamlines.slice(4).map((path) => <path d={path} key={path} />)}
          </g>

          <g stroke="#829182" strokeWidth=".85">
            <path d="M202 214 156 116H61" />
            <path d="M238 338 299 419H400" />
            <circle cx="202" cy="214" r="2.5" fill="#eff0e6" />
            <circle cx="238" cy="338" r="2.5" fill="#eff0e6" />
          </g>
        </svg>
        <span className={styles.geometryLabel}>A defined geometry</span>
        <span className={styles.sectionLabel}>Detail you can examine</span>
      </div>

      <div className={styles.evidence}>
        <div><span>Assumptions</span><p>The conditions behind the study</p></div>
        <div><span>Flow detail</span><p>The behaviour around the design</p></div>
        <div><span>Checks</span><p>The basis for confidence</p></div>
      </div>
      <figcaption className={styles.caption}>
        Conceptual study of a wing section. Geometry and flow are illustrative, not simulation results.
      </figcaption>
    </figure>
  );
}
