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

const intendedWorkflow = [
  {
    stage: "Geometry",
    title: "Bring the design. Skip the manual mesh.",
    text: "Automated preparation, without conventional, geometry-fitted volumetric meshing.",
  },
  {
    stage: "Simulation",
    title: "Let the physics guide the computation.",
    text: "Resolution concentrated where the flow requires it, with physical simulation at the core.",
  },
  {
    stage: "Results",
    title: "Turn results into a clear report.",
    text: "Detailed reports generated from the results, tailored to the project, the client and the questions that matter.",
  },
];

export function WorkflowStory() {
  const processRef = useRef<HTMLElement>(null);
  const [processVisible, setProcessVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [animationsPaused, setAnimationsPaused] = useState(false);
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
            <p>With conventional CFD, faster iteration can mean lower resolution. Building confidence in the results takes refinement and repeat runs — more time, more compute and more pressure on engineers.</p>
          </div>
        </Reveal>
      </div>
    </section>

    <section id="approach" className={styles.solution} aria-labelledby="workflow-solution-title">
      <div className={styles.inner}>
        <Reveal>
          <p className={styles.eyebrow}>The approach we’re developing</p>
          <div className={styles.solutionHeader}>
            <h2 id="workflow-solution-title">Less friction.<br /><em>More understanding.</em></h2>
            <div className={styles.solutionIntro}>
              <p>We’re developing a new CFD engine to make physical simulation easier to use and understand.</p>
              <p>AI can accelerate exploration. When predictions are difficult to inspect, engineers still need physical evidence, clear assumptions and explicit limitations.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={.08}>
          <ol className={styles.newSteps} aria-label="Our intended workflow">
            {intendedWorkflow.map((step, index) => <li key={step.stage}>
              <div className={styles.stageLabel}><span>{step.stage}</span>{index < intendedWorkflow.length - 1 && <ArrowRight size={17} aria-hidden="true" />}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>)}
          </ol>
        </Reveal>

        <div className={styles.solutionFooter}>
          <div className={styles.goals} aria-label="Development goals">
            <p>What we’re working towards</p>
            <ul><li>Faster simulations</li><li>Lower computing costs</li><li>Higher resolution</li></ul>
          </div>
          <Link href="/contact" className={styles.link}>Talk about your project <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
        <p className={styles.developmentNote}>Nabla is in development. This is the workflow we are working towards; the benefits above are development goals. The animated scenes are illustrative, not simulation results.</p>
      </div>
    </section>
  </div>;
}
