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
  report: {
    from: string; to: string; grain: "hour" | "day";
    minimum: string; maximum: string; timezone: string; views: number;
    series: { timestamp: string; views: number }[];
    countries: { code: string; views: number }[];
  };
};

function isVisitStats(value: unknown): value is VisitStats {
  if (!value || typeof value !== "object") return false;
  const stats = value as Partial<VisitStats>;
  return (
    Number.isSafeInteger(stats.total) && Number(stats.total) >= 0 &&
    Number.isSafeInteger(stats.today) && Number(stats.today) >= 0 &&
    typeof stats.since === "string" && !Number.isNaN(Date.parse(stats.since)) &&
    typeof stats.updatedAt === "string" && !Number.isNaN(Date.parse(stats.updatedAt)) &&
    typeof stats.timezone === "string" && stats.timezone.length > 0 &&
    Boolean(stats.report && Array.isArray(stats.report.series) && Array.isArray(stats.report.countries) &&
      Number.isSafeInteger(stats.report.views) && ["hour", "day"].includes(stats.report.grain))
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

function countryName(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code; }
  catch { return code; }
}

function bucketLabel(timestamp: string, grain: "hour" | "day") {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC", ...(grain === "hour" ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } as const
      : { day: "numeric", month: "short" } as const),
  }).format(new Date(timestamp));
}

