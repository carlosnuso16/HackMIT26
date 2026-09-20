"use client";

import type { SignalItem } from "@/lib/demo-content";

type SignalPanelProps = {
  signals: readonly SignalItem[];
  communityPromise: string;
};

export function SignalPanel({ signals, communityPromise }: SignalPanelProps) {
  return (
    <aside className="right">
      <div className="signal">
        <p>PATIENT-LED SIGNAL</p>
        <h2>What the community is moving forward</h2>
        {signals.map((s) => (
          <span key={s.label}>
            <i className={`dot ${s.color}`} />
            {s.label} <b>{s.count}</b>
          </span>
        ))}
        <small>Fictional prototype counts · local themes nudge the first signal</small>
      </div>
      <div className="promise">
        <p>COMMUNITY PROMISE</p>
        <b>People are more than data points.</b>
        <span>{communityPromise}</span>
      </div>
    </aside>
  );
}
