"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { site } from "@/lib/site";
import styles from "@/components/visit-counter.module.css";

type VisitStats = {
  total: number;
  today: number;
  since: string;
  updatedAt: string;
  timezone: string;
};

function isVisitStats(value: unknown): value is VisitStats {
  if (!value || typeof value !== "object") return false;
  const stats = value as Partial<VisitStats>;
  return (
    Number.isSafeInteger(stats.total) && Number(stats.total) >= 0 &&
    Number.isSafeInteger(stats.today) && Number(stats.today) >= 0 &&
    typeof stats.since === "string" && !Number.isNaN(Date.parse(stats.since)) &&
    typeof stats.updatedAt === "string" && !Number.isNaN(Date.parse(stats.updatedAt)) &&
    typeof stats.timezone === "string" && stats.timezone.length > 0
  );
}

function formatDate(value: string, includeTime = false) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } as const : {}),
  }).format(new Date(value));
}

export function VisitCounter({ className }: { className?: string }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const clickTimes = useRef<number[]>([]);
  const request = useRef<AbortController | null>(null);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstLocation, secondLocation] = site.locations.split(" · ");

  useEffect(() => () => request.current?.abort(), []);

  function openCounter(event: MouseEvent<HTMLButtonElement>) {
    // Keyboard and assistive-technology activation has no pointer click count.
    if (event.detail !== 0) {
      const now = event.timeStamp;
      clickTimes.current = [...clickTimes.current.filter((time) => now - time <= 1200), now];
      if (clickTimes.current.length < 3) return;
    }
    clickTimes.current = [];
    if (!dialog.current?.open) dialog.current?.showModal();
  }

  function resetCounter() {
    request.current?.abort();
    request.current = null;
    clickTimes.current = [];
    setPassword("");
    setStats(null);
    setError("");
    setLoading(false);
    trigger.current?.focus({ preventScroll: true });
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !password) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        const messages: Record<number, string> = {
          401: "That password is incorrect. Please try again.",
          429: "Too many attempts. Please wait a few minutes before trying again.",
          503: "The counter is not available yet. Please try again later.",
        };
        throw new Error(messages[response.status] ?? "The counter could not be loaded. Please try again.");
      }
      const result: unknown = await response.json();
      if (!isVisitStats(result)) throw new Error("The counter returned an unexpected response. Please try again.");
      if (!controller.signal.aborted) {
        setStats(result);
        setPassword("");
      }
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error && cause.name !== "TypeError"
          ? cause.message
          : "The counter could not be reached. Check your connection and try again.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        request.current = null;
      }
    }
  }

  return (
    <>
      <span className={className}>
        {firstLocation}{" "}
        <button
          ref={trigger}
          type="button"
          className={styles.trigger}
          aria-label="Open private page-view counter"
          aria-haspopup="dialog"
          aria-controls={`${id}-dialog`}
          onClick={openCounter}
        >
          ·
        </button>{" "}
        {secondLocation}
      </span>
      <dialog
        ref={dialog}
        id={`${id}-dialog`}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onClose={resetCounter}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            dialog.current?.close();
          }
        }}
      >
        <div className={styles.header}>
          <p className={styles.eyebrow}>Nabla / Private</p>
          <button
            type="button"
            className={styles.close}
            aria-label="Close page-view counter"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <h2 id={`${id}-title`} className={styles.title}>Page views</h2>
        <p id={`${id}-description`} className={styles.description}>
          Recorded page loads, including repeat visits.
        </p>
        {stats ? (
          <div role="status" aria-live="polite">
            <dl className={styles.metrics}>
              <div>
                <dt>Total page views</dt>
                <dd>{stats.total.toLocaleString("en-GB")}</dd>
              </div>
              <div>
                <dt>Today <span>({stats.timezone})</span></dt>
                <dd>{stats.today.toLocaleString("en-GB")}</dd>
              </div>
            </dl>
            <p className={styles.note}>Counting since {formatDate(stats.since)}.</p>
            <p className={styles.note}>Updated {formatDate(stats.updatedAt, true)} UTC.</p>
          </div>
        ) : (
          <form onSubmit={unlock} className={styles.form} autoComplete="off" aria-busy={loading}>
            <label htmlFor={`${id}-password`}>Password</label>
            <input
              id={`${id}-password`}
              name="password"
              type="password"
              autoComplete="off"
              autoFocus
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              readOnly={loading}
              className={styles.input}
            />
            {error ? <p id={`${id}-error`} className={styles.error} role="alert">{error}</p> : null}
            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Loading…" : error ? "Try again" : "View counter"}
            </button>
            <span className={styles.srOnly} role="status">{loading ? "Loading page views." : ""}</span>
          </form>
        )}
      </dialog>
    </>
  );
}
