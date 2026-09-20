const STORAGE_KEY = "cyto-onboarding-v1";

export type TourStep = {
  id: string;
  path: "/" | "/analyze";
  /** CSS selector for data-tour target; omit for centered card */
  target?: string;
  title: string;
  body: string;
  /** Preferred tooltip placement relative to target */
  placement?: "bottom" | "top" | "right" | "left";
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    path: "/",
    target: '[data-tour="cta"]',
    placement: "bottom",
    title: "Welcome to Cyto",
    body: "This is a phenotype IDE. Open the workspace to load a FOV and run analysis.",
  },
  {
    id: "preview",
    path: "/",
    target: '[data-tour="preview"]',
    placement: "left",
    title: "Image stage",
    body: "The workspace centers on a microscopy-style stage where detected cells appear after analysis.",
  },
  {
    id: "modes",
    path: "/analyze",
    target: '[data-tour="modes"]',
    placement: "right",
    title: "Three steps",
    body: "Source (load data) → Cells (inspect) → Rank (perturbations). Keep it simple.",
  },
  {
    id: "stage",
    path: "/analyze",
    target: '[data-tour="stage"]',
    placement: "right",
    title: "Field of view",
    body: "After analysis, cells are placed on the image from pixel detection. Drag to pan, click to inspect.",
  },
  {
    id: "panel",
    path: "/analyze",
    target: '[data-tour="panel"]',
    placement: "left",
    title: "Controls",
    body: "Upload a FOV or pick a demo here, then run analysis. Details stay in this dock.",
  },
  {
    id: "run",
    path: "/analyze",
    target: '[data-tour="run"]',
    placement: "top",
    title: "Run analysis",
    body: "Segments cells from your image (or uses a CSV if you provide one), then opens the cell inspector.",
  },
];

export function readTourCompleted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "done";
  } catch {
    return true;
  }
}

export function writeTourCompleted(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    /* ignore */
  }
}

export function clearTourCompleted(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readTourStepIndex(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:step`);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(n, TOUR_STEPS.length - 1)) : 0;
  } catch {
    return 0;
  }
}

export function writeTourStepIndex(index: number): void {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:step`, String(index));
  } catch {
    /* ignore */
  }
}
