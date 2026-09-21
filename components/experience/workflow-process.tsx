import styles from "./workflow-process.module.css";

type Point = readonly [number, number];
type Quad = readonly [Point, Point, Point, Point];

const faces: readonly Quad[] = [
  [[64, 35], [109, 15], [158, 38], [112, 60]],
  [[64, 35], [112, 60], [112, 102], [64, 77]],
  [[112, 60], [158, 38], [158, 80], [112, 102]],
];

function pointOnFace([a, b, c, d]: Quad, u: number, v: number): Point {
  return [
    a[0] * (1 - u) * (1 - v) + b[0] * u * (1 - v) + c[0] * u * v + d[0] * (1 - u) * v,
    a[1] * (1 - u) * (1 - v) + b[1] * u * (1 - v) + c[1] * u * v + d[1] * (1 - u) * v,
  ];
}

function segment(a: Point, b: Point) {
  return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
}

/** Nested, conforming subdivisions of each planar face; never a random lattice. */
function triangulate(face: Quad, divisions: number) {
  let drawing = "";
  for (let i = 1; i < divisions; i++) {
    const t = i / divisions;
    drawing += segment(pointOnFace(face, t, 0), pointOnFace(face, t, 1));
    drawing += segment(pointOnFace(face, 0, t), pointOnFace(face, 1, t));
  }
  for (let row = 0; row < divisions; row++) {
    for (let column = 0; column < divisions; column++) {
      drawing += segment(
        pointOnFace(face, column / divisions, row / divisions),
        pointOnFace(face, (column + 1) / divisions, (row + 1) / divisions),
      );
    }
  }
  return drawing;
}

const meshLevels = [2, 4, 8].map((divisions) => faces.map((face) => triangulate(face, divisions)));
const convergence = "M31 27 43 43 54 39 65 58 76 54 87 73 98 69 109 84 120 81 132 91 142 89 150 93";
const divergence = "M150 93C155 88 157 72 163 64L171 70C179 58 185 35 190 21";
const comparisons = [
  "M31 89C53 89 59 47 91 39S145 28 188 32",
  "M31 89C60 89 67 66 94 61S149 66 188 63",
  "M31 89C60 89 72 81 100 84S151 96 188 93",
];

function PrismFaces() {
  return <>
    <path d="M64 35 109 15 158 38 112 60Z" className={styles.faceTop} />
    <path d="M64 35 112 60 112 102 64 77Z" className={styles.faceLeft} />
    <path d="M112 60 158 38 158 80 112 102Z" className={styles.faceRight} />
  </>;
}

function Axes() {
  return <g className={styles.axes}>
    <path d="M23 17V103H202" />
    <path d="M23 36H27M23 58H27M23 80H27M61 103V99M105 103V99M149 103V99M193 103V99" />
  </g>;
}

/** Small vector narratives. The parent pauses them when their figure is hidden. */
export function ProcessDrawing({ step, running }: { step: number; running: boolean }) {
  return <svg viewBox={step < 2 ? "30 0 160 120" : "0 0 220 120"} fill="none" aria-hidden="true"
    className={styles.drawing} data-running={running ? "true" : "false"}>
    {step === 0 && <>
      <path d="M54 111H166" className={styles.ground} />
      <g className={styles.prepareObject} data-motion="true">
        <g className={styles.dimensions}>
          <path d="M53 81 103 107M51 77 55 85M101 103 105 111M64 77 54 83M112 102 104 108" />
          <path d="M174 38V80M170 38H178M170 80H178M160 38H172M160 80H172" />
        </g>
        <PrismFaces />
        <path d="M64 77 109 57 158 80M109 15V57" className={styles.hiddenEdges} />
        <path d="M64 35 109 15 158 38 158 80 112 102 64 77ZM64 35 112 60 158 38M112 60V102" className={styles.outline} />
        <g className={styles.handles}>
          <rect x="61.7" y="32.7" width="4.6" height="4.6" rx=".5" />
          <rect x="155.7" y="35.7" width="4.6" height="4.6" rx=".5" />
          <rect x="109.7" y="99.7" width="4.6" height="4.6" rx=".5" />
        </g>
        <circle cx="158" cy="38" r="7.5" className={styles.editFocus} data-motion="true" />
      </g>
    </>}

    {step === 1 && <>
      <path d="M54 111H166" className={styles.ground} />
      <PrismFaces />
      <g className={styles.meshCoarse} data-motion="true">
        {meshLevels[0].map((drawing, index) => <path key={index} d={drawing} />)}
      </g>
      {meshLevels[1].map((drawing, index) => <path key={`middle-${index}`} d={drawing}
        className={`${styles.meshMiddle} ${[styles.middleTop, styles.middleLeft, styles.middleRight][index]}`} data-motion="true" />)}
      {meshLevels[2].map((drawing, index) => <path key={`fine-${index}`} d={drawing}
        className={`${styles.meshFine} ${[styles.fineTop, styles.fineLeft, styles.fineRight][index]}`} data-motion="true" />)}
      <path d="M64 35 109 15 158 38 158 80 112 102 64 77ZM64 35 112 60 158 38M112 60V102" className={styles.outline} />
    </>}

    {step === 2 && <>
      <Axes />
      <path d="M31 94H197" className={styles.convergenceGuide} />
      <path d={convergence} className={styles.traceGhost} />
      <path d={divergence} className={`${styles.traceGhost} ${styles.copper}`} />
      <path d={convergence} pathLength="100" className={`${styles.drawLine} ${styles.runTrace}`} data-motion="true" />
      <path d={divergence} pathLength="100" className={`${styles.drawLine} ${styles.copper} ${styles.runDivergence}`} data-motion="true" />
      <circle cx="31" cy="27" r="2.1" className={styles.startPoint} />
      <g className={`${styles.failureMark} ${styles.reveal}`} data-motion="true">
        <circle cx="190" cy="21" r="8.2" />
        <path d="M187.3 18.3 192.7 23.7M192.7 18.3 187.3 23.7" />
      </g>
    </>}

    {step === 3 && <>
      <Axes />
      {comparisons.map((drawing, index) => <path key={`ghost-${index}`} d={drawing}
        className={`${styles.traceGhost} ${index === 2 ? styles.copper : ""}`} />)}
      {comparisons.map((drawing, index) => <path key={index} d={drawing} pathLength="100"
        className={`${styles.drawLine} ${[styles.compareFirst, styles.compareSecond, styles.compareThird][index]}`} data-motion="true" />)}
      <circle cx="31" cy="89" r="2.25" className={styles.startPoint} />
      <g className={`${styles.comparisonCue} ${styles.reveal}`} data-motion="true">
        <path d="M196 32H201V93H196M190 63H201" />
      </g>
      {[32, 63, 93].map((y, index) => <circle key={y} cx="188" cy={y} r="3"
        className={`${styles.endPoint} ${styles.compareEndpoint} ${styles.reveal} ${index === 2 ? styles.copper : index === 1 ? styles.secondary : ""}`} data-motion="true" />)}
    </>}
  </svg>;
}
