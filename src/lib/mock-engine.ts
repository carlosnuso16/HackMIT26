import type {
  CellInstance,
  MorphologyFeatures,
  PerturbationCandidate,
  PhenotypeEngine,
  PipelineResult,
  PipelineStage,
  ScoreAxes,
} from "./types";
import { segmentCellsFromImage } from "./segment-image";

const STAGE_LABELS = [
  ["ingest", "Ingest FOV"],
  ["normalize", "Normalize channels"],
  ["segment", "Segment cells"],
  ["features", "Extract morphology features"],
  ["phenotype", "Score phenotypes"],
  ["regions", "Detect region cues"],
  ["candidates", "Generate perturbations"],
  ["rank", "Rank candidates"],
] as const;

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function featuresFromRand(rand: () => number): MorphologyFeatures {
  return {
    area: 40 + rand() * 60,
    eccentricity: rand(),
    texture: rand(),
    intensityMean: 0.2 + rand() * 0.7,
    intensityStd: rand() * 0.4,
    neighborDensity: rand(),
  };
}

function phenotypeFromFeatures(f: MorphologyFeatures): number {
  return clamp(
    f.texture * 35 +
      f.neighborDensity * 25 +
      (1 - f.intensityMean) * 20 +
      f.eccentricity * 15 +
      (f.area / 100) * 10,
  );
}

function labelFromScore(score: number): string {
  if (score > 70) return "Stressed morphology";
  if (score > 45) return "Intermediate drift";
  return "Baseline-like";
}

function buildCells(seed: number, count: number): CellInstance[] {
  const rand = mulberry32(seed);
  const cells: CellInstance[] = [];
  for (let i = 0; i < count; i++) {
    const features = featuresFromRand(rand);
    const phenotypeScore = phenotypeFromFeatures(features);
    cells.push({
      id: `cell-${i + 1}`,
      x: 0.12 + rand() * 0.76,
      y: 0.12 + rand() * 0.76,
      r: 0.035 + rand() * 0.04,
      features,
      phenotypeScore,
      label: labelFromScore(phenotypeScore),
    });
  }
  return cells;
}

const CANDIDATE_TEMPLATES: Omit<PerturbationCandidate, "scores" | "composite">[] =
  [
    {
      id: "pert-hdac",
      name: "HDAC inhibitor class",
      kind: "drug",
      description: "Chromatin relaxation hypothesis for texture-heavy stress.",
    },
    {
      id: "pert-mapk",
      name: "MAPK pathway damper",
      kind: "drug",
      description: "Downstream stress signaling attenuation.",
    },
    {
      id: "pert-tp53ko",
      name: "TP53 knockdown (sim)",
      kind: "gene_ko",
      description: "Simulated KO — demo only, not a wet-lab protocol.",
    },
    {
      id: "pert-dose-low",
      name: "Low-dose rescue band",
      kind: "dose",
      description: "Conservative titration to reduce off-target risk.",
    },
    {
      id: "pert-autophagy",
      name: "Autophagy inducer",
      kind: "drug",
      description: "Clearance of aggregated / high-texture phenotypes.",
    },
  ];

