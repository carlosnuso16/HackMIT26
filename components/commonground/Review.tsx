"use client";

import { Check } from "lucide-react";
import type { PendingPost, ReviewCopy } from "@/lib/review-flow";

type ReviewProps = {
  post: PendingPost;
  copy: ReviewCopy;
  onApprove: () => void;
  onDiscard: () => void;
};

export function Review({ post, copy, onApprove, onDiscard }: ReviewProps) {
  return (
    <section className="review">
      <p>LOCAL SAFETY REVIEW</p>
      <h2>{copy.heading}</h2>
      <blockquote>{post.text}</blockquote>
      <span>{copy.explanation}</span>
      <footer>
        <button type="button" className="plain" onClick={onDiscard}>
          Discard
        </button>
        <button type="button" onClick={onApprove}>
          <Check size={14} />
          {copy.confirmLabel}
        </button>
      </footer>
    </section>
  );
}
