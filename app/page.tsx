"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Home,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Composer } from "@/components/commonground/Composer";
import { Post, type FeedPost } from "@/components/commonground/Post";
import { Profile } from "@/components/commonground/Profile";
import { ResearchRoom } from "@/components/commonground/ResearchRoom";
import { Review } from "@/components/commonground/Review";
import { SignalPanel } from "@/components/commonground/SignalPanel";
import { buildAggregateSignal } from "@/lib/aggregate-signal";
import {
  createLocalStorageAliasStore,
  nextAlias,
  resolveInitialAlias,
} from "@/lib/alias-store";
import { getDemoContent } from "@/lib/demo-content";
import {
  getReviewCopy,
  isResearchTopic,
  nextTabAfterApprove,
  stripThemeForResearch,
  toLocalFeedPost,
  type LocalFeedPost,
  type PendingPost,
  type ResearchTheme,
} from "@/lib/review-flow";

type Tab = "home" | "research" | "profile";

const content = getDemoContent();

function getAliasStore() {
  return createLocalStorageAliasStore();
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("home");
  // SSR and first client paint share the default; hydrate from storage after mount.
  const [alias, setAlias] = useState(content.aliasPool[0]!);
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState(content.researchTopic);
  const [pending, setPending] = useState<PendingPost | null>(null);
  const [researchThemes, setResearchThemes] = useState<ResearchTheme[]>([]);
  const [localPosts, setLocalPosts] = useState<LocalFeedPost[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [support, setSupport] = useState(false);

  useEffect(() => {
    // External system: browser alias store (cg-safe-alias).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after SSR
    setAlias(resolveInitialAlias(getAliasStore(), content.aliasPool));
  }, []);

  const aggregate = useMemo(
    () =>
      buildAggregateSignal({
        content,
        researchThemes,
        localSupport: support,
      }),
    [researchThemes, support],
  );

  const regenerate = () => {
    const next = nextAlias(alias, content.aliasPool);
    setAlias(next);
    getAliasStore().write(next);
  };

  const submit = () => {
    if (!draft.trim()) return;
    setPending({ text: draft.trim(), topic });
    setDraft("");
  };

  const approve = () => {
    if (!pending) return;
    if (isResearchTopic(pending.topic, content.researchTopic)) {
      const theme = stripThemeForResearch(pending, content.researchTopic);
      if (theme) setResearchThemes((prev) => [theme, ...prev]);
    } else {
      setLocalPosts((prev) => [toLocalFeedPost(pending, alias), ...prev]);
    }
    const nextTab = nextTabAfterApprove(pending.topic, content.researchTopic);
    setPending(null);
    setTab(nextTab);
  };

  const erase = () => {
    getAliasStore().clear();
    setAlias(content.aliasPool[0]!);
    setResearchThemes([]);
    setLocalPosts([]);
    setPending(null);
    setDraft("");
    setSupport(false);
    setLiked([]);
    setTopic(content.researchTopic);
    setTab("home");
  };

  const toggleLike = (key: string) => {
    setLiked((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  };

  const feed: Array<FeedPost & { key: string }> = [
    ...localPosts.map((p) => ({ ...p, key: p.id })),
    ...content.seedPosts.map((p, i) => ({ ...p, key: `seed-${i}` })),
  ];

  const reviewCopy = pending
    ? getReviewCopy(pending, content.researchTopic)
    : null;

  return (
    <main className="app">
      <header>
        <button type="button" className="brand" onClick={() => setTab("home")}>
          <span>C</span>CommonGround
        </button>
        <nav>
          <button
            type="button"
            className={tab === "home" ? "active" : ""}
            onClick={() => setTab("home")}
          >
            <Home size={16} />
            Community
          </button>
          <button
            type="button"
            className={tab === "research" ? "active" : ""}
            onClick={() => setTab("research")}
          >
            <Sparkles size={16} />
            Research room
          </button>
        </nav>
        <button
          type="button"
          className="avatar teal"
          onClick={() => setTab("profile")}
          aria-label="Open anonymous profile"
        >
          {alias[0]}
        </button>
      </header>

      <div className="privacy">
        <ShieldCheck size={15} />
        <span>
          Prototype safety boundary: posts live only in this browser session.
          Your generated pseudonym is the only thing saved locally. No health
          record, contact detail, or trial eligibility data is collected.
        </span>
      </div>

      <div className="layout">
        <aside>
          <button
            type="button"
            className={tab === "home" ? "side active" : "side"}
            onClick={() => setTab("home")}
          >
            <Home size={17} />
            Community home
          </button>
          <button
            type="button"
            className={tab === "research" ? "side active" : "side"}
            onClick={() => setTab("research")}
          >
            <Sparkles size={17} />
            Research room
          </button>
          <button
            type="button"
            className={tab === "profile" ? "side active" : "side"}
            onClick={() => setTab("profile")}
          >
            <Users size={17} />
            My anonymous space
          </button>
          <hr />
          <p>TOPICS</p>
          {content.topics.map((t) => (
            <button
              type="button"
              className="topic"
              key={t}
              onClick={() => {
                setTopic(t);
                setTab("home");
              }}
            >
              {t}
            </button>
          ))}
          <div className="boundary">
            <LockKeyhole size={17} />
            <b>Present, not exposed.</b>
            <span>
              This is discussion—not diagnosis, recruitment, or medical advice.
            </span>
          </div>
        </aside>

        <section className="content">
          {tab === "home" && (
            <>
              <div className="intro">
                <p>{content.communityHeading}</p>
                <h1>{content.communityTagline}</h1>
                <span>{content.communitySubcopy}</span>
                <div className="members">
                  <i className="avatar coral">R</i>
                  <i className="avatar violet">N</i>
                  <i className="avatar gold">M</i>
                  <b>
                    {content.fictionalMemberCount} fictional demo members are in
                    the conversation
                  </b>
                </div>
              </div>

              <Composer
                alias={alias}
                topic={topic}
                topics={content.topics}
                draft={draft}
                onTopicChange={setTopic}
                onDraftChange={setDraft}
                onSubmit={submit}
              />

              {pending && reviewCopy && (
                <Review
                  post={pending}
                  copy={reviewCopy}
                  onApprove={approve}
                  onDiscard={() => setPending(null)}
                />
              )}

              <div className="feed-title">
                <b>Conversations</b>
                <span>fictional examples + this-session posts</span>
              </div>
              {feed.map((p) => (
                <Post
                  key={p.key}
                  name={p.name}
                  initial={p.initial}
                  color={p.color}
                  topic={p.topic}
                  text={p.text}
                  hearts={p.hearts}
                  replies={p.replies}
                  local={p.local}
                  liked={liked.includes(p.key)}
                  onLike={() => toggleLike(p.key)}
                />
              ))}
            </>
          )}

          {tab === "research" && (
            <ResearchRoom
              content={content}
              themeCount={aggregate.themeCount}
              hasLocalResearchTheme={aggregate.hasLocalResearchTheme}
              support={support}
              onSupport={() => setSupport(true)}
              onBack={() => setTab("home")}
            />
          )}

          {tab === "profile" && (
            <Profile
              alias={alias}
              onRegenerate={regenerate}
              onErase={erase}
            />
          )}
        </section>

        <SignalPanel
          signals={aggregate.sidebarSignals}
          communityPromise={content.communityPromise}
        />
      </div>
    </main>
  );
}
