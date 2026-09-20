# CommonGround — Partner Handoff

## Current state

CommonGround is a polished, **frontend-only** HackMIT prototype for a patient-led rare-disease research community. The working demo is focused on FSHD (facioscapulohumeral muscular dystrophy) and makes the product boundary explicit: it uses fictional/synthetic information, does not give medical advice, and never performs trial matching or eligibility decisions.

The current committed implementation is the product experience described below. The repository is on `main`; the latest product commit is `e1a240b` (`Generalize CommonGround across conditions`).

## What works in the demo

- A Community home screen with fictional discussion posts and condition/topic navigation.
- A generated pseudonymous identity, persisted only as `cg-safe-alias` in the browser's `localStorage`.
- A local-only compose/review flow. New posts are kept in React state and disappear on refresh.
- A Research room that carries forward only an anonymous, count-like local theme from the `Research room` topic; it deliberately does not carry the post's text forward.
- A local support control that updates only the current browser session.
- A profile screen to regenerate the alias or erase the local demo state.
- Prominent safety language covering fictional data, no health-record collection, no diagnosis/recruitment, and the real-world governance path.

## Where to look

| Area | Location | Notes |
| --- | --- | --- |
| Main product UI and all demo interaction | `app/page.tsx` | Single client component; the state is intentionally in-memory/local-browser only. |
| Visual design | `app/globals.css` | Styles for the full experience. |
| Product/function specification | `FUNCTIONS.md` | Patient/researcher functions plus safety requirements and suggested build order. |
| Original MVP brief | `rare_disease_cohort_mvp_prompt_v0.md` | Product framing and source context. |
| Static hosting configuration | `.openai/hosting.json`, `next.config.ts` | Configured for a static `dist/` output. |
| Optional future data layer | `db/schema.ts`, `db/index.ts` | Schema is intentionally empty; D1 is not currently configured. |

## Run locally

Requirements: Node 22.13 or newer and dependencies already installed (or run `npm ci`).

```powershell
npm run dev
```

The portable development server normally starts at `http://localhost:5173`. For a production/static build:

```powershell
npm run build
```

Useful checks:

```powershell
npm run lint
npm run build
```

## Important implementation boundaries

- There is no API, user account, database persistence, moderation service, authentication integration, or real patient data in the active product flow.
- `app/chatgpt-auth.ts` is starter support code and is not used by `app/page.tsx`.
- The live UI names FSHD in its copy. The project was recently generalized in generated static content, but condition-specific copy in the React UI remains deliberate for the demo.
- `dist/` is generated build output. Do not hand-edit it; rebuild it after app changes when preparing a static deployment.
- Do not introduce real health data, individual-level researcher access, study matching, or contact/recruitment flows without first designing consent, governance, privacy, and appropriate review.

## Suggested next work

1. Move copy/content (condition name, themes, fictional seed posts) from `app/page.tsx` into a clearly labeled demo content model so another rare condition can be swapped in safely.
2. Split `app/page.tsx` into small components and add focused tests for the privacy-preserving local review flow.
3. If persistence is needed, define only the minimum pseudonymous and consent-aware schema first; add server-side authorization before any write path.
4. Add an explicit mock/demo reset affordance or a short demo script for presentations.
5. Rebuild `dist/` and perform a visual pass before publishing after any UI change.

## Working tree note (at this handoff)

The repository has generated/uncommitted artifacts that are intentionally **not** part of this handoff commit:

- `dist/index.html` has a local modification (generated output).
- `commonground-*.tar.gz` and `commonground-site.zip` are packaged archives.
- `output/` and `tmp/` contain draft submission/PDF working files.

Keep, archive, or ignore those separately based on submission needs. This commit adds only this handoff document and does not alter the current demo implementation or generated artifacts.
