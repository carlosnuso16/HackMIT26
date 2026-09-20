"use client";

import { Heart, MessageCircle } from "lucide-react";
import type { AvatarColor } from "@/lib/demo-content";

export type FeedPost = {
  name: string;
  initial: string;
  color: AvatarColor;
  topic: string;
  text: string;
  hearts: number;
  replies: number;
  local?: boolean;
};

type PostProps = FeedPost & {
  liked: boolean;
  onLike: () => void;
};

export function Post({
  name,
  initial,
  color,
  topic,
  text,
  hearts,
  replies,
  local,
  liked,
  onLike,
}: PostProps) {
  return (
    <article className="post">
      <span className={`avatar ${color}`}>{initial}</span>
      <div>
        <header>
          <b>{name}</b>
          <small>
            {local ? "you · this session" : "fictional member"} · {topic}
          </small>
        </header>
        <p>{text}</p>
        <footer>
          <button
            type="button"
            className={liked ? "liked" : ""}
            onClick={onLike}
            aria-pressed={liked}
          >
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
            {hearts + (liked ? 1 : 0)}
          </button>
          <span>
            <MessageCircle size={15} />
            {replies} {local ? "replies" : "fictional replies"}
          </span>
        </footer>
      </div>
    </article>
  );
}
