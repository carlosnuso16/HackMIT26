# Cyto

**Helix for cells** — a morphological phenotype IDE. Upload/load a FOV, run a phenotype pipeline, explore cells, simulate perturbations, and compare candidates.

See **[PRD.md](./PRD.md)** and **[CONTEXT.md](./CONTEXT.md)**.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Open workspace** → `/analyze`.

**Product demo reel:** [http://localhost:3000/demo](http://localhost:3000/demo) (autoplay ~64s). Recorded file: `public/demos/cyto-demo.webm`. Re-record with `npm run record-demo` while `npm run dev` is running.

Toggle light/dark from the header (moon/sun). Preference is saved locally.

## Import your data

In **Source**:

- **Load sample FOV** — bundled demo image (`public/demos/sample-fov.png`)
- **Upload a FOV image** — client-side segmentation places cells on the image
- **Optional cell CSV** — use only if you already have accurate `x,y` positions

CSV needs `x` and `y` (0–1 preferred, or pixels). Optional morphology columns: `id`, `area`, `eccentricity`, `texture`, `intensityMean`, `intensityStd`, `neighborDensity`, `phenotypeScore`, `r`.

### Public image sources (verified pages)

| Source | URL | Notes |
| --- | --- | --- |
| BBBC022 Cell Painting | https://bbbc.broadinstitute.org/BBBC022 | Dataset page — export TIFF → PNG before upload |
| BBBC039 nuclei | https://bbbc.broadinstitute.org/BBBC039 | Smaller set, easier single FOVs |
| Cell Image Library | https://www.cellimagelibrary.org/images | Browse & download fluorescence images |
| BioImage Archive | https://www.ebi.ac.uk/bioimage-archive/ | Published screens |

BBBC **metadata** CSVs list image filenames — they are not per-cell tables.

## What’s real vs mocked

| Layer | Status |
| --- | --- |
| Product UX (Source → Cells → Rank) | **Real** |
| Image import + client segmentation / FOV overlay | **Real** (browser pixels) |
| Dark / light theme | **Real** |
| Perturbation rankings | **Simulated** (`MockPhenotypeEngine`) |
| Foundation-model / CellProfiler backend | **Not wired** — same `PhenotypeEngine` interface ready for adapters |

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind · Zustand · Lucide

## License

MIT. Regeneron challenge materials in-repo are reference only.
