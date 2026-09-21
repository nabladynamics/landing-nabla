"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import { StyleLink as Link } from "@/components/style-link";
import { Reveal } from "@/components/ui/reveal";
import { ProcessDrawing } from "./workflow-process";
import styles from "./workflow-story.module.css";

const friction = [
  {
    title: "Days in preparation.",
    text: "Setup and manual meshing delay the first run.",
  },
  {
    title: "Time lost to restarts.",
    text: "A failed simulation can waste days of compute.",
  },
  {
    title: "Same design. Different answers.",
    text: "Different teams’ setup choices can change the result.",
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
  const processRef = useRef<HTMLElement>(null);
  const [processVisible, setProcessVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [animationsPaused, setAnimationsPaused] = useState(false);
  const [reportView, setReportView] = useState<keyof typeof reportViews>("engineering");
  const report = reportViews[reportView];
  const processRunning = processVisible && pageVisible && !animationsPaused;

  useEffect(() => {
    const figure = processRef.current;
    if (!figure) return;
    const observer = new IntersectionObserver(([entry]) => setProcessVisible(entry.isIntersecting), { threshold: .1 });
    observer.observe(figure);
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  return <div className={styles.story}>
    <section id="perspective" className={styles.problem} aria-labelledby="workflow-problem-title">
      <div className={styles.inner}>
        <Reveal>
          <p className={styles.eyebrow}>The work behind the answer</p>
          <div className={styles.intro}>
            <h2 id="workflow-problem-title">Engineering is hard.<br /><em>The workflow shouldn’t be.</em></h2>
            <p>Manual setup. Long waits. Uncertain results. Too much work between a design and an answer.</p>
          </div>
        </Reveal>

        <Reveal delay={.08}>
          <figure ref={processRef} className={styles.process} data-running={processRunning}>
            <figcaption><span>A conventional CFD workflow</span><button type="button" className={styles.animationToggle} aria-label={animationsPaused ? "Play workflow animations" : "Pause workflow animations"} aria-controls="conventional-workflow" onClick={() => setAnimationsPaused((paused) => !paused)}>{animationsPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{animationsPaused ? "Play" : "Pause"}</button></figcaption>
            <ol id="conventional-workflow" className={styles.processSteps}>
              {["Prepare", "Mesh", "Run", "Interpret"].map((step, index) => <li key={step}>
                <div className={styles.stepHeading}><span>{step}</span>{index < 3 && <ArrowRight size={18} aria-hidden="true" />}</div>
                <ProcessDrawing step={index} running={processRunning} />
                <span className={styles.stepNote}>{["Configure the case", "Resolve the geometry", "Wait for convergence", "Reconcile the results"][index]}</span>
              </li>)}
            </ol>
            <div className={styles.returnPath}><RotateCcw size={15} aria-hidden="true" /><span>Failure can send you back to setup.</span></div>
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
            <p>More rework. Fewer iterations. Exhausted engineers.</p>
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
