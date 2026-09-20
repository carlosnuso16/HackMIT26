/**
 * Privacy-preserving local review flow (P5).
 * Pure module — the interface is the test surface.
 */

export type PendingPost = {
  text: string;
  topic: string;
};

/** Anonymous theme carried into the Research room — never includes post text. */
export type ResearchTheme = {
  topic: string;
  addedAt: string;
};

export type ReviewCopy = {
  heading: string;
  explanation: string;
  confirmLabel: string;
};

export function isResearchTopic(
  topic: string,
  researchTopic: string,
): boolean {
  return topic === researchTopic;
}

export function getReviewCopy(
  post: PendingPost,
  researchTopic: string,
): ReviewCopy {
  if (isResearchTopic(post.topic, researchTopic)) {
    return {
      heading: "Turn this into an anonymous theme?",
      explanation:
        "Only the topic and a one-count anonymous signal will move to the Research room. Your words will not.",
      confirmLabel: "Add anonymous theme",
    };
  }
  return {
    heading: "Share this local discussion post?",
    explanation:
      "This post will appear only in this browser session and is not sent anywhere.",
    confirmLabel: "Share locally",
  };
}

/** Strip full text before anything crosses the research seam. */
export function stripThemeForResearch(
  pending: PendingPost,
  researchTopic: string,
  now: () => string = () => new Date().toISOString(),
): ResearchTheme | null {
  if (!isResearchTopic(pending.topic, researchTopic)) return null;
  return { topic: pending.topic, addedAt: now() };
}

export function nextTabAfterApprove(
  topic: string,
  researchTopic: string,
): "home" | "research" {
  return isResearchTopic(topic, researchTopic) ? "research" : "home";
}

export function computeThemeCount(
  baseline: number,
  researchThemeCount: number,
  localSupport: boolean,
): number {
  return baseline + researchThemeCount + (localSupport ? 1 : 0);
}

export function countResearchThemes(
  themes: ReadonlyArray<{ topic: string }>,
  researchTopic: string,
): number {
  return themes.filter((t) => isResearchTopic(t.topic, researchTopic)).length;
}

export function hasResearchTheme(
  themes: ReadonlyArray<{ topic: string }>,
  researchTopic: string,
): boolean {
  return countResearchThemes(themes, researchTopic) > 0;
}

export type LocalFeedPost = {
  id: string;
  name: string;
  initial: string;
  color: "teal";
  topic: string;
  text: string;
  hearts: number;
  replies: number;
  local: true;
};

export function toLocalFeedPost(
  pending: PendingPost,
  alias: string,
  id: string = crypto.randomUUID(),
): LocalFeedPost {
  return {
    id,
    name: alias,
    initial: alias[0]?.toUpperCase() ?? "?",
    color: "teal",
    topic: pending.topic,
    text: pending.text,
    hearts: 0,
    replies: 0,
    local: true,
  };
}
