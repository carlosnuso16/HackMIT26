"use client";

import { Check, Plus, ShieldCheck } from "lucide-react";
import type { DemoContent } from "@/lib/demo-content";

type ResearchRoomProps = {
  content: DemoContent;
  themeCount: number;
  hasLocalResearchTheme: boolean;
  support: boolean;
  onSupport: () => void;
  onBack: () => void;
};

export function ResearchRoom({
  content,
  themeCount,
  hasLocalResearchTheme,
  support,
  onSupport,
  onBack,
}: ResearchRoomProps) {
  const r = content.research;
  return (
    <div className="room">
      <button type="button" className="back" onClick={onBack}>
        ← Community home
      </button>
      <p>PATIENT-LED RESEARCH ROOM</p>
      <h1>Turn conversation into a better question.</h1>
      <span>
        Only reviewable, anonymous themes move here. Individual posts never
        become an eligibility score, a participant profile, or a recruitment
        list.
      </span>
      <section className="feature">
        <div>
          <small>OPEN COMMUNITY THEME</small>
          <h2>{r.openThemeTitle}</h2>
          <p>
            {hasLocalResearchTheme
              ? r.openThemeBodyAfterLocal
              : r.openThemeBodyDefault}
          </p>
        </div>
        <aside>
          <b>{themeCount}</b>
          <span>fictional + local demo support</span>
          <button type="button" disabled={support} onClick={onSupport}>
            <Plus size={14} />
            {support ? "Local support added" : "Add local support"}
          </button>
        </aside>
      </section>
      <div className="research-grid">
        <section>
          <p>PROTECTED SIGNAL</p>
          <h2>What is safe to carry forward</h2>
          <ul>
            {r.protectedSignals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {hasLocalResearchTheme && (
            <div className="new-theme">
              <Check size={14} />
              One anonymous theme added in this session
            </div>
          )}
        </section>
        <section>
          <p>FICTIONAL PROTOCOL IMPLICATION</p>
          <h2>{r.protocolImplicationTitle}</h2>
          <span>{r.protocolImplicationBody}</span>
        </section>
      </div>
      <div className="governance">
        <ShieldCheck size={16} />
        In a real platform: community moderation → patient-advisory review →
        ethics review → separate opt-in outreach.
      </div>
    </div>
  );
}
