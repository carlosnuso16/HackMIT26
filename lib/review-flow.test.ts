import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeThemeCount,
  countResearchThemes,
  getReviewCopy,
  hasResearchTheme,
  isResearchTopic,
  nextTabAfterApprove,
  stripThemeForResearch,
  toLocalFeedPost,
} from "../lib/review-flow";

const RESEARCH = "Research room";

describe("review-flow", () => {
  it("classifies research topics", () => {
    assert.equal(isResearchTopic("Research room", RESEARCH), true);
    assert.equal(isResearchTopic("Living with FSHD", RESEARCH), false);
  });

  it("returns research review copy without promising to share words", () => {
    const copy = getReviewCopy(
      { text: "secret lived detail", topic: RESEARCH },
      RESEARCH,
    );
    assert.match(copy.explanation, /words will not/i);
    assert.equal(copy.confirmLabel, "Add anonymous theme");
  });

  it("strips text at the research seam", () => {
    const theme = stripThemeForResearch(
      { text: "must never cross", topic: RESEARCH },
      RESEARCH,
      () => "2026-01-01T00:00:00.000Z",
    );
    assert.deepEqual(theme, {
      topic: RESEARCH,
      addedAt: "2026-01-01T00:00:00.000Z",
    });
    assert.equal(
      stripThemeForResearch(
        { text: "local only", topic: "Care partners" },
        RESEARCH,
      ),
      null,
    );
  });

  it("routes approve to the matching tab", () => {
    assert.equal(nextTabAfterApprove(RESEARCH, RESEARCH), "research");
    assert.equal(nextTabAfterApprove("Care partners", RESEARCH), "home");
  });

  it("computes theme counts with optional local support", () => {
    assert.equal(computeThemeCount(42, 2, false), 44);
    assert.equal(computeThemeCount(42, 2, true), 45);
  });

  it("counts and detects research themes", () => {
    const themes = [{ topic: RESEARCH }, { topic: "Care partners" }];
    assert.equal(countResearchThemes(themes, RESEARCH), 1);
    assert.equal(hasResearchTheme(themes, RESEARCH), true);
  });

  it("maps local posts without inventing health fields", () => {
    const post = toLocalFeedPost(
      { text: "hello", topic: "Care partners" },
      "CedarHarbor",
      "id-1",
    );
    assert.equal(post.local, true);
    assert.equal(post.name, "CedarHarbor");
    assert.equal(post.initial, "C");
    assert.equal(post.id, "id-1");
  });
});
