"use client";

import { useWorkspace } from "@/lib/workspace";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const WORLD_SCALE = 1.85;
const DRAG_THRESHOLD_PX = 5;

type Point = { x: number; y: number };

function clampPan(x: number, y: number, viewportW: number, viewportH: number) {
  const worldW = viewportW * WORLD_SCALE;
  const worldH = viewportH * WORLD_SCALE;
  return {
    x: Math.min(0, Math.max(viewportW - worldW, x)),
    y: Math.min(0, Math.max(viewportH - worldH, y)),
  };
}

export function FovStage() {
  const {
    selectedDemo,
    result,
    selectedCellId,
    selectCell,
    mode,
    setMode,
    uploadedImageUrl,
    uploadedImageName,
    importedCells,
    importCsvName,
  } = useWorkspace();

  const displayCells = result?.cells ?? importedCells ?? [];
  const isPreview = !result && Boolean(importedCells?.length);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const centerWorld = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const centeredX = (w - w * WORLD_SCALE) / 2;
    const centeredY = (h - h * WORLD_SCALE) / 2;
    setPan(clampPan(centeredX, centeredY, w, h));
  }, []);

  useEffect(() => {
    centerWorld();
    const onResize = () => centerWorld();
    window.addEventListener("resize", onResize);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => centerWorld())
        : null;
    if (viewportRef.current && ro) ro.observe(viewportRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [
    centerWorld,
    selectedDemo?.id,
    result?.fovSummary.cellCount,
    importedCells?.length,
    uploadedImageUrl,
  ]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const el = viewportRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
      moved: false,
    };
    setDragging(true);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = viewportRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !el) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
      drag.moved = true;
    }
    if (!drag.moved) return;
    setPan(
      clampPan(
        drag.originX + dx,
        drag.originY + dy,
        el.clientWidth,
        el.clientHeight,
      ),
    );
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  const sourceLabel = uploadedImageName
    ? uploadedImageName
    : selectedDemo?.name ?? (importCsvName ? "CSV layout" : "No FOV");

  const dimLabel = selectedDemo
    ? `${selectedDemo.width} × ${selectedDemo.height}`
    : uploadedImageName
      ? "Imported"
      : importCsvName
        ? "CSV"
        : "—";

  return (
    <div className="flex h-full min-h-[280px] flex-col" data-tour="stage">
      <div className="stage-toolbar">
        <span className="chip" data-on="true">
          DNA
        </span>
        <span className="chip" data-on="true">
          RNA
        </span>
        <span className="chip">AGP</span>
        <span className="chip">Mito</span>
        <button
          type="button"
          className="meta ml-auto hover:text-[var(--ink)]"
          onClick={centerWorld}
        >
          Recenter
        </button>
        <span className="meta">{dimLabel}</span>
      </div>

      <div
        ref={viewportRef}
        className="stage relative touch-none"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="application"
        aria-label="Field of view. Drag to pan. Click a cell to inspect."
      >
        <div
          className="absolute origin-top-left will-change-transform"
          style={{
            width: `${WORLD_SCALE * 100}%`,
            height: `${WORLD_SCALE * 100}%`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {uploadedImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={uploadedImageUrl}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-fill opacity-95"
              draggable={false}
            />
          ) : null}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--fov-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--fov-grid) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              opacity: uploadedImageUrl ? 0.35 : 1,
            }}
          />

          {displayCells.map((c) => {
            const selected = c.id === selectedCellId;
            return (
              <button
                key={c.id}
                type="button"
                title={`${c.id} · ${c.label}`}
                onClick={() => {
                  if (suppressClickRef.current) return;
                  selectCell(c.id);
                  if (mode !== "explorer") setMode("explorer");
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute rounded-full border"
                style={{
                  left: `${c.x * 100}%`,
                  top: `${c.y * 100}%`,
                  width: `${c.r * 200}%`,
                  height: `${c.r * 200}%`,
                  transform: selected
                    ? "translate(-50%, -50%) scale(1.06)"
                    : "translate(-50%, -50%)",
                  background: selected
                    ? "color-mix(in srgb, var(--fov-select) 45%, transparent)"
                    : isPreview
                      ? "color-mix(in srgb, var(--fov-cell) 70%, transparent)"
                      : "var(--fov-cell)",
                  borderColor: selected
                    ? "var(--fov-select)"
                    : "var(--fov-cell-border)",
                  zIndex: selected ? 2 : 1,
                  cursor: "pointer",
                }}
              />
            );
          })}
        </div>

        {!displayCells.length && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center text-[12.5px] text-white/40">
            {uploadedImageUrl
              ? "Image loaded — import CSV or run analysis"
              : "Load a source, then run analysis"}
          </p>
        )}
      </div>

      <div className="stage-footer">
        <span className="meta truncate">
          {sourceLabel}
          {importCsvName && uploadedImageName ? ` · ${importCsvName}` : ""}
          {isPreview ? " · preview" : ""}
        </span>
        <span className="meta">
          {displayCells.length
            ? `${displayCells.length} cells · drag to pan`
            : "—"}
        </span>
      </div>
    </div>
  );
}
