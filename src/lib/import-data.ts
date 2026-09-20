import type { CellInstance, MorphologyFeatures } from "./types";

const FEATURE_KEYS: (keyof MorphologyFeatures)[] = [
  "area",
  "eccentricity",
  "texture",
  "intensityMean",
  "intensityStd",
  "neighborDensity",
];

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

export function isSupportedImageFile(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true;
  return /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}

export function isCsvFile(file: File): boolean {
  return (
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel" ||
    /\.csv$/i.test(file.name)
  );
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function toNum(raw: string | undefined, fallback: number): number {
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function phenotypeFromFeatures(f: MorphologyFeatures): number {
  return Math.max(
    0,
    Math.min(
      100,
      f.texture * 35 +
        f.neighborDensity * 25 +
        (1 - f.intensityMean) * 20 +
        f.eccentricity * 15 +
        (f.area / 100) * 10,
    ),
  );
}

function labelFromScore(score: number): string {
  if (score > 70) return "Stressed morphology";
  if (score > 45) return "Intermediate drift";
  return "Baseline-like";
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

const HEADER_ALIASES: Record<string, string> = {
  id: "id",
  cell_id: "id",
  cellid: "id",
  x: "x",
  y: "y",
  xpos: "x",
  ypos: "y",
  area: "area",
  eccentricity: "eccentricity",
  texture: "texture",
  intensitymean: "intensityMean",
  intensity_mean: "intensityMean",
  mean_intensity: "intensityMean",
  intensitystd: "intensityStd",
  intensity_std: "intensityStd",
  std_intensity: "intensityStd",
  neighbordensity: "neighborDensity",
  neighbor_density: "neighborDensity",
  phenotypescore: "phenotypeScore",
  phenotype_score: "phenotypeScore",
  score: "phenotypeScore",
  r: "r",
  radius: "r",
};

/**
 * Parse a CellProfiler-style (or Cyto) CSV into cell instances.
 * Required: x, y (0–1 preferred; values >1 are treated as pixels and normalized).
 * Optional morphology columns and phenotypeScore.
 */
export function parseCellsCsv(text: string): {
  cells: CellInstance[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV needs a header row and at least one data row.");
  }

  const rawHeaders = parseCsvLine(lines[0]!);
  const headers = rawHeaders.map((h) => {
    const key = normalizeHeader(h);
    return HEADER_ALIASES[key] ?? HEADER_ALIASES[key.replace(/_/g, "")] ?? key;
  });

  const idx = (name: string) => headers.indexOf(name);
  const xI = idx("x");
  const yI = idx("y");
  if (xI < 0 || yI < 0) {
    throw new Error(
      "CSV must include x and y columns (normalized 0–1, or pixel coords).",
    );
  }

  const preview: { x: number; y: number }[] = [];
  for (let i = 1; i < Math.min(lines.length, 40); i++) {
    const cols = parseCsvLine(lines[i]!);
    preview.push({ x: toNum(cols[xI], NaN), y: toNum(cols[yI], NaN) });
  }
  const maxX = Math.max(...preview.map((p) => p.x).filter(Number.isFinite), 1);
  const maxY = Math.max(...preview.map((p) => p.y).filter(Number.isFinite), 1);
  const pixelSpace = maxX > 1.5 || maxY > 1.5;
  if (pixelSpace) {
    warnings.push(
      "Detected pixel coordinates — normalizing x/y by max values in the file.",
    );
  }

  const cells: CellInstance[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    if (cols.every((c) => c === "")) continue;

    let x = toNum(cols[xI], NaN);
    let y = toNum(cols[yI], NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      warnings.push(`Skipped row ${i + 1}: missing x/y.`);
      continue;
    }
    if (pixelSpace) {
      x = clamp01(x / maxX);
      y = clamp01(y / maxY);
    } else {
      x = clamp01(x);
      y = clamp01(y);
    }

    const features: MorphologyFeatures = {
      area: toNum(cols[idx("area")], 50),
      eccentricity: clamp01(toNum(cols[idx("eccentricity")], 0.4)),
      texture: clamp01(toNum(cols[idx("texture")], 0.4)),
      intensityMean: clamp01(toNum(cols[idx("intensityMean")], 0.5)),
      intensityStd: clamp01(toNum(cols[idx("intensityStd")], 0.2)),
      neighborDensity: clamp01(toNum(cols[idx("neighborDensity")], 0.3)),
    };

    const scoreRaw = cols[idx("phenotypeScore")];
    const phenotypeScore =
      scoreRaw != null && scoreRaw !== ""
        ? Math.max(0, Math.min(100, toNum(scoreRaw, 50)))
        : phenotypeFromFeatures(features);

    const idCol = cols[idx("id")];
    const r = clamp01(toNum(cols[idx("r")], 0.04 + (features.area / 100) * 0.03));

    cells.push({
      id: idCol && idCol.length ? idCol : `cell-${cells.length + 1}`,
      x,
      y,
      r: Math.max(0.02, Math.min(0.12, r)),
      features,
      phenotypeScore,
      label: labelFromScore(phenotypeScore),
    });
  }

  if (cells.length === 0) {
    throw new Error("No valid cell rows found in CSV.");
  }
  if (cells.length > 2000) {
    warnings.push(`Loaded ${cells.length} cells — large maps may feel slow.`);
  }

  // unused FEATURE_KEYS kept for docs parity
  void FEATURE_KEYS;

  return { cells, warnings };
}

export { SAMPLE_CSV_PATH } from "./public-data";

export const CSV_FORMAT_HELP = `Expected columns (header required):
x, y — position (0–1 preferred, or pixels)
Optional: id, area, eccentricity, texture, intensityMean, intensityStd, neighborDensity, phenotypeScore, r`;
