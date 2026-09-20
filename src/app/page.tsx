"use client";

import { RestartTourButton } from "@/components/OnboardingTour";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="mx-auto flex h-11 w-full max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="brand">Cyto</span>
            <span className="meta hidden sm:inline">Cell phenotype IDE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <RestartTourButton />
            <Link href="/analyze" className="btn btn-secondary ml-1">
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-5 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <section>
          <h1 className="font-display text-[2.35rem] leading-[1.12] font-semibold tracking-tight text-[var(--ink)] sm:text-[2.65rem]">
            Phenotype analysis,
            <br />
            in one workspace
          </h1>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-secondary)]">
            Load a field of view, run morphological analysis, inspect cells, and
            rank simulated perturbations—without leaving the IDE.
          </p>
          <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-[var(--muted)]">
            Demo scores are synthetic. Import your own image and cell CSV to
            exercise the real workflow.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/analyze"
              className="btn btn-primary px-5"
              data-tour="cta"
            >
              Open workspace
            </Link>
            <Link href="/demo" className="btn btn-secondary">
              Watch demo
            </Link>
            <span className="meta">Not medical advice</span>
          </div>
        </section>

        <aside className="panel overflow-hidden" data-tour="preview">
          <div className="stage-toolbar">
            <span className="chip" data-on="true">
              DNA
            </span>
            <span className="chip" data-on="true">
              RNA
            </span>
            <span className="chip">AGP</span>
            <span className="meta ml-auto">1024 × 1024</span>
          </div>
          <div className="stage aspect-[4/3] min-h-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--fov-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--fov-grid) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
            {[
              { x: 30, y: 34, s: 36 },
              { x: 54, y: 42, s: 44 },
              { x: 70, y: 30, s: 30 },
              { x: 42, y: 64, s: 38 },
              { x: 74, y: 60, s: 32 },
            ].map((c) => (
              <span
                key={`${c.x}-${c.y}`}
                className="absolute rounded-full border"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: c.s,
                  height: c.s,
                  transform: "translate(-50%, -50%)",
                  background: "var(--fov-cell)",
                  borderColor: "var(--fov-cell-border)",
                }}
              />
            ))}
          </div>
          <div className="stage-footer">
            <span className="meta">Preview</span>
            <span className="meta">U2OS · demo plate</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
