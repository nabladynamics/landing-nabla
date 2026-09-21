"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Team } from "@/components/sections/team";
import { ArrowDown, ArrowUpRight, MoveDown, MoveHorizontal, RotateCcw } from "lucide-react";
import { chapters } from "./chapters";
import { WorkflowStory } from "./workflow-story";
import styles from "./spatial-experience.module.css";

type RotationState = { enabled: boolean; rotated: boolean };
type SceneController = {
  setProgress: (progress: number) => void;
  setReducedMotion: (reduced: boolean) => void;
  resetRotation: () => void;
  dispose: () => void;
};
type SceneModule = {
  mountExperience: (canvas: HTMLCanvasElement, options: {
    onError: () => void; onReady: () => void; reducedMotion: boolean;
    interactionElement: HTMLDivElement | null; onRotationState: (state: RotationState) => void;
  }) => SceneController;
};

export function SpatialExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneController | null>(null);
  const reducedMotionRef = useRef(false);
  const progressRef = useRef(0);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [rotation, setRotation] = useState<RotationState>({ enabled: false, rotated: false });
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = media.matches;
      sceneRef.current?.setReducedMotion(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setReady(false);
    setRotation({ enabled: false, rotated: false });
    if (failed || !canvasRef.current) return;
    let cancelled = false;
    // Local, version-pinned ES modules load the 3D scene only on the Spatial home.
    const moduleUrl = "/experience/scene.js";
    import(/* webpackIgnore: true */ moduleUrl)
      .then((module: SceneModule) => {
        if (cancelled || !canvasRef.current) return;
        sceneRef.current = module.mountExperience(canvasRef.current, {
          onError: () => { if (!cancelled) setFailed(true); },
          onReady: () => { if (!cancelled) setReady(true); },
          reducedMotion: reducedMotionRef.current,
          interactionElement: interactionRef.current,
          onRotationState: (state) => { if (!cancelled) setRotation(state); },
        });
        sceneRef.current.setProgress(progressRef.current);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [failed]);

  useEffect(() => {
    if (failed) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = journeyRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, travel)));
      progressRef.current = progress;
      sceneRef.current?.setProgress(progress);
      rootRef.current?.style.setProperty("--journey-progress", String(progress));
      const index = Math.min(chapters.length - 1, Math.round(progress * (chapters.length - 1)));
      if (index !== activeRef.current) {
        activeRef.current = index;
        setActive(index);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [failed]);

  useEffect(() => {
    copyRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);

  const goTo = useCallback((index: number) => {
    const section = journeyRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + (index / (chapters.length - 1)) * travel,
      behavior: reducedMotionRef.current ? "instant" : "smooth",
    });
  }, []);

  return (
    <div ref={rootRef} className={styles.experience} data-spatial-view={failed ? "standard" : "spatial"}>
      <Navbar />

      <main id="main">
        {!failed ? <section ref={journeyRef} className={styles.journey} aria-label="A spatial journey through engineering">
          <div className={styles.stage}>
            <div className={styles.scene} aria-hidden="true">
              {/* Reveal only the fully prepared scene at its current camera position. */}
              <canvas ref={canvasRef} className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`} />
            </div>
            <div className={styles.sceneWash} aria-hidden="true" />
            <div ref={interactionRef} className={styles.rotationSurface} role="slider"
              aria-label="Rotate exhibit" aria-describedby="rotation-help" aria-orientation="horizontal"
              aria-valuemin={-180} aria-valuemax={180} aria-valuenow={0} aria-disabled="true" tabIndex={-1} />
            <div className={styles.rotationControls} hidden={!ready || !rotation.enabled}>
              <span id="rotation-help"><MoveHorizontal size={15} aria-hidden="true" />Drag to rotate<span className={styles.keyboardHelp}>. Use left and right arrow keys to rotate, or Home to reset.</span></span>
              <button type="button" onClick={() => sceneRef.current?.resetRotation()} disabled={!rotation.rotated} aria-label="Reset model rotation"><RotateCcw size={13} aria-hidden="true" />Reset view</button>
            </div>
            <div className={styles.sceneLabel}><span className={styles.liveDot} />Engineering in motion</div>
            <a href="#perspective" className={styles.skip}>Skip the journey <ArrowDown size={14} /></a>

            <div ref={copyRef} className={styles.copy} role="region" aria-label="Current chapter" tabIndex={0}>
              {chapters.map((chapter, index) => <article key={chapter.id} hidden={active !== index} className={styles.chapter} data-chapter={chapter.id}>
                <p className={styles.eyebrow}><span>{String(index + 1).padStart(2, "0")}</span>{chapter.label}</p>
                {index === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}
                <p className={styles.body}>{chapter.body}</p>
                <Link href={chapter.href} className={styles.textLink}>{chapter.link}<ArrowUpRight size={18} /></Link>
              </article>)}
            </div>
            <p className={styles.objectNote} data-thermal={active === 4 ? "true" : undefined}>
              {active === 4 ? <><span className={styles.coolLegend}>Cool supply</span><span className={styles.warmLegend}>Warm return</span></> : chapters[active].note}
            </p>
            <div className={styles.bottomBar}>
              <button className={styles.scrollPrompt} onClick={() => active < chapters.length - 1 ? goTo(active + 1) : document.getElementById("perspective")?.scrollIntoView({ behavior: reducedMotionRef.current ? "instant" : "smooth" })}>
                <MoveDown size={20} /><span>{active === 0 ? "Scroll to explore" : active === chapters.length - 1 ? "Discover Nabla" : "Keep exploring"}</span>
              </button>
              <nav className={styles.chapterNav} aria-label="Journey chapters">
                {chapters.map((chapter, index) => <button key={chapter.id} aria-label={`Go to ${chapter.label}`} aria-current={active === index ? "step" : undefined} onClick={() => goTo(index)}><span>{chapter.short}</span><i /></button>)}
              </nav>
            </div>
            <div className={styles.progressTrack} aria-hidden="true"><div /></div>
          </div>
        </section> : <section className={styles.standardJourney} aria-label="Engineering applications">
          <div className={styles.standardControls}><span>A different perspective on CFD</span></div>
          {chapters.map((chapter, index) => <article className={styles.standardChapter} key={chapter.id} id={chapter.id}>
            <div><p className={styles.eyebrow}>{chapter.label}</p>{index === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}<p className={styles.body}>{chapter.body}</p><Link href={chapter.href} className={styles.textLink}>{chapter.link}<ArrowUpRight size={18} /></Link></div>
          </article>)}
        </section>}

        <WorkflowStory />
        <Team />
        <section className={styles.contact}><h2>What are you<br />working towards?</h2><Link href="/contact" className={styles.contactButton}>Let’s start a conversation <ArrowUpRight size={20} /></Link><p>We would love to hear from engineering teams, researchers and investors.</p></section>
      </main>
      <Footer />
    </div>
  );
}
