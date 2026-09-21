"use client";

import { MoveHorizontal } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import styles from "./comparison.module.css";

// Workflow comparison, not entire vendor portfolios. Sources reviewed 2026-09-21.
// Nabla describes the intended product, not measured performance.
const columns = [
  { name: "Nabla AI", description: "In development", highlight: true },
  { name: "Established CFD", description: "Ansys Fluent · STAR-CCM+ · OpenFOAM", highlight: false },
  { name: "AI surrogate models", description: "PhysicsX · Neural Concept", highlight: false },
];

const rows = [
  {
    label: "Preparing the geometry",
    cells: [
      "Automated preparation without a conventional volume mesh.",
      "Volume meshing and solver setup, with automation options.",
      "Geometry inputs prepared for a trained or pre-trained model.",
    ],
  },
  {
    label: "Physical basis",
    cells: [
      "A new adaptive CFD engine, with physical simulation at its core.",
      "Numerical solution of the governing physical equations.",
      "Predictions learned from simulation or experimental data.",
    ],
  },
  {
    label: "Level of detail",
    cells: [
      "Resolution concentrated where the flow needs it.",
      "Mesh refinement and numerical settings, including adaptive options.",
      "Detail depends on the training data and model architecture.",
    ],
  },
  {
    label: "Confidence in the result",
    cells: [
      "Physical results accompanied by assumptions, checks and limitations.",
      "Convergence, mesh sensitivity and validation checks.",
      "Model validation, applicability checks and uncertainty assessment.",
    ],
  },
  {
    label: "Sharing the findings",
    cells: [
      "Detailed reports generated for the project and client.",
      "Post-processing and reporting tools, configured for the study.",
      "Predicted fields and performance metrics in engineering applications.",
    ],
  },
];

const sources = [
  { name: "Ansys Fluent", href: "https://ansys.synopsys.com/products/fluids/ansys-fluent/capabilities" },
  { name: "Siemens STAR-CCM+", href: "https://www.siemens.com/en-us/products/simcenter/fluids-thermal-simulation/star-ccm/" },
  { name: "OpenFOAM", href: "https://doc.cfd.direct/openfoam/user-guide-v13/mesh" },
  { name: "PhysicsX", href: "https://www.physicsx.ai/platform" },
  { name: "Neural Concept", href: "https://www.neuralconcept.com/post/the-importance-of-uncertainty-quantification-for-deep-learning-models-in-cae" },
];

export function Comparison() {
  return (
    <section id="compare" className={styles.section} aria-labelledby="comparison-title">
      <div className={styles.inner}>
        <Reveal className={styles.heading}>
          <h2 id="comparison-title">How the approaches compare</h2>
          <p>From preparing a design to sharing the findings. Where established tools focus, and what we’re building at Nabla.</p>
        </Reveal>

        <Reveal delay={.08}>
          <p className={styles.scrollHint} id="comparison-scroll-hint"><MoveHorizontal size={15} aria-hidden="true" />Scroll to compare</p>
          <div className={styles.viewport} role="region" aria-label="CFD workflow comparison" aria-describedby="comparison-note comparison-scroll-hint" tabIndex={0}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Nabla’s intended workflow compared with established CFD and AI surrogate approaches</caption>
              <colgroup><col className={styles.criteriaColumn} />{columns.map((column) => <col key={column.name} />)}</colgroup>
              <thead>
                <tr>
                  <th scope="col" className={styles.criteriaHeading}>The workflow</th>
                  {columns.map((column) => <th scope="col" key={column.name} className={column.highlight ? styles.nabla : undefined}>
                    <span className={styles.columnName}>{column.name}</span>
                    <span className={column.highlight ? styles.status : styles.columnDescription}>{column.description}</span>
                  </th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.cells.map((cell, index) => <td key={columns[index].name} className={columns[index].highlight ? styles.nabla : undefined}>{cell}</td>)}
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className={styles.notes}>
            <p id="comparison-note">Nabla’s column describes our intended workflow. Established products can combine these approaches; capabilities vary by tool and configuration.</p>
            <details className={styles.sources}>
              <summary>Sources and scope</summary>
              <p>Workflow comparison based on public product documentation, reviewed September 2026. This is not a performance benchmark.</p>
              <ul>{sources.map((source) => <li key={source.name}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.name}<span className={styles.srOnly}> (opens in a new tab)</span></a></li>)}</ul>
            </details>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
