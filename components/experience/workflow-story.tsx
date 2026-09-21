"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { StyleLink as Link } from "@/components/style-link";
import { Reveal } from "@/components/ui/reveal";
import styles from "./workflow-story.module.css";

const friction = [
  {
    title: "Days before the first run.",
    text: "Software configuration, geometry preparation and manual meshing can take days before a simulation even starts.",
  },
  {
    title: "Days in. Back to the beginning.",
    text: "A run can fail after days of computation. Diagnose the problem, revisit the setup and start again.",
  },
  {
    title: "Same geometry. Different answers.",
    text: "Different meshes, settings and modelling choices can lead teams to different results — and more work to understand why.",
  },
];

const reportViews = {
  engineering: {
    label: "Engineering review",
    title: "The detail behind the decision.",
    audience: "Engineering team",
    sections: ["Geometry & boundary conditions", "Flow fields & integrated forces", "Convergence, checks & limitations"],
    footer: "Methods, assumptions and evidence, kept together.",
  },
  client: {
    label: "Client handover",
    title: "The findings that move a project forward.",
    audience: "Project stakeholders",
    sections: ["Project objectives & design context", "Key findings & design comparisons", "Assumptions, limitations & next steps"],
    footer: "A clear summary, with the technical detail still attached.",
  },
};

function ProcessDrawing({ step }: { step: number }) {
  return <svg viewBox="0 0 220 100" fill="none" aria-hidden="true">
    {step === 0 && <g stroke="currentColor" strokeWidth="1.1">
      <path d="m61 32 47-21 51 23-49 24-49-26Zm0 0v39l49 24 49-24V34M110 58v37" />
      <path d="m61 71 47-21 51 21M108 11v39" opacity=".25" strokeDasharray="3 4" />
      <path d="M29 28h14M36 21v14M176 70h14M183 63v14" opacity=".45" />
    </g>}
    {step === 1 && <g stroke="currentColor" strokeWidth=".8">
      <path d="M21 78 70 29l76-15 53 44-54 31-78-2-46-9Z" />
      <path d="m21 78 53-16-4-33 37 20 39-35 10 35 43 9-54 3v28l-36-20-42 18 7-25 35 7-2-20 49 0-11 12-36 8M70 29l76-15M74 62l33-13M67 87l-8-35 48-3M145 89l11-40M199 58l-42 15-12 16M107 49l20-31M74 62 41 57M145 61l-18-43" />
      <path d="M21 94h178" opacity=".18" />
    </g>}
    {step === 2 && <g stroke="currentColor" strokeWidth="1.2">
      <path d="M24 16v66h172" opacity=".25" />
      <path d="m29 25 14 14 15-4 15 16 15-1 15 16 13-4 14 10 15-3 9 5" />
      <path d="m154 74 10-27 11 7 17-39" className={styles.warningStroke} />
      <circle cx="192" cy="15" r="4" className={styles.warningStroke} />
    </g>}
    {step === 3 && <g stroke="currentColor" strokeWidth="1.2">
      <path d="M24 16v66h172" opacity=".25" />
      <path d="M30 69c32 0 38-48 73-48s44 28 85 28" />
      <path d="M30 69c32 0 44-29 73-29s47-1 85-1" opacity=".45" />
      <path d="M30 69c35 0 42-6 73-6s47 9 85 9" className={styles.warningStroke} />
      <circle cx="192" cy="49" r="3" /><circle cx="192" cy="39" r="3" opacity=".45" /><circle cx="192" cy="72" r="3" className={styles.warningStroke} />
    </g>}
  </svg>;
}

function ReportDrawing() {
  return <svg viewBox="0 0 440 170" fill="none" aria-hidden="true">
    {[22, 43, 64, 86, 108, 130, 151].map((y, i) => <path key={y}
      d={`M0 ${y} C75 ${y}, 93 ${y - (i < 3 ? 8 : 0)}, 137 ${y - (i < 3 ? 20 : i > 3 ? -12 : 0)} S249 ${y}, 440 ${y}`}
      stroke={i === 2 ? "#b56d48" : "#578b90"} strokeWidth={i === 2 ? 1.5 : 1} opacity={i === 0 || i === 6 ? .35 : .7} />)}
    <path d="M104 88c18-34 82-31 204 0-97 7-180 18-204 0Z" fill="#e2e7e0" stroke="#526c65" strokeWidth="1.2" />
    <path d="M107 88h200" stroke="#526c65" strokeDasharray="3 4" opacity=".35" />
  </svg>;
}

