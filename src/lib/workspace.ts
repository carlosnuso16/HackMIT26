"use client";

import { create } from "zustand";
import { getDemoFov } from "./demos";
import {
  isCsvFile,
  isSupportedImageFile,
  parseCellsCsv,
} from "./import-data";
import { phenotypeEngine } from "./mock-engine";
import { SAMPLE_CSV_PATH, SAMPLE_FOV_PATH } from "./public-data";
import type {
  AnalyzeMode,
  CellInstance,
  DemoFov,
  MorphologyFeatures,
  PerturbationCandidate,
  PipelineResult,
  PipelineStage,
  ScoreAxes,
} from "./types";

type WorkspaceState = {
  mode: AnalyzeMode;
  setMode: (mode: AnalyzeMode) => void;
  selectedDemo: DemoFov | null;
  selectDemo: (id: string) => void;
  /** Object URL or static path for FOV image */
  uploadedImageUrl: string | null;
  uploadedImageName: string | null;
  importedCells: CellInstance[] | null;
  importCsvName: string | null;
  importWarnings: string[];
  setUploadedImage: (file: File) => Promise<void>;
  setImportedCsv: (file: File) => Promise<void>;
  loadSampleCsv: () => Promise<void>;
  loadSampleBundle: () => Promise<void>;
  clearUploads: () => void;
  stages: PipelineStage[];
  result: PipelineResult | null;
  running: boolean;
  error: string | null;
  selectedCellId: string | null;
  selectCell: (id: string | null) => void;
  selectedPerturbationId: string | null;
  selectPerturbation: (id: string | null) => void;
  compareIds: [string | null, string | null];
  setCompare: (slot: 0 | 1, id: string | null) => void;
  studioScores: ScoreAxes | null;
  studioDelta: Partial<MorphologyFeatures> | null;
  runPipeline: () => Promise<void>;
  applyPerturbation: () => Promise<void>;
  reset: () => void;
};

