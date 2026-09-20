# CommonGround domain glossary

Shared language for product and architecture. Prefer these names in code and docs.

| Term | Meaning |
| --- | --- |
| **Condition pack** | Demo content for one fictional/rare-condition community (aliases, topics, seed posts, research copy). Loaded via `getDemoContent`. |
| **Safe alias** | Pseudonymous display name. The only value persisted in the browser (`cg-safe-alias`). Not a legal name, diagnosis proof, or study ID. |
| **Pending post** | Draft that has entered local safety review but is not yet shared or themed. |
| **Local discussion post** | Session-only community post that stays on the home feed. Never crosses into the Research room as full text. |
| **Research theme** | Anonymous, count-like signal derived from a Research-room review. Carries topic + timestamp only—**no post text**. |
| **Local safety review** | Affirmation step before sharing (P5). Explains what will be grouped vs kept local. |
| **Protected signal** | Aggregate, privacy-preserving counts researchers may see (P6 / R1). No aliases tied to health data. |
| **Research room** | Patient-led space for anonymous themes and fictional protocol implications—not recruitment or eligibility. |
| **Governance path** | Intended real-world sequence: moderation → patient-advisory → ethics → separate opt-in outreach. Not automated in the MVP. |
| **Demo reset** | Erase local alias + session posts/themes/support so a presentation starts clean. |

## Explicit non-goals (this prototype)

- Medical advice, diagnosis, or eligibility decisions
- Trial matching or recruitment lists
- Health-record collection or individual-level researcher export
- Server-side persistence of posts (until consent + authorization are designed)
