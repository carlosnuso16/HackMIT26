# Implemented vs aspirational

Maps `FUNCTIONS.md` IDs to what the current demo actually ships. Update this when behavior changes.

| ID | Status | Where |
| --- | --- | --- |
| P1 Join a disease community | **Partial** | Home intro + topics from condition pack (`lib/demo-content`) |
| P2 Choose a public identity | **Done (demo)** | Safe alias via `lib/alias-store` + Profile |
| P3 Understand data boundaries | **Done (demo)** | Privacy banner, review copy, research-room copy |
| P4 Share study-relevant experience | **Not built** | Structured preference form |
| P5 Confirm before sharing | **Done (demo)** | `lib/review-flow` + `Review` UI |
| P6 See a collective signal | **Partial** | `lib/aggregate-signal` + SignalPanel / ResearchRoom counts |
| P7 Set research priorities | **Not built** | Outcome ranking |
| P8 Participate in priority voting | **Not built** | Vote allocation |
| P9 Discuss research safely | **Partial** | Local feed posts + moderation copy; no server moderation |
| P10 Control future contact | **Not built** | Opt-in contact controls |
| R1 Aggregate cohort only | **Partial** | Protected signals; fictional baselines |
| R2 Community priorities | **Not built** | |
| R3 Participation constraints | **Not built** | |
| R4 Burden scenarios | **Not built** | Earlier commits had protocol demos; not in current UI |
| R5 Transparent design explanation | **Partial** | Static fictional protocol implication copy |
| R6 Study concept brief | **Not built** | |
| R7 Governance workflow | **Documented only** | Copy in Research room footer |

## Spec sources (do not treat as implemented)

- `FUNCTIONS.md` — full product inventory
- `rare_disease_cohort_mvp_prompt_v0.md` — earlier Aster / charts / voting framing
- `HANDOFF.md` — accurate description of the committed demo