function exportReport(stats: VisitStats) {
  const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ["Report", stats.report.from, stats.report.to, "UTC"],
    ["Timestamp (UTC)", "Page views"],
    ...stats.report.series.map(point => [point.timestamp, point.views]),
    [], ["Country", "Page views"],
    ...stats.report.countries.map(country => [countryName(country.code), country.views]),
  ];
  const url = URL.createObjectURL(new Blob([rows.map(row => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `nabla-visits-${stats.report.from}-${stats.report.to}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function VisitCounter({ className }: { className?: string }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const clickTimes = useRef<number[]>([]);
  const request = useRef<AbortController | null>(null);
  const sessionPassword = useRef("");
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [grain, setGrain] = useState<"hour" | "day">("hour");
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
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
    sessionPassword.current = "";
    setPassword("");
    const date = new Date().toISOString().slice(0, 10);
    setFrom(date); setTo(date); setGrain("hour"); setSelectedBucket(null);
    setStats(null);
    setError("");
    setLoading(false);
    trigger.current?.focus({ preventScroll: true });
  }

  async function loadReport(nextFrom = from, nextTo = to, nextGrain = grain) {
    const secret = sessionPassword.current || password;
    if (loading || !secret) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: secret, report: { from: nextFrom, to: nextTo, grain: nextGrain } }),
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        const messages: Record<number, string> = {
          400: "Choose valid dates within the available reporting window. Hourly reports cover one day.",
          401: "That password is incorrect. Please try again.",
          429: "Too many attempts. Please wait a few minutes before trying again.",
          503: "The counter is not available yet. Please try again later.",
        };
        throw new Error(messages[response.status] ?? "The counter could not be loaded. Please try again.");
      }
      const result: unknown = await response.json();
      if (!isVisitStats(result)) throw new Error("The counter returned an unexpected response. Please try again.");
      if (!controller.signal.aborted) {
        sessionPassword.current = secret;
        setStats(result);
        setFrom(result.report.from); setTo(result.report.to); setGrain(result.report.grain);
        setSelectedBucket(null);
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

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadReport();
  }

  function preset(days: number) {
    if (!stats) return;
    const end = stats.report.maximum;
    const start = new Date(Math.max(Date.parse(stats.report.minimum), Date.parse(end) - (days - 1) * 86400000)).toISOString().slice(0, 10);
    const interval = start === end ? "hour" : "day";
    setFrom(start); setTo(end); setGrain(interval);
    void loadReport(start, end, interval);
  }

  const report = stats?.report;
  const peak = report ? Math.max(1, ...report.series.map(point => point.views)) : 1;
  const focusedPoint = report && selectedBucket !== null ? report.series[selectedBucket] : null;
  const countryTotal = report?.countries.reduce((sum, country) => sum + country.views, 0) ?? 0;

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
        className={`${styles.dialog} ${stats ? styles.expanded : ""}`}
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
        {stats && report ? (
          <div aria-busy={loading}>
            <form className={styles.filters} onSubmit={submitReport}>
              <div className={styles.presets} aria-label="Quick date ranges">
                {[1, 7, 30].map(days => <button key={days} type="button" disabled={loading} onClick={() => preset(days)}>
                  {days === 1 ? "Today" : `Last ${days} days`}
                </button>)}
              </div>
              <div className={styles.dateFields}>
                <label>From<input type="date" value={from} min={report.minimum} max={report.maximum} required disabled={loading}
                  onChange={e => { setFrom(e.target.value); if (e.target.value !== to) setGrain("day"); }} /></label>
                <label>To<input type="date" value={to} min={from || report.minimum} max={report.maximum} required disabled={loading}
                  onChange={e => { setTo(e.target.value); if (e.target.value !== from) setGrain("day"); }} /></label>
                <label>Group by<select value={grain} disabled={loading} onChange={e => setGrain(e.target.value as "hour" | "day")}>
                  <option value="day">Day</option><option value="hour" disabled={from !== to}>Hour</option>
                </select></label>
                <button type="submit" className={styles.apply} disabled={loading}>{loading ? "Loading…" : "Apply"}</button>
              </div>
            </form>
            {error && <p className={styles.error} role="alert">{error} The last loaded report is shown below.</p>}
            <div className={styles.reportHeading}>
              <p>{formatDate(report.from)}{report.from !== report.to ? ` to ${formatDate(report.to)}` : ""} <span>· UTC</span></p>
              <button className={styles.download} type="button" onClick={() => exportReport(stats)} disabled={loading}>Export CSV ↓</button>
            </div>
            <dl className={styles.metrics}>
              <div><dt>All-time page views</dt><dd>{stats.total.toLocaleString("en-GB")}</dd></div>
              <div><dt>Selected period</dt><dd>{report.views.toLocaleString("en-GB")}</dd></div>
              <div><dt>Today <span>({stats.timezone})</span></dt><dd>{stats.today.toLocaleString("en-GB")}</dd></div>
            </dl>
            <section className={styles.chartSection} aria-label="Page views over time">
              <div className={styles.chartHeading}>
                <h3>Visits over time</h3>
                <p aria-live="polite">{focusedPoint ? `${bucketLabel(focusedPoint.timestamp, report.grain)} UTC · ${focusedPoint.views} views` : `By ${report.grain} · UTC`}</p>
              </div>
              {report.views === 0 && <p className={styles.note}>No page views recorded in this period</p>}
              <div className={styles.chart}>
                <span className={styles.axisMax}>{peak}</span>
                <div className={styles.bars}>
                  {report.series.map((point, index) => <button type="button" key={point.timestamp}
                    className={`${styles.barColumn} ${selectedBucket === index ? styles.selectedBar : ""}`}
                    aria-label={`${bucketLabel(point.timestamp, report.grain)} UTC: ${point.views} page views`}
                    aria-pressed={selectedBucket === index}
                    onMouseEnter={() => setSelectedBucket(index)} onFocus={() => setSelectedBucket(index)} onClick={() => setSelectedBucket(index)}>
                    <span className={styles.bar} style={{ height: `${point.views / peak * 100}%`, minHeight: point.views ? 3 : 0 }} />
                    <span className={styles.tick}>{index === 0 || index === report.series.length - 1 || index % Math.ceil(report.series.length / 6) === 0 ? bucketLabel(point.timestamp, report.grain) : ""}</span>
                  </button>)}
                </div>
                <span className={styles.axisZero}>0</span>
              </div>
            </section>
            <div className={styles.detailGrid}>
              <section>
                <h3>Countries</h3>
                <p className={styles.note}>Approximate location of recorded page views</p>
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead><tr><th scope="col">Country</th><th scope="col">Views</th><th scope="col">Share</th></tr></thead>
                    <tbody>{report.countries.map(country => <tr key={country.code}>
                      <th scope="row">{countryName(country.code)}<span className={styles.countryBar} style={{ width: `${countryTotal ? country.views / countryTotal * 100 : 0}%` }} /></th>
                      <td>{country.views.toLocaleString("en-GB")}</td><td>{countryTotal ? Math.round(country.views / countryTotal * 100) : 0}%</td>
                    </tr>)}</tbody>
                  </table>
                  {report.countries.length === 0 && <p className={styles.note}>No country data for this period</p>}
                </div>
              </section>
              <section>
                <h3>{report.grain === "hour" ? "Hourly breakdown" : "Daily breakdown"}</h3>
                <p className={styles.note}>Exact figures for the selected period · UTC</p>
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead><tr><th scope="col">{report.grain === "hour" ? "Hour" : "Date"}</th><th scope="col">Views</th></tr></thead>
                    <tbody>{report.series.map(point => <tr key={point.timestamp}><th scope="row">{bucketLabel(point.timestamp, report.grain)}</th><td>{point.views.toLocaleString("en-GB")}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            </div>
            <div className={styles.footnote}>
              <p className={styles.note}>Counting since {formatDate(stats.since)} · Updated {formatDate(stats.updatedAt, true)} UTC</p>
              <p className={styles.note}>Detailed reports cover the last 30 days available on this plan. Recent data may take a few minutes to appear.</p>
            </div>
            <span className={styles.srOnly} role="status">{loading ? "Loading report" : `Report loaded: ${report.views} page views`}</span>
          </div>
        ) : (
          <form onSubmit={submitReport} className={styles.form} autoComplete="off" aria-busy={loading}>
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
