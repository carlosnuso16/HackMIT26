/**
 * Persistence is intentionally unwired from the demo UI.
 *
 * Minimum future schema (pseudonymous + consent-aware) — do not add write paths
 * until server-side authorization and governance are designed (see HANDOFF.md):
 *
 * - safe_aliases: id, alias, created_at  (no PHI)
 * - consent_events: id, subject_token, purpose, version, affirmed_at
 * - research_themes: id, condition_id, topic, added_at  (no post body)
 * - aggregate_snapshots: id, condition_id, payload_json, computed_at
 *
 * Individual posts and contact channels stay out of the first schema on purpose.
 */
export {};
