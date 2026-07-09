"use client";

// Header dropdown to switch between analyzed websites. Snapshots live
// server-side (lib/sites.ts); picking a site loads its world into the
// active state and reloads, so every page shows the chosen site.
// The panel renders through a portal: header and main are sibling
// stacking contexts (globals.css gives both z-index:1), so anything
// positioned inside the header paints UNDER main content.

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteMeta } from "@/lib/sites";

function domain(website: string): string {
  return website
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];
}

export default function SiteSwitcher() {
  const [sites, setSites] = useState<SiteMeta[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/sites", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.sites)) setSites(data.sites);
    } catch {
      // header stays quiet on fetch trouble
    }
  }

  const pathname = usePathname();
  useEffect(() => {
    load(); // refetch on mount and on client-side navigation — a run may
    // have just changed the active site without remounting the layout
  }, [pathname]);
  useEffect(() => {
    if (open) load();
  }, [open]);

  const place = useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setAnchor({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  async function pick(slug: string, isActive: boolean) {
    if (busy) return;
    if (isActive) {
      setOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
    } catch {
      // fall through to re-enable the menu
    }
    setBusy(false);
  }

  if (sites.length === 0) return null;
  const active = sites.find((s) => s.active);

  return (
    <>
      <button
        ref={btnRef}
        className="mono flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{ background: "var(--accent)" }}
        />
        {active ? domain(active.website) : "sites"}
        <span className="text-[10px]">{open ? "▴" : "▾"}</span>
      </button>

      {open &&
        anchor &&
        createPortal(
          <div
            ref={panelRef}
            className="card-paper fixed w-64 p-1.5"
            style={{
              top: anchor.top,
              right: anchor.right,
              zIndex: 60, // above main's z-1 stacking context and the log stream
              boxShadow: "0 16px 48px -16px rgba(27,27,25,.35)",
            }}
            role="listbox"
          >
            {sites.map((s) => (
              <button
                key={s.slug}
                className="flex w-full cursor-pointer items-baseline justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-[var(--card-deep)]"
                style={{ opacity: busy ? 0.5 : 1 }}
                onClick={() => pick(s.slug, s.active)}
                role="option"
                aria-selected={s.active}
              >
                <span className="mono min-w-0 truncate text-[12px]">
                  {s.active && <span className="link-green">→ </span>}
                  {domain(s.website)}
                </span>
                <span className="label shrink-0" style={{ fontSize: 10 }}>
                  {s.running
                    ? "running…"
                    : `${s.prospects} buyer${s.prospects === 1 ? "" : "s"}`}
                </span>
              </button>
            ))}
            <div className="mx-2.5 my-1 border-t border-[var(--faint)]" />
            <a
              href="/"
              className="label block cursor-pointer rounded-md px-2.5 py-2 transition-colors hover:bg-[var(--card-deep)] hover:text-[var(--ink)]"
            >
              <span className="arr text-[var(--accent)]">→</span> new website
            </a>
          </div>,
          document.body
        )}
    </>
  );
}