function revokeUrl(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  mode: "intake",
  setMode: (mode) => set({ mode }),
  selectedDemo: getDemoFov("u2os-paint-a") ?? null,
  selectDemo: (id) => {
    const { uploadedImageUrl } = get();
    revokeUrl(uploadedImageUrl);
    set({
      selectedDemo: getDemoFov(id) ?? null,
      uploadedImageUrl: null,
      uploadedImageName: null,
      // keep CSV if user wants overlay on demo; clear result
      result: null,
      stages: [],
      error: null,
    });
  },
  uploadedImageUrl: null,
  uploadedImageName: null,
  importedCells: null,
  importCsvName: null,
  importWarnings: [],

  setUploadedImage: async (file) => {
    if (!isSupportedImageFile(file)) {
      set({ error: "Use a PNG, JPEG, WebP, or GIF image." });
      return;
    }
    const prev = get().uploadedImageUrl;
    revokeUrl(prev);
    const url = URL.createObjectURL(file);
    set({
      uploadedImageUrl: url,
      uploadedImageName: file.name,
      selectedDemo: null,
      // Stale cell tables won't match a new FOV — clear them
      importedCells: null,
      importCsvName: null,
      importWarnings: [],
      error: null,
      result: null,
      stages: [],
    });
  },

  setImportedCsv: async (file) => {
    if (!isCsvFile(file)) {
      set({ error: "Upload a .csv cell table." });
      return;
    }
    try {
      const text = await file.text();
      const { cells, warnings } = parseCellsCsv(text);
      set({
        importedCells: cells,
        importCsvName: file.name,
        importWarnings: warnings,
        error: null,
        result: null,
        stages: [],
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Could not parse CSV",
        importedCells: null,
        importCsvName: null,
      });
    }
  },

  loadSampleCsv: async () => {
    try {
      const res = await fetch(SAMPLE_CSV_PATH);
      if (!res.ok) throw new Error("Could not load sample CSV");
      const text = await res.text();
      const { cells, warnings } = parseCellsCsv(text);
      set({
        importedCells: cells,
        importCsvName: "sample-cells.csv",
        importWarnings: warnings,
        error: null,
        result: null,
        stages: [],
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Sample CSV failed",
      });
    }
  },

  loadSampleBundle: async () => {
    try {
      const prev = get().uploadedImageUrl;
      revokeUrl(prev);
      set({
        uploadedImageUrl: SAMPLE_FOV_PATH,
        uploadedImageName: "sample-fov.png",
        selectedDemo: null,
        importedCells: null,
        importCsvName: null,
        importWarnings: [],
        error: null,
        result: null,
        stages: [],
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Sample FOV failed",
      });
    }
  },

  clearUploads: () => {
    revokeUrl(get().uploadedImageUrl);
    set({
      uploadedImageUrl: null,
      uploadedImageName: null,
      importedCells: null,
      importCsvName: null,
      importWarnings: [],
      selectedDemo: getDemoFov("u2os-paint-a") ?? null,
      result: null,
      stages: [],
      error: null,
    });
  },

  stages: [],
  result: null,
  running: false,
  error: null,
  selectedCellId: null,
  selectCell: (id) => set({ selectedCellId: id }),
  selectedPerturbationId: null,
  selectPerturbation: (id) => set({ selectedPerturbationId: id }),
  compareIds: [null, null],
  setCompare: (slot, id) => {
    const next = [...get().compareIds] as [string | null, string | null];
    next[slot] = id;
    set({ compareIds: next });
  },
  studioScores: null,
  studioDelta: null,

  runPipeline: async () => {
    const { selectedDemo, uploadedImageUrl, importedCells, importCsvName, uploadedImageName } =
      get();
    const hasSource = Boolean(selectedDemo || uploadedImageUrl || importedCells?.length);
    if (!hasSource) {
      set({
        error: "Select a demo FOV, upload an image, or import a cell CSV.",
      });
      return;
    }
    set({
      running: true,
      error: null,
      mode: "explorer",
      result: null,
      selectedCellId: null,
      studioScores: null,
      studioDelta: null,
    });
    try {
      let imageBytes: ArrayBuffer | undefined;
      if (uploadedImageUrl) {
        const blob = await fetch(uploadedImageUrl).then((r) => r.blob());
        imageBytes = await blob.arrayBuffer();
      }
      const sourceLabel = [
        uploadedImageName,
        importCsvName,
        selectedDemo?.id,
      ]
        .filter(Boolean)
        .join("+");

      const result = await phenotypeEngine.run(
        {
          demoId: selectedDemo?.id,
          imageBytes,
          // Prefer CSV when present; otherwise segment the image
          importedCells: importedCells ?? undefined,
          sourceLabel: sourceLabel || undefined,
        },
        (stages) => set({ stages }),
      );
      const top = result.candidates[0];
      const second = result.candidates[1];
      set({
        result,
        running: false,
        mode: "explorer",
        selectedPerturbationId: top?.id ?? null,
        compareIds: [top?.id ?? null, second?.id ?? null],
        selectedCellId: result.cells[0]?.id ?? null,
      });
    } catch (e) {
      set({
        running: false,
        error: e instanceof Error ? e.message : "Pipeline failed",
        mode: "intake",
      });
    }
  },

  applyPerturbation: async () => {
    const { result, selectedPerturbationId } = get();
    if (!result || !selectedPerturbationId) return;
    const out = await phenotypeEngine.rescore(result, selectedPerturbationId);
    set({ studioScores: out.scores, studioDelta: out.featureDelta, mode: "rank" });
  },

  reset: () => {
    revokeUrl(get().uploadedImageUrl);
    set({
      mode: "intake",
      stages: [],
      result: null,
      running: false,
      error: null,
      selectedCellId: null,
      selectedPerturbationId: null,
      compareIds: [null, null],
      studioScores: null,
      studioDelta: null,
      uploadedImageUrl: null,
      uploadedImageName: null,
      importedCells: null,
      importCsvName: null,
      importWarnings: [],
      selectedDemo: getDemoFov("u2os-paint-a") ?? null,
    });
  },
}));

export function findCandidate(
  result: PipelineResult | null,
  id: string | null,
): PerturbationCandidate | null {
  if (!result || !id) return null;
  return result.candidates.find((c) => c.id === id) ?? null;
}
