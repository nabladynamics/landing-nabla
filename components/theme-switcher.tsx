"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, X } from "lucide-react";
import { useStyle } from "@/components/style-provider";
import { themes, themeHref } from "@/lib/themes";
import styles from "@/components/experience/spatial-navigation.module.css";

export function ThemeSwitcher() {
  const { theme: active } = useStyle();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const spatial = active === "spatial";
  const activeName = themes.find((theme) => theme.id === active)?.name;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`${styles.switcher} ${spatial ? styles.spatialSwitcher : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={`Choose a style variant. Current style: ${activeName}`}
        title="Style variants"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={spatial ? styles.styleButton : `${styles.styleButton} rounded-ctl border border-line bg-white text-frost hover:border-volt/50 hover:text-volt`}
      >
        <span>{activeName}</span>
        {open ? <X size={19} aria-hidden="true" /> : <ChevronDown size={19} aria-hidden="true" />}
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Style variants"
          className={`${styles.styleMenu} ${spatial ? styles.spatialMenu : "rounded-card border-line bg-white"}`}
          onKeyDown={(event) => {
            const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
            const current = items.indexOf(document.activeElement as HTMLElement);
            let next = current;
            if (event.key === "ArrowDown") next = (current + 1) % items.length;
            else if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = items.length - 1;
            else if (event.key === "Tab") { setOpen(false); return; }
            else return;
            event.preventDefault();
            items[next]?.focus();
          }}
        >
          <p className={styles.menuLabel}>Choose your perspective</p>
          {themes.map((theme) => {
            const selected = theme.id === active;
            return (
              <Link
                key={theme.id}
                href={themeHref(pathname, theme.id)}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => setOpen(false)}
                className={`${styles.styleItem} ${!spatial ? "rounded-ctl hover:bg-raise" : ""} ${selected ? (spatial ? styles.selected : "bg-tint") : ""}`}
              >
                <span className={styles.check}>{selected ? <Check size={17} aria-hidden="true" /> : null}</span>
                <span><span className={styles.styleName}>{theme.name}</span><span className={styles.styleHint}>{theme.hint}</span></span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
