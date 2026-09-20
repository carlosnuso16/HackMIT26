export type AvatarColor = "coral" | "violet" | "gold" | "teal";

export type SeedPost = {
  name: string;
  initial: string;
  color: AvatarColor;
  topic: string;
  text: string;
  hearts: number;
  replies: number;
};

export type SignalItem = {
  label: string;
  count: number;
  color: AvatarColor;
};

export type DemoContent = {
  conditionId: string;
  conditionLabel: string;
  communityHeading: string;
  communityTagline: string;
  communitySubcopy: string;
  fictionalMemberCount: number;
  aliasPool: string[];
  topics: string[];
  researchTopic: string;
  seedPosts: SeedPost[];
  staticSignals: SignalItem[];
  research: {
    openThemeTitle: string;
    openThemeBodyDefault: string;
    openThemeBodyAfterLocal: string;
    protectedSignals: string[];
    protocolImplicationTitle: string;
    protocolImplicationBody: string;
    themeCountBaseline: number;
  };
  communityPromise: string;
};
