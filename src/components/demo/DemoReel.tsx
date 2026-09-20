"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSearchParams } from "next/navigation";

type SceneId =
  | "title"
  | "promise"
  | "load"
  | "segment"
  | "inspect"
  | "rank"
  | "end";

type Scene = {
  id: SceneId;
  start: number;
  end: number;
};

const SCENES: Scene[] = [
  { id: "title", start: 0, end: 4.2 },
  { id: "promise", start: 4.2, end: 10 },
  { id: "load", start: 10, end: 18 },
  { id: "segment", start: 18, end: 30 },
  { id: "inspect", start: 30, end: 42 },
  { id: "rank", start: 42, end: 54 },
  { id: "end", start: 54, end: 64 },
];

const TOTAL = SCENES[SCENES.length - 1]!.end;

const CELLS = [
  { x: 22, y: 28, r: 18, score: 44 },
  { x: 41, y: 35, r: 22, score: 71 },
  { x: 58, y: 24, r: 16, score: 38 },
  { x: 68, y: 48, r: 20, score: 63 },
  { x: 34, y: 58, r: 19, score: 52 },
  { x: 52, y: 62, r: 17, score: 47 },
  { x: 78, y: 32, r: 15, score: 81 },
  { x: 26, y: 72, r: 21, score: 56 },
  { x: 72, y: 70, r: 18, score: 49 },
  { x: 48, y: 44, r: 24, score: 76 },
];

const RANKS = [
  { name: "HDAC inhibitor class", score: 84 },
  { name: "MAPK pathway damper", score: 79 },
  { name: "Low-dose rescue band", score: 73 },
  { name: "Autophagy inducer", score: 68 },
];

const FEATURES = [
  { k: "area", v: "62.0" },
  { k: "eccentricity", v: "0.55" },
  { k: "texture", v: "0.72" },
  { k: "intensityMean", v: "0.38" },
  { k: "neighborDensity", v: "0.61" },
];

function sceneAt(t: number): Scene {
  return (
    SCENES.find((s) => t >= s.start && t < s.end) ?? SCENES[SCENES.length - 1]!
  );
}

function progressIn(scene: Scene, t: number) {
  return Math.min(1, Math.max(0, (t - scene.start) / (scene.end - scene.start)));
}

