# Cyto domain glossary

Shared language for product and code. Prefer these terms in UI copy and module names.

| Term | Meaning |
| --- | --- |
| **FOV** | Field of view — the uploaded or demo microscopy image under analysis. |
| **Demo cell set** | Bundled sample FOVs shipped with the app for offline demos. |
| **Phenotype pipeline** | Ordered stages from ingest to ranked perturbation candidates. |
| **PhenotypeEngine** | Interface that runs the pipeline; mock or real adapters implement it. |
| **Cell instance** | A segmented cell (or ROI) inside an FOV, selectable in Explorer. |
| **Morphology features** | Numeric descriptors (area, eccentricity, texture proxies, channel intensities). |
| **Phenotype score** | Aggregate score summarizing how “perturbed / severe / interesting” a cell or FOV looks (demo metric). |
| **Perturbation candidate** | A proposed intervention (e.g. drug class, gene KO) with multi-axis scores. |
| **Explorer** | Read-only inspection mode for the FOV and cell instances. |
| **Cell map / stage** | Spatial view of segmented cells in the FOV. Pan to browse; click a cell to inspect features—not for diagnosis. |
| **Perturb Studio** | Editing mode: apply a simulated perturbation and rescore. |
| **Compare** | Side-by-side candidate (or baseline vs candidate) diff with semantic deltas. |
| **Copilot** | Mode-aware assistant panel; may be scripted or LLM-backed. |
| **Workspace** | In-memory session state for one FOV analysis (Zustand store). |

## Explicit non-goals

- Clinical diagnosis or treatment recommendations.
- DNA sequence editing (that is Helix’s domain).
- Patient community / trial recruitment (retired CommonGround scope).
