"use client";

import { useEffect, useRef } from "react";

/**
 * Live CFD-style visualisation: free stream past a cylinder with a shedding
 * vortex street, drawn as advected streaklines, plus a quadtree mesh that
 * refines around the cylinder wall and the wake vortices — the visual
 * argument for concentrating compute where the physics happens.
 *
 * Two stacked canvases: `trail` accumulates fading streaklines, `mesh` is
 * redrawn crisp every other frame. Falls back to a static streamline plot
 * when prefers-reduced-motion is set, and pauses off-screen / hidden tabs.
 */

const BG = "#060910";
const VORTEX_LIFE = 9500;
const SPAWN_INTERVAL = 1300;

type Vortex = { x: number; y: number; sign: 1 | -1; age: number };
type Particle = { x: number; y: number; life: number };

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export function FlowCanvas({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  const meshRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const trailCanvas = trailRef.current;
    const meshCanvas = meshRef.current;
    if (!wrap || !trailCanvas || !meshCanvas) return;

    const trail = trailCanvas.getContext("2d", { alpha: false });
    const mesh = meshCanvas.getContext("2d");
    if (!trail || !mesh) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let frame = 0;
    let onScreen = true;
    let spawnTimer = 600;
    let spawnSign: 1 | -1 = 1;
    let particles: Particle[] = [];
    let vortices: Vortex[] = [];

    // Scene geometry, derived from the canvas size on resize.
    let cx = 0;
    let cy = 0;
    let R = 1;
    let U = 0.1; // free-stream speed, px/ms
    let gamma = 1; // vortex strength
    let core2 = 1; // vortex core radius squared
    let maxDepth = 6;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const envelope = (v: Vortex) =>
      clamp(v.age / 350, 0, 1) * Math.exp(-v.age / 5200);

    /** Potential flow past the cylinder plus a mild wake oscillation. */
    const baseVelocity = (x: number, y: number, t: number, out: number[]) => {
      const dx = x - cx;
      const dy = y - cy;
      const r2 = dx * dx + dy * dy;
      if (r2 < R * R * 0.9) {
        out[0] = 0;
        out[1] = 0;
        return;
      }
      const k = (R * R) / r2;
      out[0] = U * (1 - (k * (dx * dx - dy * dy)) / r2);
      out[1] = U * ((-k * 2 * dx * dy) / r2);
      if (dx > 0) {
        const spread = R * 1.8;
        const wake =
          Math.exp(-(dy * dy) / (2 * spread * spread)) *
          Math.exp(-dx / (R * 10));
        out[1] += U * 0.12 * Math.sin(t * 0.0014 + dx * 0.02) * wake;
      }
    };

    const velocity = (x: number, y: number, t: number, out: number[]) => {
      baseVelocity(x, y, t, out);
      for (const v of vortices) {
        const rx = x - v.x;
        const ry = y - v.y;
        const d2 = rx * rx + ry * ry + core2;
        const g = (v.sign * gamma * envelope(v)) / d2;
        out[0] += -ry * g;
        out[1] += rx * g;
      }
    };

    /** Local "importance" field driving the adaptive mesh refinement. */
    const importance = (x: number, y: number) => {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) - R;
      let imp = Math.exp(-(dist * dist) / (R * R * 0.55));
      if (dx > 0) {
        imp +=
          0.34 *
          Math.exp(-(dy * dy) / (2 * R * R * 2.6)) *
          Math.exp(-dx / (R * 9));
      }
      for (const v of vortices) {
        const rx = x - v.x;
        const ry = y - v.y;
        imp += 1.05 * envelope(v) * Math.exp(-(rx * rx + ry * ry) / (R * R * 1.4));
      }
      return imp;
    };

    const cellImportance = (x: number, y: number, s: number) => {
      let m0 = importance(x + s / 2, y + s / 2);
      m0 = Math.max(m0, importance(x, y));
      m0 = Math.max(m0, importance(x + s, y));
      m0 = Math.max(m0, importance(x, y + s));
      m0 = Math.max(m0, importance(x + s, y + s));
      return m0;
    };

    const drawCell = (x: number, y: number, s: number, depth: number) => {
      if (depth >= 2 && depth < maxDepth && cellImportance(x, y, s) > 0.26 + 0.17 * (depth - 2)) {
        const h = s / 2;
        drawCell(x, y, h, depth + 1);
        drawCell(x + h, y, h, depth + 1);
        drawCell(x, y + h, h, depth + 1);
        drawCell(x + h, y + h, h, depth + 1);
        return;
      }
      if (depth < 2) {
        const h = s / 2;
        drawCell(x, y, h, depth + 1);
        drawCell(x + h, y, h, depth + 1);
        drawCell(x, y + h, h, depth + 1);
        drawCell(x + h, y + h, h, depth + 1);
        return;
      }
      mesh.strokeStyle =
        depth <= 2
          ? "rgba(148, 163, 198, 0.09)"
          : `rgba(150, 116, 255, ${(0.07 + 0.055 * (depth - 2)).toFixed(3)})`;
      mesh.strokeRect(x + 0.5, y + 0.5, s, s);
    };

    const drawMeshLayer = () => {
      mesh.clearRect(0, 0, width, height);
      const s = Math.max(width, height);
      drawCell(0, 0, s, 0);
      // Cylinder body.
      mesh.beginPath();
      mesh.arc(cx, cy, R, 0, Math.PI * 2);
      mesh.fillStyle = "rgba(10, 14, 25, 0.92)";
      mesh.fill();
      mesh.strokeStyle = "rgba(161, 138, 255, 0.65)";
      mesh.lineWidth = 1.2;
      mesh.stroke();
      mesh.lineWidth = 1;
      // Vortex core glows.
      for (const v of vortices) {
        const e = envelope(v);
        if (e < 0.03) continue;
        const rad = R * 1.7;
        const g = mesh.createRadialGradient(v.x, v.y, 0, v.x, v.y, rad);
        const tint =
          v.sign > 0 ? "rgba(124, 90, 255," : "rgba(79, 141, 255,";
        g.addColorStop(0, `${tint} ${(0.16 * e).toFixed(3)})`);
        g.addColorStop(1, `${tint} 0)`);
        mesh.fillStyle = g;
        mesh.beginPath();
        mesh.arc(v.x, v.y, rad, 0, Math.PI * 2);
        mesh.fill();
      }
    };

    const respawn = (p: Particle, anywhere: boolean) => {
      p.x = anywhere ? Math.random() * width : -Math.random() * 30;
      p.y = Math.random() * height;
      p.life = 2600 + Math.random() * 4200;
    };

    const resetParticles = () => {
      const n = Math.round(clamp((width * height) / 1400, 110, 420));
      particles = Array.from({ length: n }, () => {
        const p = { x: 0, y: 0, life: 0 };
        respawn(p, true);
        return p;
      });
    };

    const vel: number[] = [0, 0];

    const step = (t: number) => {
      const dt = clamp(t - last, 0, 34);
      last = t;

      // Shed and advect wake vortices.
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnTimer = SPAWN_INTERVAL;
        vortices.push({
          x: cx + R * 1.35,
          y: cy + spawnSign * R * 0.52,
          sign: spawnSign,
          age: 0,
        });
        spawnSign = spawnSign === 1 ? -1 : 1;
      }
      for (const v of vortices) {
        baseVelocity(v.x, v.y, t, vel);
        v.x += vel[0] * 0.82 * dt;
        v.y += vel[1] * 0.82 * dt;
        v.age += dt;
      }
      vortices = vortices.filter(
        (v) => v.age < VORTEX_LIFE && v.x < width + 90,
      );

      // Fade previous streaklines, then advect and draw particles.
      trail.fillStyle = "rgba(6, 9, 16, 0.085)";
      trail.fillRect(0, 0, width, height);
      trail.lineWidth = 1;

      for (const p of particles) {
        velocity(p.x, p.y, t, vel);
        const nx = p.x + vel[0] * dt;
        const ny = p.y + vel[1] * dt;
        p.life -= dt;

        const dx = nx - cx;
        const dy = ny - cy;
        const inside = dx * dx + dy * dy < R * R;
        if (
          p.life <= 0 ||
          inside ||
          nx > width + 12 ||
          ny < -12 ||
          ny > height + 12
        ) {
          respawn(p, false);
          continue;
        }

        const speed = Math.hypot(vel[0], vel[1]);
        let swirl = 0;
        for (const v of vortices) {
          const rx = nx - v.x;
          const ry = ny - v.y;
          swirl += envelope(v) / (1 + (rx * rx + ry * ry) / (R * R * 1.3));
        }
        swirl = clamp(swirl, 0, 1);
        const alpha = 0.1 + 0.38 * clamp(speed / (U * 2.3), 0, 1);
        const r = Math.round(130 + swirl * 46);
        const g = Math.round(166 - swirl * 40);
        trail.strokeStyle = `rgba(${r}, ${g}, 255, ${alpha.toFixed(3)})`;
        trail.beginPath();
        trail.moveTo(p.x, p.y);
        trail.lineTo(nx, ny);
        trail.stroke();

        p.x = nx;
        p.y = ny;
      }

      if (frame % 2 === 0) drawMeshLayer();
      frame += 1;

      if (onScreen && !document.hidden) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
      }
    };

    const drawStatic = () => {
      // Fixed wake vortices so the mesh still tells the refinement story.
      vortices = [
        { x: cx + R * 2.6, y: cy - R * 0.6, sign: -1, age: 900 },
        { x: cx + R * 4.6, y: cy + R * 0.7, sign: 1, age: 1600 },
        { x: cx + R * 6.8, y: cy - R * 0.75, sign: -1, age: 2600 },
      ];
      trail.fillStyle = BG;
      trail.fillRect(0, 0, width, height);
      trail.lineWidth = 1;
      const seeds = 24;
      for (let i = 0; i < seeds; i++) {
        const y0 = ((i + 0.5) / seeds) * height;
        let x = 2;
        let y = y0;
        trail.strokeStyle = "rgba(136, 168, 255, 0.30)";
        trail.beginPath();
        trail.moveTo(x, y);
        for (let s = 0; s < 300; s++) {
          velocity(x, y, 0, vel);
          const mag = Math.hypot(vel[0], vel[1]);
          if (mag < 1e-4) break;
          x += (vel[0] / mag) * 4;
          y += (vel[1] / mag) * 4;
          if (x > width || y < 0 || y > height) break;
          trail.lineTo(x, y);
        }
        trail.stroke();
      }
      drawMeshLayer();
    };

    const start = () => {
      if (media.matches) {
        drawStatic();
        return;
      }
      if (!raf && onScreen && !document.hidden && width > 0) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      const dpr = clamp(window.devicePixelRatio || 1, 1, width < 560 ? 1.5 : 2);
      for (const [canvas, ctx] of [
        [trailCanvas, trail],
        [meshCanvas, mesh],
      ] as const) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      cx = width * 0.3;
      cy = height * 0.5;
      R = Math.min(width, height) * 0.13;
      U = Math.max(width * 0.0002, 0.09);
      core2 = R * R * 0.3;
      gamma = 1.65 * U * Math.sqrt(core2);
      maxDepth = width < 560 ? 5 : 6;
      trail.fillStyle = BG;
      trail.fillRect(0, 0, width, height);
      resetParticles();
      if (media.matches) drawStatic();
    };

    const observer = new ResizeObserver(() => {
      stop();
      resize();
      start();
    });
    observer.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMedia = () => {
      stop();
      vortices = [];
      resize();
      start();
    };

    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", onMedia);

    resize();
    start();

    return () => {
      stop();
      observer.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMedia);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Animated computational fluid dynamics visualisation: flow past a cylinder sheds a vortex street while an adaptive mesh concentrates resolution around the cylinder wall and wake vortices."
      className={`relative overflow-hidden ${className}`.trim()}
    >
      <canvas ref={trailRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <canvas ref={meshRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  );
}