function scoreCandidates(seed: number, meanPhenotype: number): PerturbationCandidate[] {
  const rand = mulberry32(seed ^ 0xabcdef);
  return CANDIDATE_TEMPLATES.map((t, i) => {
    const severity = clamp(meanPhenotype - 10 - rand() * 25 + i * 2);
    const specificity = clamp(55 + rand() * 40 - i * 3);
    const offTargetRisk = clamp(15 + rand() * 50 + i * 4);
    const novelty = clamp(30 + rand() * 60);
    const scores: ScoreAxes = { severity, specificity, offTargetRisk, novelty };
    // Higher composite = better candidate for demo ranking
    const composite = clamp(
      specificity * 0.35 +
        (100 - severity) * 0.3 +
        (100 - offTargetRisk) * 0.2 +
        novelty * 0.15,
    );
    return { ...t, scores, composite };
  }).sort((a, b) => b.composite - a.composite);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class MockPhenotypeEngine implements PhenotypeEngine {
  async run(
    input: {
      demoId?: string;
      imageBytes?: ArrayBuffer;
      importedCells?: CellInstance[];
      sourceLabel?: string;
    },
    onStage?: (stages: PipelineStage[]) => void,
  ): Promise<PipelineResult> {
    const hasCsv = Boolean(input.importedCells?.length);
    const hasImage = Boolean(input.imageBytes?.byteLength);
    const key =
      input.sourceLabel ??
      input.demoId ??
      `upload-${input.imageBytes?.byteLength ?? 0}`;
    const seed = hashString(key);

    const labels = hasCsv
      ? ([
          ["ingest", "Ingest FOV / table"],
          ["normalize", "Normalize coordinates"],
          ["segment", "Load imported cell instances"],
          ["features", "Read morphology columns"],
          ["phenotype", "Score phenotypes"],
          ["regions", "Map spatial layout"],
          ["candidates", "Generate perturbations"],
          ["rank", "Rank candidates"],
        ] as const)
      : hasImage
        ? ([
            ["ingest", "Ingest FOV image"],
            ["normalize", "Normalize intensity"],
            ["segment", "Detect cell regions"],
            ["features", "Measure morphology"],
            ["phenotype", "Score phenotypes"],
            ["regions", "Map spatial layout"],
            ["candidates", "Generate perturbations"],
            ["rank", "Rank candidates"],
          ] as const)
        : STAGE_LABELS;

    let stages: PipelineStage[] = labels.map(([id, label]) => ({
      id,
      label,
      status: "pending",
    }));
    onStage?.(stages);

    let cells: CellInstance[] = [];
    let segmentNotes: string[] = [];

    for (let i = 0; i < stages.length; i++) {
      stages = stages.map((s, idx) => ({
        ...s,
        status: idx < i ? "done" : idx === i ? "running" : "pending",
      }));
      onStage?.(stages);

      // Run segmentation when that stage starts
      if (stages[i]?.id === "segment") {
        if (hasCsv) {
          cells = input.importedCells!;
          segmentNotes = ["Using imported cell table for positions and features."];
        } else if (hasImage && input.imageBytes) {
          try {
            const out = await segmentCellsFromImage(input.imageBytes);
            cells = out.cells;
            segmentNotes = out.notes;
          } catch (e) {
            throw new Error(
              e instanceof Error ? e.message : "Could not segment the FOV image",
            );
          }
          if (cells.length === 0) {
            throw new Error(
              "No cells detected in this image. Try a higher-contrast FOV or import a cell CSV with x,y.",
            );
          }
        } else {
          cells = buildCells(seed, 14 + (seed % 8));
          segmentNotes = [
            "Demo FOV — synthetic cell layout (no image pixels to segment).",
          ];
        }
      }

      await sleep(hasCsv || hasImage ? 70 + (i % 3) * 20 : 160 + (i % 3) * 35);
    }

    if (cells.length === 0) {
      cells = hasCsv
        ? input.importedCells!
        : buildCells(seed, 14 + (seed % 8));
    }

    const meanPhenotype =
      cells.reduce((a, c) => a + c.phenotypeScore, 0) / cells.length;
    const candidates = scoreCandidates(seed, meanPhenotype);

    stages = stages.map((s) => ({ ...s, status: "done" }));
    onStage?.(stages);

    return {
      stages,
      cells,
      candidates,
      fovSummary: {
        cellCount: cells.length,
        meanPhenotype: Math.round(meanPhenotype * 10) / 10,
        notes: [
          ...segmentNotes,
          "Perturbation rankings are simulated (MockPhenotypeEngine).",
          "Not a clinical or wet-lab decision tool.",
        ],
      },
    };
  }

  async rescore(
    baseline: PipelineResult,
    perturbationId: string,
  ): Promise<{ scores: ScoreAxes; featureDelta: Partial<MorphologyFeatures> }> {
    const seed = hashString(perturbationId + baseline.fovSummary.cellCount);
    const rand = mulberry32(seed);
    const base = baseline.candidates.find((c) => c.id === perturbationId);
    const scores: ScoreAxes = base
      ? {
          severity: clamp(base.scores.severity - 8 - rand() * 10),
          specificity: clamp(base.scores.specificity + rand() * 8),
          offTargetRisk: clamp(base.scores.offTargetRisk - rand() * 6),
          novelty: base.scores.novelty,
        }
      : {
          severity: 40,
          specificity: 60,
          offTargetRisk: 35,
          novelty: 50,
        };

    return {
      scores,
      featureDelta: {
        texture: -0.08 - rand() * 0.1,
        neighborDensity: -0.05 - rand() * 0.08,
        intensityMean: 0.04 + rand() * 0.06,
      },
    };
  }
}

export const phenotypeEngine = new MockPhenotypeEngine();