export function WorkflowStory() {
  const [reportView, setReportView] = useState<keyof typeof reportViews>("engineering");
  const report = reportViews[reportView];

  return <div className={styles.story}>
    <section id="perspective" className={styles.problem} aria-labelledby="workflow-problem-title">
      <div className={styles.inner}>
        <Reveal>
          <p className={styles.eyebrow}>The work behind the answer</p>
          <div className={styles.intro}>
            <h2 id="workflow-problem-title">Engineering is hard.<br /><em>The workflow shouldn’t be.</em></h2>
            <p>Too often, getting a physical answer means navigating a long chain of manual work, waiting and uncertainty.</p>
          </div>
        </Reveal>

        <Reveal delay={.08}>
          <figure className={styles.process}>
            <figcaption><span>A conventional CFD workflow</span><span>Where progress can stall</span></figcaption>
            <ol className={styles.processSteps}>
              {["Prepare", "Mesh", "Run", "Interpret"].map((step, index) => <li key={step}>
                <div className={styles.stepHeading}><span>{step}</span>{index < 3 && <ArrowRight size={18} aria-hidden="true" />}</div>
                <ProcessDrawing step={index} />
                <span className={styles.stepNote}>{["Configure the case", "Resolve the geometry", "Wait for convergence", "Reconcile the results"][index]}</span>
              </li>)}
            </ol>
            <div className={styles.returnPath}><RotateCcw size={15} aria-hidden="true" /><span>A failed run can send the work back to setup.</span></div>
          </figure>
        </Reveal>

        <div className={styles.friction}>
          {friction.map((item, index) => <Reveal key={item.title} delay={index * .07}>
            <article><span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.text}</p></article>
          </Reveal>)}
        </div>
        <Reveal>
          <div className={styles.humanCost}>
            <p>The cost is more than compute.</p>
            <p>Lost time. Fewer design iterations. Engineers worn down by repeated troubleshooting instead of doing the work they set out to do.</p>
          </div>
        </Reveal>
      </div>
    </section>

    <section className={styles.solution} aria-labelledby="workflow-solution-title">
      <div className={styles.inner}>
        <Reveal>
          <div className={styles.principle}>
            <span className={styles.principleMark} aria-hidden="true">↳</span>
            <div><p>Faster predictions are not enough.</p><p>ML can accelerate exploration. But when a model’s assumptions and limits are hidden, speed alone cannot establish trust. Engineering decisions still need physical evidence.</p></div>
          </div>
        </Reveal>

        <div className={styles.solutionGrid}>
          <div className={styles.solutionCopy}>
            <Reveal>
              <p className={styles.eyebrow}>The workflow we’re building</p>
              <h2 id="workflow-solution-title">Less friction.<br /><em>More understanding.</em></h2>
              <p className={styles.solutionLead}>A new CFD engine, grounded in physics. An intuitive path from your geometry to results you can examine, explain and share.</p>
            </Reveal>
            <ol className={styles.newSteps}>
              <li><span>01</span><div><h3>Bring the design. Skip the manual mesh.</h3><p>Automated preparation, without conventional, geometry-fitted volumetric meshing.</p></div></li>
              <li><span>02</span><div><h3>Let the physics guide the computation.</h3><p>Concentrate resolution where the flow requires it, with physical simulation at the core.</p></div></li>
              <li><span>03</span><div><h3>Turn results into a clear report.</h3><p>A detailed report generated with the results, tailored to the project, the client and the questions that matter.</p></div></li>
            </ol>
            <Link href="/contact" className={styles.link}>Talk about your project <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>

          <Reveal delay={.12} className={styles.reportColumn}>
            <div className={styles.reportDemo}>
              <div className={styles.reportControls}>
                <p>One study. The right level of detail.</p>
                <div className={styles.reportSwitch} role="group" aria-label="Report audience">
                  {(Object.keys(reportViews) as (keyof typeof reportViews)[]).map((view) => <button key={view} type="button" aria-pressed={reportView === view} aria-controls="report-preview" onClick={() => setReportView(view)}>{reportViews[view].label}</button>)}
                </div>
              </div>
              <div id="report-preview" className={styles.reportPaper} aria-live="polite" aria-atomic="true">
                <div className={styles.reportHeader}><span>Nabla AI</span><span>Illustrative report</span></div>
                <div className={styles.reportTitle}><p>External aerodynamics</p><h3>{report.title}</h3></div>
                <div className={styles.reportMeta}><span>Prepared for</span><span>{report.audience}</span></div>
                <div className={styles.reportFigure}><ReportDrawing /><span>Flow visualisation · schematic</span></div>
                <ol className={styles.reportContents}>{report.sections.map((section, index) => <li key={section}><span>{String(index + 1).padStart(2, "0")}</span>{section}</li>)}</ol>
                <p className={styles.reportFooter}>{report.footer}</p>
              </div>
              <p className={styles.previewNote}>Report concept. Content and presentation adapted to each project.</p>
            </div>
          </Reveal>
        </div>

        <div className={styles.goals} aria-label="Development goals">
          <p>What we’re working towards</p>
          <ul><li>Faster simulations</li><li>Lower computing costs</li><li>Higher resolution</li></ul>
        </div>
        <p className={styles.developmentNote}>Nabla is in development. The workflow and report shown here describe our intended experience, not demonstrated performance. Visuals are illustrative, not simulation results.</p>
      </div>
    </section>
  </div>;
}
