"use client";

import CelestialResonance from "@/components/ui/celestial-resonance";

// CommonGround palette on the deep-teal "signal" surface (#193d42).
const SKY = "25,61,66";
const MEMBER_COLORS = ["#8bc1b5", "#aad2c2", "#8bc1b5", "#eaf4ed", "#5fa89c"];
const YOU = "#d86a55";

/** One point of light per fictional member, orbiting the cohort size. The coral point is the new member. */
export default function CohortConstellation({ members }: { members: number }) {
  return (
    <div className="relative mx-auto mb-[34px] h-[250px] overflow-hidden rounded-[28px] text-left shadow-[13px_13px_#d9e7dc] sm:h-[310px]">
      <CelestialResonance
        className="absolute inset-0"
        particleCount={members}
        highlightCount={1}
        highlightColor={YOU}
        colors={MEMBER_COLORS}
        trailColor={SKY}
        magnetX="50%"
        magnetY="50%"
        particleSpeed={0.012}
        particleLife={620}
        particleSize={1.5}
        trailOpacity={0.12}
        canvasGlow={8}
        ariaLabel={`${members} points of light moving in a shared orbit, one for each fictional member of the Aster community. The coral point is you.`}
      />
      {/* flex, not grid: globals.css has its own .grid rule that overrides the Tailwind utility */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-[128px] w-[128px] items-center justify-center rounded-full border border-[#aad2c2]/50 bg-[#193d42]/80">
          <b className="text-[50px] leading-none tracking-[-0.04em] text-[#f0f8ee]">{members}</b>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pb-4 font-[Arial] text-[11px] tracking-[0.08em] text-[#b8d1ce]">
        <span>ONE POINT PER FICTIONAL MEMBER</span>
        <span className="flex items-center gap-[6px]">
          <span className="h-[8px] w-[8px] rounded-full bg-[#d86a55]" />
          YOU
        </span>
      </div>
    </div>
  );
}
