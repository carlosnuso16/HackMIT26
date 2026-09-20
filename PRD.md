# Cyto — Product Requirements Document

**Status:** Active  
**Working name:** Cyto (rename OK; scope unchanged)  
**Tagline:** Paste a cell image. See what it looks like, what it might mean, and what perturbation would improve the phenotype.  
**Inspiration:** [Helix](https://devpost.com/software/helix-pz2n5k) (genomic IDE) → Cyto is the same product pattern for **cells**.

---

## 1. Vision

Cyto is a **cell morphological phenotype IDE**. Researchers (and hackathon judges) go from a microscopy / Cell Painting–style field of view to annotated phenotype scores, ranked perturbation candidates, inspectable cells, simulated edits, and side-by-side comparison—in one authored workspace.

It is **not** CommonGround (patient community), **not** a DNA sequence IDE, and **not** a clinical diagnostic tool.

## 2. Problem

Phenotypic cell analysis is fragmented across ImageJ/Fiji, CellProfiler, notebooks, and ad-hoc scripts. The gap Helix closed for genomics—“I have a sequence” → “I understand and can edit it”—still exists for cells: “I have an image” → “I understand the phenotype and what to try next.”

## 3. Users

| Persona | Need |
| --- | --- |
| Hackathon judge / Regeneron mentor | Understandable 3-minute demo; clear utility for medicines R&D |
| Computational biologist (aspirational) | Faster path from FOV to ranked phenotypic hypotheses |
| Wet-lab scientist (aspirational) | Visual, low-friction inspection and “what if we perturb X?” |

## 4. Core analogy (Helix → Cyto)

| Helix | Cyto |
| --- | --- |
| DNA sequence | Cell FOV / Cell Painting–style image |
| Evo 2 pipeline | Phenotype pipeline (preprocess → segment → embed → label → candidates) |
| Sequence Explorer | Cell Explorer |
| Design Studio | Perturb Studio |
| Genomic Compare | Phenotype Compare |
| Copilot | Mode-aware Copilot |
| AlphaFold viewer | Morphology / embedding visualization (radar, UMAP-style, optional 3D placeholder) |

## 5. Product surfaces (MVP)

All analysis lives in a single corridor at `/analyze` with **modes** (not separate disconnected apps). Landing at `/`.

### 5.1 Landing

- Authored hero: brand **Cyto**, one headline, one supporting line, one CTA into `/analyze`.
- Short “instrument” story; polish over length.

### 5.2 Intake

- Upload image (PNG/JPEG) or load a **bundled demo FOV**.
- Show basic metadata: dimensions, demo label, channel note (RGB or multi-channel fiction).

### 5.3 Phenotype pipeline

- 6–8 staged steps with live progress UI.
- Stages (MVP): ingest → normalize → segment cells → extract features → phenotype score → region cues → generate candidates → rank.
- **Honesty:** `MockPhenotypeEngine` is default (deterministic from image bytes/hash). Real model adapters plug the same interface later.

### 5.4 Candidate ranking

- Leaderboard of perturbation candidates.
- Four score dimensions (MVP): phenotype severity ↓, on-target specificity ↑, off-target risk ↓, novelty ↑.

### 5.5 Cell Explorer (inspect)

- Read-only map of the FOV.
- Click a cell/ROI → morphology features, scores, region context.
- Calm, navigational—not an editing surface.

### 5.6 Perturb Studio (manipulate)

- Dense operational workspace.
- Select a curated intervention (drug class / gene KO / dose band).
- Show feature diffs and rescore bars vs baseline.

### 5.7 Phenotype Compare

- Split view of two candidates (or baseline vs candidate).
- Semantic deltas (green improvement / red regression).

### 5.8 Copilot

- Side panel; suggested prompts change by mode.
- LLM optional; scripted fallbacks required for reliable demos.

## 6. User stories (MVP acceptance)

1. As a demo presenter, I can open Cyto, click a demo cell, and watch the pipeline complete without uploading.
2. As a user, I can click a segmented cell and see features + phenotype scores.
3. As a user, I can apply one perturbation in Studio and see scores change.
4. As a user, I can compare two candidates side by side.
5. As a judge, I can read the README and know what is mocked vs real.

## 7. Non-goals

- Medical diagnosis, eligibility, recruitment, or patient social features.
- Claiming production CellProfiler / JUMP-CP training accuracy without a wired model.
- Keeping the CommonGround/FSHD UI or vinext Sites product shell.
- Full auth, multiplayer, or persistent cloud datasets in MVP.

## 8. Technical requirements

- **Stack:** Next.js (App Router), TypeScript, Tailwind, client workspace store (Zustand).
- **Architecture:** `PhenotypeEngine` interface; `MockPhenotypeEngine` first.
- **License:** MIT.
- **Run:** `npm install && npm run dev`.
- **Docs:** This PRD, `CONTEXT.md`, README with mock vs real callout.

## 9. Success metrics (hackathon)

- End-to-end demo path &lt; 3 minutes.
- Feels like one IDE with modes, not seven microsites.
- Judges remember: “Helix for cells—image in, ranked perturbations out.”

## 10. Out of scope for v0 / later

- Real Cell Painting foundation-model API.
- WebSocket streaming of true backend events.
- Versioned experiment branching.
- Multi-condition plate layouts / full HCS LIMS.

## 11. Greenfield note

CNS’s rudimentary prototype was not pushed to this repo. Cyto is built from scratch. If that code appears later, evaluate as a reference adapter—do not block MVP on it.
