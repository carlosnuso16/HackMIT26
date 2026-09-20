"use client";

import { ChevronRight, ShieldCheck } from "lucide-react";

type ComposerProps = {
  alias: string;
  topic: string;
  topics: readonly string[];
  draft: string;
  onTopicChange: (topic: string) => void;
  onDraftChange: (draft: string) => void;
  onSubmit: () => void;
};

export function Composer({
  alias,
  topic,
  topics,
  draft,
  onTopicChange,
  onDraftChange,
  onSubmit,
}: ComposerProps) {
  return (
    <section className="composer">
      <span className="avatar teal">{alias[0]}</span>
      <div>
        <textarea
          aria-label="Write a community post"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="What would you like people—and research teams—to understand?"
        />
        <p>
          <ShieldCheck size={13} />
          Don’t share names, contact details, medical advice, or anything you
          would not want repeated.
        </p>
        <footer>
          <select
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            aria-label="Post topic"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button type="button" onClick={onSubmit} disabled={!draft.trim()}>
            Review before sharing <ChevronRight size={14} />
          </button>
        </footer>
      </div>
    </section>
  );
}
