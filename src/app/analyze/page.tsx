"use client";

import { FovStage } from "@/components/FovStage";
import { RestartTourButton } from "@/components/OnboardingTour";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DEMO_FOVS } from "@/lib/demos";
import { findCandidate, useWorkspace } from "@/lib/workspace";
import type { AnalyzeMode, ScoreAxes } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";

/** Primary rail — keep the dock focused */
const MODES: { id: AnalyzeMode; label: string }[] = [
  { id: "intake", label: "Source" },
  { id: "explorer", label: "Cells" },
  { id: "rank", label: "Rank" },
];

function ScoreBars({ scores }: { scores: ScoreAxes }) {
  const rows: { key: keyof ScoreAxes; label: string; invert?: boolean }[] = [
    { key: "severity", label: "Severity", invert: true },
    { key: "specificity", label: "Specificity" },
    { key: "offTargetRisk", label: "Off-target", invert: true },
    { key: "novelty", label: "Novelty" },
  ];
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const v = scores[r.key];
        const warn = r.invert ? v >= 45 : v <= 55;
        return (
          <div key={r.key}>
            <div className="mb-1 flex justify-between text-[11.5px]">
              <span className="text-[var(--muted)]">{r.label}</span>
              <span className="font-data text-[var(--ink)]">{Math.round(v)}</span>
            </div>
            <div className="score-track">
              <div
                className="score-fill"
                data-warn={warn ? "true" : "false"}
                style={{ width: `${v}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IntakePanel() {
  const {
    selectedDemo,
    selectDemo,
    runPipeline,
    running,
    uploadedImageName,
    importCsvName,
    importedCells,
    importWarnings,
    setUploadedImage,
    setImportedCsv,
    loadSampleBundle,
    clearUploads,
    stages,
  } = useWorkspace();

  const canRun = Boolean(
    selectedDemo || uploadedImageName || importedCells?.length,
  );
  const activeStage = stages.find((s) => s.status === "running");

  return (
    <div>
      <h2 className="panel-label">Source</h2>
      <p className="panel-help">
        Upload a FOV to detect cells on the image, or pick a demo.
      </p>

      <button
        type="button"
        onClick={() => void loadSampleBundle()}
        className="btn btn-secondary btn-block mb-3"
      >
        Load sample FOV
      </button>

      <label className="list-row mb-1.5 block cursor-pointer">
        <span className="text-[12.5px] font-medium text-[var(--ink)]">
          Upload image
        </span>
        <span className="mt-0.5 block text-[11.5px] text-[var(--muted)]">
          {uploadedImageName ?? "PNG, JPEG, WebP, GIF"}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void setUploadedImage(f);
            e.target.value = "";
          }}
        />
      </label>

      <label className="list-row mb-3 block cursor-pointer">
        <span className="text-[12.5px] font-medium text-[var(--ink)]">
          Optional cell CSV
        </span>
        <span className="mt-0.5 block text-[11.5px] text-[var(--muted)]">
          {importCsvName
            ? `${importCsvName} · ${importedCells?.length ?? 0} cells`
            : "Only if you already have x,y positions"}
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void setImportedCsv(f);
            e.target.value = "";
          }}
        />
      </label>

      {(uploadedImageName || importCsvName) && (
        <button
          type="button"
          onClick={() => clearUploads()}
          className="meta mb-3 hover:text-[var(--danger)]"
        >
          Clear uploads
        </button>
      )}

      {importWarnings.length > 0 && (
        <ul className="mb-3 space-y-1 text-[11.5px] text-[var(--warn)]">
          {importWarnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <p className="section-label">Demos</p>
      <ul className="mb-4 space-y-1">
        {DEMO_FOVS.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => selectDemo(d.id)}
              className="list-row"
              data-active={selectedDemo?.id === d.id && !uploadedImageName}
            >
              <p className="text-[12.5px] font-medium text-[var(--ink)]">{d.name}</p>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={!canRun || running}
        onClick={() => runPipeline()}
        className="btn btn-primary btn-block"
        data-tour="run"
      >
        {running
          ? activeStage
            ? activeStage.label
            : "Running…"
          : "Run analysis"}
      </button>
    </div>
  );
}

function ExplorerPanel() {
  const { result, selectedCellId, importedCells, running, stages } =
    useWorkspace();
  const cells = result?.cells ?? importedCells ?? [];
  const cell = cells.find((c) => c.id === selectedCellId);
  const activeStage = stages.find((s) => s.status === "running");

  if (running) {
    return (
      <div>
        <h2 className="panel-label">Analyzing</h2>
        <p className="panel-help">{activeStage?.label ?? "Working…"}</p>
        <ol className="space-y-1">
          {stages.map((s) => (
            <li
              key={s.id}
              className={clsx(
                "flex justify-between text-[11.5px]",
                s.status === "running" && "text-[var(--accent)]",
                s.status === "done" && "text-[var(--muted)]",
                s.status === "pending" && "text-[var(--line-strong)]",
              )}
            >
              <span>{s.label}</span>
              <span className="font-data capitalize">{s.status}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (!result && !cells.length) {
    return (
      <div>
        <h2 className="panel-label">Cells</h2>
        <p className="panel-help">
          Run analysis to detect cells on your FOV, then click one on the stage.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="panel-label">Cell</h2>
      {result && (
        <p className="panel-help">
          {result.fovSummary.cellCount} detected · mean score{" "}
          {result.fovSummary.meanPhenotype}
        </p>
      )}
      {cell ? (
        <>
          <p className="text-[13px] font-medium text-[var(--ink)]">
            {cell.id}
            <span className="meta ml-2 font-normal">{cell.label}</span>
          </p>
          <p className="mt-1.5 text-[12px] text-[var(--ink-secondary)]">
            Score{" "}
            <span className="font-data text-[var(--ink)]">
              {Math.round(cell.phenotypeScore)}
            </span>
          </p>
          <dl className="mt-3 space-y-0">
            {Object.entries(cell.features).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between border-t border-[var(--line)] py-1.5 text-[11.5px] first:border-t-0"
              >
                <dt className="text-[var(--muted)]">{k}</dt>
                <dd className="font-data text-[var(--ink)]">
                  {Number(v).toFixed(2)}
                </dd>
              </div>
            ))}
          </dl>
          {result?.fovSummary.notes[0] && (
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
              {result.fovSummary.notes[0]}
            </p>
          )}
        </>
      ) : (
        <p className="text-[12.5px] text-[var(--muted)]">
          Click a cell on the stage.
        </p>
      )}
    </div>
  );
}

function RankPanel() {
  const {
    result,
    selectedPerturbationId,
    selectPerturbation,
    applyPerturbation,
    studioScores,
    studioDelta,
  } = useWorkspace();

  if (!result) {
    return (
      <div>
        <h2 className="panel-label">Rank</h2>
        <p className="panel-help">Run analysis first to see ranked candidates.</p>
      </div>
    );
  }

  const cand = findCandidate(result, selectedPerturbationId);

  return (
    <div>
      <h2 className="panel-label">Rank</h2>
      <p className="panel-help">Simulated perturbation candidates.</p>
      <ul className="mb-3 space-y-1">
        {result.candidates.slice(0, 5).map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => selectPerturbation(c.id)}
              className="list-row"
              data-active={selectedPerturbationId === c.id}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[12.5px] font-medium text-[var(--ink)]">
                  <span className="meta mr-1.5">{i + 1}</span>
                  {c.name}
                </p>
                <span className="font-data text-[11.5px] text-[var(--accent)]">
                  {Math.round(c.composite)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {cand && (
        <>
          <ScoreBars scores={studioScores ?? cand.scores} />
          <button
            type="button"
            onClick={() => applyPerturbation()}
            className="btn btn-secondary btn-block mt-3"
          >
            Simulate
          </button>
          {studioDelta && (
            <ul className="mt-3 space-y-1 text-[11.5px]">
              {Object.entries(studioDelta).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="text-[var(--muted)]">Δ {k}</span>
                  <span
                    className={clsx(
                      "font-data",
                      Number(v) < 0
                        ? "text-[var(--good)]"
                        : "text-[var(--warn)]",
                    )}
                  >
                    {Number(v).toFixed(3)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function ModeBody() {
  const mode = useWorkspace((s) => s.mode);
  if (mode === "rank" || mode === "studio" || mode === "compare") {
    return <RankPanel />;
  }
  if (mode === "explorer" || mode === "pipeline") {
    return <ExplorerPanel />;
  }
  return <IntakePanel />;
}

export default function AnalyzePage() {
  const {
    mode,
    setMode,
    error,
    reset,
    selectedDemo,
    result,
    uploadedImageName,
    importCsvName,
    importedCells,
    running,
    stages,
  } = useWorkspace();

  const headerSource =
    uploadedImageName ??
    selectedDemo?.name ??
    importCsvName ??
    "No FOV";
  const cellCount =
    result?.fovSummary.cellCount ?? importedCells?.length ?? null;
  const modeLabel = MODES.find((m) => m.id === mode)?.label
    ?? (mode === "studio" || mode === "compare"
      ? "Rank"
      : mode === "pipeline"
        ? "Cells"
        : "Source");
  const activeStage = stages.find((s) => s.status === "running");

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex h-11 items-center justify-between gap-3 px-3 lg:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="brand" style={{ fontSize: "1.05rem" }}>
              Cyto
            </Link>
            <span className="hidden h-4 w-px bg-[var(--line)] sm:block" aria-hidden />
            <span className="meta hidden truncate sm:inline">
              {headerSource}
              {cellCount != null ? ` · ${cellCount} cells` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <RestartTourButton />
            <button type="button" onClick={() => reset()} className="btn btn-ghost">
              Reset
            </button>
          </div>
        </div>
      </header>

      <div className="workspace">
        <nav className="workspace-rail" aria-label="Workspace modes" data-tour="modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className="rail-item"
              data-active={
                mode === m.id ||
                (m.id === "rank" && (mode === "studio" || mode === "compare")) ||
                (m.id === "explorer" && mode === "pipeline")
              }
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="workspace-main">
            <div className="workspace-stage" data-tour="stage">
              <FovStage />
            </div>
            <aside className="workspace-dock" data-tour="panel">
              {error && (
                <p className="mb-3 border border-[var(--danger)] bg-[var(--danger-soft)] px-2.5 py-2 text-[12px] text-[var(--danger)]">
                  {error}
                </p>
              )}
              <ModeBody />
            </aside>
          </div>
          <footer className="workspace-status">
            <span>
              {running
                ? activeStage?.label ?? "Running"
                : result
                  ? `${result.fovSummary.cellCount} cells`
                  : "Idle"}{" "}
              · {modeLabel}
            </span>
            <span>Client segmentation</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
