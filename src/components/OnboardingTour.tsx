"use client";

import {
  clearTourCompleted,
  readTourCompleted,
  readTourStepIndex,
  TOUR_STEPS,
  writeTourCompleted,
  writeTourStepIndex,
  type TourStep,
} from "@/lib/onboarding";
import { useWorkspace } from "@/lib/workspace";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react";

type Rect = { top: number; left: number; width: number; height: number };

function measure(selector: string | undefined): Rect | null {
  if (!selector || typeof document === "undefined") return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
  };
}

function tooltipStyle(
  step: TourStep,
  rect: Rect | null,
): CSSProperties {
  const gap = 12;
  const width = Math.min(320, typeof window !== "undefined" ? window.innerWidth - 24 : 320);

  if (!rect) {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width,
      zIndex: 90,
    };
  }

  const placement = step.placement ?? "bottom";
  const style: CSSProperties = {
    position: "fixed",
    width,
    zIndex: 90,
  };

  if (placement === "bottom") {
    style.top = rect.top + rect.height + gap;
    style.left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - width / 2),
      (typeof window !== "undefined" ? window.innerWidth : 800) - width - 12,
    );
  } else if (placement === "top") {
    style.top = Math.max(12, rect.top - gap);
    style.transform = "translateY(-100%)";
    style.left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - width / 2),
      (typeof window !== "undefined" ? window.innerWidth : 800) - width - 12,
    );
  } else if (placement === "right") {
    style.top = Math.max(12, rect.top);
    style.left = Math.min(
      rect.left + rect.width + gap,
      (typeof window !== "undefined" ? window.innerWidth : 800) - width - 12,
    );
  } else {
    style.top = Math.max(12, rect.top);
    style.left = Math.max(12, rect.left - width - gap);
  }

  return style;
}

export function OnboardingTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = TOUR_STEPS[index];

  const refreshRect = useCallback(() => {
    if (!step) return;
    setRect(measure(step.target));
  }, [step]);

  useEffect(() => {
    if (pathname === "/demo") {
      setActive(false);
      return;
    }
    const done = readTourCompleted();
    if (done) {
      setActive(false);
      return;
    }
    setIndex(readTourStepIndex());
    setActive(true);
  }, [pathname]);

  useEffect(() => {
    const onStart = () => {
      clearTourCompleted();
      writeTourStepIndex(0);
      setIndex(0);
      setActive(true);
      if (pathname !== "/") router.push("/");
    };
    window.addEventListener("cyto:start-tour", onStart);
    return () => window.removeEventListener("cyto:start-tour", onStart);
  }, [pathname, router]);

  useLayoutEffect(() => {
    if (!active || !step) return;
    if (pathname === "/demo") return;

    if (step.path !== pathname) {
      router.push(step.path);
      return;
    }

    if (step.id === "run" || step.id === "panel") {
      useWorkspace.getState().setMode("intake");
    }

    const t = window.setTimeout(refreshRect, 80);
    window.addEventListener("resize", refreshRect);
    window.addEventListener("scroll", refreshRect, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", refreshRect);
      window.removeEventListener("scroll", refreshRect, true);
    };
  }, [active, step, pathname, router, refreshRect]);

  // Remeasure after route transition paints
  useEffect(() => {
    if (!active || !step || step.path !== pathname) return;
    const id = window.requestAnimationFrame(() => refreshRect());
    return () => window.cancelAnimationFrame(id);
  }, [active, step, pathname, refreshRect]);

  if (!active || !step) return null;

  const isLast = index >= TOUR_STEPS.length - 1;

  function finish() {
    writeTourCompleted();
    setActive(false);
  }

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    const next = index + 1;
    writeTourStepIndex(next);
    setIndex(next);
  }

  function goBack() {
    if (index <= 0) return;
    const prev = index - 1;
    writeTourStepIndex(prev);
    setIndex(prev);
  }

  const highlightPad = 6;

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="Getting started">
      {rect ? (
        <div
          className="tour-spotlight"
          style={{
            top: rect.top - highlightPad,
            left: rect.left - highlightPad,
            width: rect.width + highlightPad * 2,
            height: rect.height + highlightPad * 2,
          }}
        />
      ) : (
        <div className="tour-backdrop" />
      )}

      <div className="tour-card" style={tooltipStyle(step, rect)}>
        <p className="meta mb-2">
          Tip {index + 1} of {TOUR_STEPS.length}
        </p>
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">{step.title}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-secondary)]">
          {step.body}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" className="btn btn-secondary" onClick={finish}>
            Skip
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" className="btn btn-secondary" onClick={goBack}>
                Back
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RestartTourButton() {
  return (
    <button
      type="button"
      className="meta hover:text-[var(--ink)]"
      onClick={() => window.dispatchEvent(new Event("cyto:start-tour"))}
    >
      Show tips
    </button>
  );
}
