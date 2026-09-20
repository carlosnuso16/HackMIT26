import { fshdDemoContent } from "./fshd";
import type { DemoContent } from "./types";

export type { AvatarColor, DemoContent, SeedPost, SignalItem } from "./types";

const packs: Record<string, DemoContent> = {
  fshd: fshdDemoContent,
};

/** Active demo condition. Swap packs here without touching UI modules. */
export const ACTIVE_CONDITION_ID = "fshd";

export function getDemoContent(
  conditionId: string = ACTIVE_CONDITION_ID,
): DemoContent {
  const pack = packs[conditionId];
  if (!pack) {
    throw new Error(`Unknown demo condition: ${conditionId}`);
  }
  return pack;
}
