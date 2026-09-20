export type AnalyzeMode =
  | "intake"
  | "pipeline"
  | "rank"
  | "explorer"
  | "studio"
  | "compare"
  | "copilot";

export type MorphologyFeatures = {
  area: number;
  eccentricity: number;
  texture: number;
  intensityMean: number;
  intensityStd: number;
  neighborDensity: number;
};

export type CellInstance = {
  id: string;
  x: number; // 0–1 normalized in FOV
  y: number;
  r: number; // radius as fraction of min dimension
  features: MorphologyFeatures;
  phenotypeScore: number;
  label: string;
};

export type ScoreAxes = {
  severity: number; // lower better for "health" narrative; we treat as 0–100 display
  specificity: number;
  offTargetRisk: number;
  novelty: number;
};

export type PerturbationCandidate = {
  id: string;
  name: string;
  kind: "drug" | "gene_ko" | "dose";
  description: string;
  scores: ScoreAxes;
  composite: number;
};

export type PipelineStage = {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
};

export type PipelineResult = {
  stages: PipelineStage[];
  cells: CellInstance[];
  candidates: PerturbationCandidate[];
  fovSummary: {
    cellCount: number;
    meanPhenotype: number;
    notes: string[];
  };
};

export type DemoFov = {
  id: string;
  name: string;
  description: string;
  /** Flat mock FOV plate color key */
  visual: "emerald" | "amber" | "violet";
  width: number;
  height: number;
};

export interface PhenotypeEngine {
  run(
    input: {
      demoId?: string;
      imageBytes?: ArrayBuffer;
      importedCells?: CellInstance[];
      sourceLabel?: string;
    },
    onStage?: (stages: PipelineStage[]) => void,
  ): Promise<PipelineResult>;
  rescore(
    baseline: PipelineResult,
    perturbationId: string,
  ): Promise<{ scores: ScoreAxes; featureDelta: Partial<MorphologyFeatures> }>;
}
