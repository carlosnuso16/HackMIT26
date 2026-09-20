import type { CellInstance, MorphologyFeatures } from "./types";

export type SegmentOptions = {
  maxCells?: number;
  minArea?: number;
  maxAreaFrac?: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
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

type Blob = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  sumX: number;
  sumY: number;
  sumL: number;
  area: number;
};

/**
 * Client-side FOV segmentation: find bright (or dark) blobs and return
 * normalized cell centroids that align with the image plane (0–1).
 */
export async function segmentCellsFromImage(
  bytes: ArrayBuffer,
  opts: SegmentOptions = {},
): Promise<{ cells: CellInstance[]; notes: string[] }> {
  const maxCells = opts.maxCells ?? 80;
  const minArea = opts.minArea ?? 12;
  const maxAreaFrac = opts.maxAreaFrac ?? 0.08;
  const notes: string[] = [];

  if (typeof createImageBitmap === "undefined") {
    throw new Error("Image segmentation needs a browser environment.");
  }

  const bitmap = await createImageBitmap(new Blob([bytes]));
  const maxDim = 420;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const maxArea = Math.floor(w * h * maxAreaFrac);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not read image pixels.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const { data } = ctx.getImageData(0, 0, w, h);
  const lum = new Float32Array(w * h);
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const L =
      0.2126 * data[o]! + 0.7152 * data[o + 1]! + 0.0722 * data[o + 2]!;
    lum[i] = L;
    sum += L;
    sumSq += L * L;
  }
  const mean = sum / (w * h);
  const variance = Math.max(0, sumSq / (w * h) - mean * mean);
  const std = Math.sqrt(variance);

  // Bright-field plates are light; fluorescence is dark with bright cells.
  const invert = mean > 118;
  notes.push(
    invert
      ? "Detected bright background — finding darker cell regions."
      : "Detected dark background — finding brighter cell regions.",
  );

  const signal = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    signal[i] = invert ? 255 - lum[i]! : lum[i]!;
  }

  let sSum = 0;
  let sSq = 0;
  for (let i = 0; i < w * h; i++) {
    sSum += signal[i]!;
    sSq += signal[i]! * signal[i]!;
  }
  const sMean = sSum / (w * h);
  const sStd = Math.sqrt(Math.max(0, sSq / (w * h) - sMean * sMean));
  const threshold = Math.min(245, sMean + Math.max(14, sStd * 0.85));

  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    mask[i] = signal[i]! >= threshold ? 1 : 0;
  }

  // Light morphological open: clear 1px speckles
  const cleaned = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          n += mask[(y + dy) * w + (x + dx)]!;
        }
      }
      if (n >= 5) cleaned[i] = 1;
    }
  }

  const seen = new Uint8Array(w * h);
  const blobs: Blob[] = [];
  const stack: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const start = y * w + x;
      if (!cleaned[start] || seen[start]) continue;

      let minX = x,
        maxX = x,
        minY = y,
        maxY = y;
      let sumX = 0,
        sumY = 0,
        sumL = 0,
        area = 0;

      stack.length = 0;
      stack.push(start);
      seen[start] = 1;

      while (stack.length) {
        const i = stack.pop()!;
        const cx = i % w;
        const cy = (i / w) | 0;
        area++;
        sumX += cx;
        sumY += cy;
        sumL += signal[i]!;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [i - 1, i + 1, i - w, i + w];
        for (const n of neighbors) {
          if (n < 0 || n >= w * h || seen[n] || !cleaned[n]) continue;
          const nx = n % w;
          const ny = (n / w) | 0;
          if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
          seen[n] = 1;
          stack.push(n);
        }
      }

      if (area < minArea || area > maxArea) continue;
      blobs.push({ minX, minY, maxX, maxY, sumX, sumY, sumL, area });
    }
  }

  blobs.sort((a, b) => b.area - a.area);
  const selected = blobs.slice(0, maxCells);

  if (selected.length === 0) {
    notes.push(
      "No cell-like regions found — try a higher-contrast FOV or import a cell CSV.",
    );
    return { cells: [], notes };
  }

  // Neighbor density from nearest centroids
  const centroids = selected.map((b) => ({
    x: b.sumX / b.area / w,
    y: b.sumY / b.area / h,
  }));

  const cells: CellInstance[] = selected.map((b, idx) => {
    const cx = b.sumX / b.area;
    const cy = b.sumY / b.area;
    const bw = b.maxX - b.minX + 1;
    const bh = b.maxY - b.minY + 1;
    const equivR = Math.sqrt(b.area / Math.PI);
    const r = clamp01((equivR / Math.min(w, h)) * 1.15);
    const intensityMean = clamp01((b.sumL / b.area) / 255);
    const eccentricity = clamp01(1 - Math.min(bw, bh) / Math.max(bw, bh));
    const areaFeat = clamp01(b.area / maxArea) * 100;

    let nearest = Infinity;
    for (let j = 0; j < centroids.length; j++) {
      if (j === idx) continue;
      const d = Math.hypot(centroids[idx]!.x - centroids[j]!.x, centroids[idx]!.y - centroids[j]!.y);
      if (d < nearest) nearest = d;
    }
    const neighborDensity = clamp01(nearest === Infinity ? 0 : 1 - nearest / 0.35);
    const texture = clamp01(0.25 + eccentricity * 0.35 + (1 - intensityMean) * 0.2);

    const features: MorphologyFeatures = {
      area: Math.round(areaFeat * 10) / 10,
      eccentricity: Math.round(eccentricity * 100) / 100,
      texture: Math.round(texture * 100) / 100,
      intensityMean: Math.round(intensityMean * 100) / 100,
      intensityStd: Math.round(Math.min(0.5, sStd / 255) * 100) / 100,
      neighborDensity: Math.round(neighborDensity * 100) / 100,
    };
    const phenotypeScore = Math.round(phenotypeFromFeatures(features) * 10) / 10;

    return {
      id: `cell-${idx + 1}`,
      x: clamp01(cx / w),
      y: clamp01(cy / h),
      r: Math.max(0.018, Math.min(0.1, r)),
      features,
      phenotypeScore,
      label: labelFromScore(phenotypeScore),
    };
  });

  notes.push(`Segmented ${cells.length} cell regions from the FOV image.`);
  return { cells, notes };
}
