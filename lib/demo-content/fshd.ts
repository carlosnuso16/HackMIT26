import type { DemoContent } from "./types";

/** Synthetic FSHD demo pack — fictional members and counts only. */
export const fshdDemoContent: DemoContent = {
  conditionId: "fshd",
  conditionLabel: "FSHD",
  communityHeading: "FSHD COMMUNITY",
  communityTagline: "Make research answer to real life.",
  communitySubcopy:
    "Read quietly. Talk when ready. Bring lived experience into the questions research asks.",
  fictionalMemberCount: 126,
  aliasPool: [
    "CedarHarbor",
    "JuniperSky",
    "QuietComet",
    "WillowCurrent",
    "AmberOrbit",
  ],
  topics: [
    "Living with FSHD",
    "Research room",
    "Everyday adaptations",
    "Care partners",
  ],
  researchTopic: "Research room",
  seedPosts: [
    {
      name: "River",
      initial: "R",
      color: "coral",
      topic: "Living with FSHD",
      text: "What would make an in-person study visit feel worth the energy it takes to get there? Knowing the schedule early would change everything.",
      hearts: 24,
      replies: 9,
    },
    {
      name: "NorthStar",
      initial: "N",
      color: "violet",
      topic: "Research room",
      text: "I want studies to measure fatigue in ways that reflect real life—not just a good day in clinic.",
      hearts: 38,
      replies: 16,
    },
    {
      name: "MossLine",
      initial: "M",
      color: "gold",
      topic: "Everyday adaptations",
      text: "Remote options matter. A virtual follow-up made the week feel possible.",
      hearts: 51,
      replies: 12,
    },
  ],
  staticSignals: [
    { label: "Fatigue as lived, not abstract", count: 88, color: "coral" },
    { label: "Remote-first study design", count: 76, color: "teal" },
    { label: "Arm & shoulder function", count: 64, color: "violet" },
  ],
  research: {
    openThemeTitle:
      "How should an FSHD study account for an unpredictable fatigue day?",
    openThemeBodyDefault:
      "Patients are discussing flexible scheduling, remote options, and outcomes that reflect everyday function.",
    openThemeBodyAfterLocal:
      "A local community member added an anonymous Research room theme. The protected signal below changed—not their words.",
    protectedSignals: [
      "Flexible visit windows",
      "Remote check-in options",
      "Patient-defined fatigue outcomes",
    ],
    protocolImplicationTitle: "Design for variable energy.",
    protocolImplicationBody:
      "Use a remote-first visit model and a flexible reschedule window. This is a design prompt, not a feasibility prediction or treatment recommendation.",
    themeCountBaseline: 42,
  },
  communityPromise:
    "In a real version, trained moderators and patient advisors would review themes before they inform a study concept.",
};
