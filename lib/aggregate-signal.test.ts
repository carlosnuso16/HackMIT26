import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAggregateSignal } from "../lib/aggregate-signal";
import { getDemoContent } from "../lib/demo-content";

describe("aggregate-signal", () => {
  const content = getDemoContent("fshd");

  it("starts from fictional baselines", () => {
    const view = buildAggregateSignal({
      content,
      researchThemes: [],
      localSupport: false,
    });
    assert.equal(view.themeCount, content.research.themeCountBaseline);
    assert.equal(view.hasLocalResearchTheme, false);
    assert.equal(view.sidebarSignals[0]?.count, content.staticSignals[0]?.count);
  });

  it("nudges protected signals without exposing post text", () => {
    const view = buildAggregateSignal({
      content,
      researchThemes: [{ topic: content.researchTopic }],
      localSupport: true,
    });
    assert.equal(view.hasLocalResearchTheme, true);
    assert.equal(
      view.themeCount,
      content.research.themeCountBaseline + 1 + 1,
    );
    assert.equal(
      view.sidebarSignals[0]?.count,
      (content.staticSignals[0]?.count ?? 0) + 1,
    );
    assert.equal(
      view.sidebarSignals[1]?.count,
      (content.staticSignals[1]?.count ?? 0) + 1,
    );
    assert.ok(!JSON.stringify(view).includes("must never"));
  });
});