function easeOutCubic(x: number) {
  return 1 - (1 - x) ** 3;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function DemoReel() {
  const params = useSearchParams();
  const exportMode = params.get("export") === "1";

  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);

  // Wall-clock driver for export / headless (rAF is throttled offscreen)
  useEffect(() => {
    if (!exportMode || !playing) return;
    if (startedAt.current == null) {
      startedAt.current = performance.now();
    }
    const id = window.setInterval(() => {
      const start = startedAt.current ?? performance.now();
      const next = (performance.now() - start) / 1000;
      if (next >= TOTAL) {
        setT(TOTAL);
        setPlaying(false);
        return;
      }
      setT(next);
    }, 33);
    return () => window.clearInterval(id);
  }, [exportMode, playing]);

  const tick = useCallback((now: number) => {
    if (last.current == null) last.current = now;
    const dt = (now - last.current) / 1000;
    last.current = now;
    setT((prev) => {
      const next = prev + dt;
      if (next >= TOTAL) {
        setPlaying(false);
        return TOTAL;
      }
      return next;
    });
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (exportMode) return;
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = null;
      return;
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, tick, exportMode]);

  useEffect(() => {
    if (t >= TOTAL - 0.05) {
      document.documentElement.dataset.demoDone = "1";
    } else {
      delete document.documentElement.dataset.demoDone;
    }
  }, [t]);

  const scene = sceneAt(t);
  const p = progressIn(scene, t);
  const ep = easeOutCubic(p);

  const restart = () => {
    setT(0);
    setPlaying(true);
    last.current = null;
    startedAt.current = null;
    delete document.documentElement.dataset.demoDone;
  };

  const segmentCount =
    scene.id === "segment"
      ? Math.min(CELLS.length, Math.floor(ep * CELLS.length * 1.15))
      : scene.id === "load" || scene.id === "title" || scene.id === "promise"
        ? 0
        : CELLS.length;

  const selectedIdx = 9;
  const showRank = scene.id === "rank";

  return (
    <div
      className="demo-root"
      data-theme="dark"
      data-export={exportMode ? "1" : "0"}
    >
      <div className="demo-frame">
        <div className="demo-glow" aria-hidden />

        <div className="demo-caption">
          <Caption scene={scene} p={ep} />
        </div>

        <div className="demo-stage-wrap">
          {(scene.id === "title" ||
            scene.id === "promise" ||
            scene.id === "end") && <TitleCard scene={scene} p={ep} />}

          {(scene.id === "load" ||
            scene.id === "segment" ||
            scene.id === "inspect" ||
            scene.id === "rank") && (
            <div
              className="demo-workspace"
              style={
                {
                  "--ws-in": scene.id === "load" ? ep : 1,
                } as CSSProperties
              }
            >
              <div className="demo-ws-header">
                <span className="demo-brand">Cyto</span>
                <span className="demo-meta">
                  {scene.id === "load"
                    ? "sample-fov.png"
                    : `${segmentCount || CELLS.length} cells · U2OS FOV`}
                </span>
                <span className="demo-meta demo-ws-mode">
                  {scene.id === "load"
                    ? "Source"
                    : scene.id === "segment" || scene.id === "inspect"
                      ? "Cells"
                      : "Rank"}
                </span>
              </div>

              <div className="demo-ws-body">
                <div className="demo-fov">
                  <div className="demo-fov-toolbar">
                    <span className="demo-chip on">DNA</span>
                    <span className="demo-chip on">RNA</span>
                    <span className="demo-chip">AGP</span>
                    <span className="demo-chip">Mito</span>
                  </div>
                  <div className="demo-fov-view">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/demos/sample-fov.png"
                      alt=""
                      className="demo-fov-img"
                      style={{
                        opacity: scene.id === "load" ? 0.35 + ep * 0.6 : 0.95,
                        transform: `scale(${scene.id === "load" ? 1.06 - ep * 0.06 : 1})`,
                      }}
                    />
                    <div className="demo-fov-grid" />
                    {scene.id === "segment" && (
                      <div
                        className="demo-scan"
                        style={{ top: `${ep * 100}%` }}
                        aria-hidden
                      />
                    )}
                    {CELLS.map((c, i) => {
                      const appear =
                        scene.id === "segment"
                          ? Math.min(1, Math.max(0, ep * CELLS.length - i))
                          : i < segmentCount
                            ? 1
                            : 0;
                      const selected =
                        (scene.id === "inspect" || scene.id === "rank") &&
                        i === selectedIdx;
                      return (
                        <span
                          key={i}
                          className="demo-cell"
                          style={{
                            left: `${c.x}%`,
                            top: `${c.y}%`,
                            width: c.r * 2,
                            height: c.r * 2,
                            opacity: appear,
                            transform: `translate(-50%, -50%) scale(${0.55 + appear * 0.45})`,
                            background: selected
                              ? "color-mix(in srgb, var(--fov-select) 50%, transparent)"
                              : "var(--fov-cell)",
                            borderColor: selected
                              ? "var(--fov-select)"
                              : "var(--fov-cell-border)",
                            boxShadow: selected
                              ? "0 0 0 2px color-mix(in srgb, var(--fov-select) 40%, transparent)"
                              : undefined,
                            zIndex: selected ? 2 : 1,
                          }}
                        />
                      );
                    })}
                    {scene.id === "segment" && (
                      <div className="demo-counter">
                        <span className="demo-counter-n">{segmentCount}</span>
                        <span className="demo-counter-l">cells detected</span>
                      </div>
                    )}
                  </div>
                </div>

                <aside
                  className="demo-dock"
                  style={{
                    opacity:
                      scene.id === "load" ? Math.max(0, (ep - 0.15) * 1.5) : 1,
                    transform: `translateX(${
                      scene.id === "load" ? (1 - ep) * 28 : 0
                    }px)`,
                  }}
                >
                  {scene.id === "load" && <DockSource p={ep} />}
                  {(scene.id === "segment" || scene.id === "inspect") && (
                    <DockCell
                      p={scene.id === "inspect" ? ep : 0.35}
                      showFeatures={scene.id === "inspect"}
                    />
                  )}
                  {showRank && <DockRank p={ep} />}
                </aside>
              </div>
            </div>
          )}
        </div>

        <div className={`demo-chrome${exportMode ? " demo-chrome-export" : ""}`}>
          <div className="demo-progress">
            <div
              className="demo-progress-fill"
              style={{ width: `${(t / TOTAL) * 100}%` }}
            />
          </div>
          {!exportMode && (
            <div className="demo-controls">
              <button
                type="button"
                className="demo-btn"
                onClick={() => {
                  if (t >= TOTAL) restart();
                  else setPlaying((v) => !v);
                }}
              >
                {playing ? "Pause" : t >= TOTAL ? "Replay" : "Play"}
              </button>
              <button
                type="button"
                className="demo-btn ghost"
                onClick={restart}
              >
                Restart
              </button>
              <span className="demo-timecode">
                {formatTime(t)} / {formatTime(TOTAL)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Caption({ scene, p }: { scene: Scene; p: number }) {
  const copy: Record<SceneId, { kicker: string; line: string }> = {
    title: { kicker: "Introducing", line: "Cyto" },
    promise: {
      kicker: "For phenotypic screening",
      line: "From FOV to ranked perturbations — in one workspace",
    },
    load: { kicker: "Source", line: "Load your own field of view" },
    segment: {
      kicker: "Detect",
      line: "Segment cells directly on the image",
    },
    inspect: {
      kicker: "Inspect",
      line: "Click a cell. Read morphology instantly.",
    },
    rank: { kicker: "Rank", line: "Compare simulated interventions" },
    end: { kicker: "Cyto", line: "Phenotype analysis, in one workspace" },
  };
  const c = copy[scene.id];
  return (
    <div
      className="demo-caption-inner"
      key={scene.id}
      style={{
        opacity: Math.min(1, p * 3),
        transform: `translateY(${(1 - Math.min(1, p * 2)) * 8}px)`,
      }}
    >
      <p className="demo-kicker">{c.kicker}</p>
      <p className="demo-line">{c.line}</p>
    </div>
  );
}

function TitleCard({ scene, p }: { scene: Scene; p: number }) {
  if (scene.id === "title") {
    return (
      <div className="demo-titlecard">
        <p
          className="demo-title-brand"
          style={{ opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}
        >
          Cyto
        </p>
        <div className="demo-title-rule" style={{ transform: `scaleX(${p})` }} />
        <p
          className="demo-title-sub"
          style={{ opacity: Math.max(0, (p - 0.35) / 0.65) }}
        >
          Cell phenotype IDE
        </p>
      </div>
    );
  }
  if (scene.id === "promise") {
    return (
      <div className="demo-titlecard">
        <p
          className="demo-promise"
          style={{ opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}
        >
          Phenotype analysis,
          <br />
          in one workspace
        </p>
        <p
          className="demo-promise-sub"
          style={{ opacity: Math.max(0, (p - 0.25) / 0.75) }}
        >
          Load a FOV · detect cells · inspect morphology · rank perturbations
        </p>
      </div>
    );
  }
  return (
    <div className="demo-titlecard">
      <p
        className="demo-title-brand"
        style={{ opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}
      >
        Cyto
      </p>
      <p
        className="demo-promise-sub"
        style={{ opacity: Math.max(0, (p - 0.2) / 0.8), marginTop: "1rem" }}
      >
        Open the workspace and try it with your own FOV
      </p>
      <a
        href="/analyze"
        className="demo-cta"
        style={{ opacity: Math.max(0, (p - 0.4) / 0.6) }}
      >
        Open workspace
      </a>
    </div>
  );
}

function DockSource({ p }: { p: number }) {
  return (
    <div>
      <p className="demo-dock-label">Source</p>
      <div className="demo-dock-card" style={{ opacity: Math.min(1, p * 2) }}>
        <p className="demo-dock-strong">sample-fov.png</p>
        <p className="demo-dock-muted">FOV image ready</p>
      </div>
      <div
        className="demo-dock-run"
        style={{ opacity: Math.max(0, (p - 0.45) / 0.55) }}
      >
        Run analysis
      </div>
    </div>
  );
}

function DockCell({
  p,
  showFeatures,
}: {
  p: number;
  showFeatures: boolean;
}) {
  return (
    <div>
      <p className="demo-dock-label">Cell</p>
      <p className="demo-dock-strong">cell-10</p>
      <p className="demo-dock-muted">Stressed morphology · score 76</p>
      {showFeatures && (
        <dl className="demo-features">
          {FEATURES.map((f, i) => (
            <div
              key={f.k}
              className="demo-feat-row"
              style={{
                opacity: Math.min(1, Math.max(0, p * FEATURES.length - i)),
              }}
            >
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function DockRank({ p }: { p: number }) {
  return (
    <div>
      <p className="demo-dock-label">Rank</p>
      <ul className="demo-rank-list">
        {RANKS.map((r, i) => (
          <li
            key={r.name}
            className="demo-rank-item"
            data-active={i === 0 ? "true" : "false"}
            style={{
              opacity: Math.min(1, Math.max(0, p * RANKS.length - i * 0.7)),
              transform: `translateY(${Math.max(0, 1 - (p * RANKS.length - i * 0.7)) * 8}px)`,
            }}
          >
            <span className="demo-rank-n">{i + 1}</span>
            <span className="demo-rank-name">{r.name}</span>
            <span className="demo-rank-score">{r.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
