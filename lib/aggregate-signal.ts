import type { DemoContent, SignalItem } from "./demo-content";
import {
  computeThemeCount,
  countResearchThemes,
  hasResearchTheme,
} from "./review-flow";

export type AggregateSignalView = {
  sidebarSignals: SignalItem[];
  themeCount: number;
  hasLocalResearchTheme: boolean;
  localSupportAdded: boolean;
};

/**
 * Protected community signal (P6 / R1).
 * Combines fictional baselines with session-local research themes and support.
 * Never includes individual post text or aliases.
 */
export function buildAggregateSignal(input: {
  content: DemoContent;
  researchThemes: ReadonlyArray<{ topic: string }>;
  localSupport: boolean;
}): AggregateSignalView {
  const { content, researchThemes, localSupport } = input;
  const researchCount = countResearchThemes(
    researchThemes,
    content.researchTopic,
  );

  const sidebarSignals = content.staticSignals.map((signal, index) => {
    // First signal absorbs anonymous research-theme counts for demo transparency.
    if (index === 0 && researchCount > 0) {
      return { ...signal, count: signal.count + researchCount };
    }
    if (index === 1 && localSupport) {
      return { ...signal, count: signal.count + 1 };
    }
    return signal;
  });

  return {
    sidebarSignals,
    themeCount: computeThemeCount(
      content.research.themeCountBaseline,
      researchCount,
      localSupport,
    ),
    hasLocalResearchTheme: hasResearchTheme(
      researchThemes,
      content.researchTopic,
    ),
    localSupportAdded: localSupport,
  };
}
