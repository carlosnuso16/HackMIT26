# CommonGround — Partner Handoff

## Current state

CommonGround is a polished, **frontend-only** HackMIT prototype for a patient-led rare-disease research community. The working demo is focused on FSHD (facioscapulohumeral muscular dystrophy) and makes the product boundary explicit: it uses fictional/synthetic information, does not give medical advice, and never performs trial matching or eligibility decisions.

Architecture was deepened after the initial handoff: demo content, privacy/review rules, alias storage, and aggregate signals live in deep `lib/` modules with unit tests. UI screens live under `components/commonground/`.

## What works in the demo

- A Community home screen with fictional discussion posts and condition/topic navigation.
- A generated pseudonymous identity, persisted only as `cg-safe-alias` in the browser's `localStorage` (via `lib/alias-store`).
- A local compose → **safety review** → approve flow (`lib/review-flow`).
  - **Research room** topics become anonymous themes (no post text).
  - **Other topics** become session-local feed posts.
- A Research room that shows protected counts and fictional protocol implications.
- A local support control that updates only the current browser session.
- A profile screen to regenerate the alias or erase the local demo state.
- Prominent safety language covering fictional data, no health-record collection, no diagnosis/recruitment, and the real-world governance path.

## Where to look

| Area | Location | Notes |
| --- | --- | --- |
| Shell / tab state | `app/page.tsx` | Thin client orchestrator |
| UI screens | `components/commonground/*` | Composer, Review, Post, ResearchRoom, Profile, SignalPanel |
| Condition pack | `lib/demo-content/` | Swap FSHD (or add packs) without editing UI |
| Privacy / review rules | `lib/review-flow.ts` | Pure; covered by `lib/*.test.ts` |
| Alias persistence | `lib/alias-store.ts` | Browser + memory adapters |
| Protected signals | `lib/aggregate-signal.ts` | P6 / R1 view model |
| Domain glossary | `CONTEXT.md` | Shared vocabulary |
| Spec map | `IMPLEMENTED.md` | FUNCTIONS.md → shipped vs not |
| Judge script | `DEMO_SCRIPT.md` | 3-minute walkthrough |
| Visual design | `app/globals.css` | Styles for the full experience |
| Product/function specification | `FUNCTIONS.md` | Patient/researcher functions + build order |
| Static hosting configuration | `.openai/hosting.json`, `next.config.ts` | Configured for a static `dist/` output |
| Optional future data layer | `db/schema.ts`, `db/index.ts` | Documented minimum tables; **unwired** |

## Scaffold vs product (quarantine)

The repo still contains vinext/Sites starter material that the demo **does not use**:

- `components/ui/**` — shadcn kit (~7k LOC); unused by CommonGround screens
- `app/chatgpt-auth.ts` — optional SIWC helpers; unused by `app/page.tsx`
- `examples/d1/` — D1 sample; excluded from `tsconfig`
- Heavy unused deps (recharts, react-hook-form, etc.) remain for future Sites work

Do not assume those modules are part of the product. Prefer `components/commonground` and `lib/*`.

## Run locally

Requirements: Node 22.13 or newer and dependencies already installed (or run `npm ci`).

```bash
npm run dev
```

Portable development server normally starts at `http://localhost:5173`.

```bash
npm test
npm run lint
npm run build
```

## Important implementation boundaries

- There is no API, user account, database persistence, moderation service, authentication integration, or real patient data in the active product flow.
- `app/chatgpt-auth.ts` is starter support code and is not used by `app/page.tsx`.
- Condition-specific copy lives in `lib/demo-content/fshd.ts` (active pack via `ACTIVE_CONDITION_ID`).
- `dist/` is generated build output. Do not hand-edit it; rebuild after app changes when preparing a static deployment.
- Do not introduce real health data, individual-level researcher access, study matching, or contact/recruitment flows without first designing consent, governance, privacy, and appropriate review.

## Suggested next work

1. Add a second condition pack under `lib/demo-content/` and a UI switcher.
2. Implement P4 structured participation preferences behind the same review/consent seam.
3. If persistence is needed, flesh out `db/schema.ts` comments into Drizzle tables; add server-side authorization before any write path.
4. Rebuild `dist/` and perform a visual pass before publishing after any UI change.
