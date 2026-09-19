"use client";

import React, { useEffect, useRef } from "react";

type Coordinate = number | `${number}%`;

export interface CelestialResonanceProps {
  /** Number of moving points */
  particleCount?: number;
  /** How fast particles accelerate toward the magnet */
  particleSpeed?: number;
  /** Maximum lifetime (frames) for each particle */
  particleLife?: number;
  /** Trail overlay opacity (0–1) */
  trailOpacity?: number;
  /** Rate at which the hue shifts each frame (ignored when `colors` is set) */
  hueSpeed?: number;
  /** Canvas glow (shadow blur radius) */
  canvasGlow?: number;
  /** X-coordinate of the magnetic attractor: px, or a percentage of the width */
  magnetX?: Coordinate;
  /** Y-coordinate of the magnetic attractor: px, or a percentage of the height */
  magnetY?: Coordinate;
  /** Fixed canvas width (px); fills the parent when omitted */
  width?: number;
  /** Fixed canvas height (px); fills the parent when omitted */
  height?: number;
  /** Particle colors (any CSS color). Replaces the cycling hue with a fixed palette. */
  colors?: string[];
  /** Trail and background color as an "r,g,b" triplet */
  trailColor?: string;
  /** Particle radius (px) */
  particleSize?: number;
  /** How many particles are drawn larger, in `highlightColor`, close to the magnet */
  highlightCount?: number;
  /** Color of the highlighted particles */
  highlightColor?: string;
  /** ARIA label for screen readers */
  ariaLabel?: string;
  /** Extra wrapper classes */
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string | null;
  highlight: boolean;
  /** Radius (px) a highlighted particle holds around the magnet; 0 when it drifts freely */
  orbit: number;
}

function resolve(value: Coordinate | undefined, size: number, fallback: number) {
  if (value === undefined) return fallback;
  return typeof value === "number" ? value : (parseFloat(value) / 100) * size;
}

const CelestialResonance: React.FC<CelestialResonanceProps> = ({
  particleCount = 1000,
  particleSpeed = 0.05,
  particleLife = 400,
  trailOpacity = 0.1,
  hueSpeed = 0.1,
  canvasGlow = 10,
  magnetX,
  magnetY,
  width,
  height,
  colors,
  trailColor = "0,5,20",
  particleSize = 1.2,
  highlightCount = 0,
  highlightColor = "#ffffff",
  ariaLabel = "Celestial resonance particle animation",
  className = "",
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Joined so an inline `colors` array doesn't restart the animation every render.
  const colorKey = colors?.join("|") ?? "";

  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    const canvasEl = canvasRef.current;
    const context = canvasEl?.getContext("2d");
    if (!wrapperEl || !canvasEl || !context) return;
    const wrapper: HTMLDivElement = wrapperEl;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    const palette = colorKey ? colorKey.split("|") : null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles: Particle[] = [];
    const magnet = { x: 0, y: 0 };
    let w = 0;
    let h = 0;
    let hue = 210;
    let animationId = 0;

    function reset(p: Particle) {
      const magnetInView = magnet.x >= 0 && magnet.x <= w && magnet.y >= 0 && magnet.y <= h;
      if (p.highlight && magnetInView) {
        // highlighted points hold a ring around the magnet so they stay findable
        p.orbit = (0.33 + Math.random() * 0.06) * Math.min(w, h);
        const angle = Math.random() * Math.PI * 2;
        p.x = magnet.x + Math.cos(angle) * p.orbit;
        p.y = magnet.y + Math.sin(angle) * p.orbit;
        p.life = Infinity;
      } else {
        p.orbit = 0;
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.life = Math.max(40, Math.random() * particleLife);
      }
      p.vx = 0;
      p.vy = 0;
      p.age = 0;
    }

    function update(p: Particle) {
      p.age++;
      if (p.age > p.life) reset(p);

      // vector toward magnet + 90°
      const dx = magnet.x - p.x;
      const dy = magnet.y - p.y;
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      p.vx += Math.cos(angle) * particleSpeed;
      p.vy += Math.sin(angle) * particleSpeed;
      if (p.orbit) {
        // gentle spring back to the ring, countering the outward spiral
        const distance = Math.hypot(dx, dy) || 1;
        const pull = (distance - p.orbit) * 0.0008;
        p.vx += (dx / distance) * pull;
        p.vy += (dy / distance) * pull;
      }
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.x += p.vx;
      p.y += p.vy;

      // out-of-bounds: reset
      if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) reset(p);
    }

    function draw(p: Particle) {
      const fadeIn = Math.min(1, p.age / 20);
      const fadeOut = p.highlight ? Math.min(1, (p.life - p.age) / 40) : 1 - p.age / p.life;
      const color = p.highlight
        ? highlightColor
        : (p.color ?? `hsl(${hue + (p.x / w) * 50},100%,75%)`);
      ctx.globalAlpha = Math.max(0, fadeIn * fadeOut) * (p.highlight ? 1 : 0.7);
      ctx.shadowColor = palette || p.highlight ? color : `hsla(${hue},100%,50%,0.5)`;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.highlight ? particleSize * 2.4 : particleSize, 0, Math.PI * 2);
      ctx.fill();
    }

    function paint(opacity: number) {
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(${trailColor},${opacity})`;
      ctx.fillRect(0, 0, w, h);
    }

    function init() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = width ?? wrapper.clientWidth;
      h = height ?? wrapper.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      magnet.x = resolve(magnetX, w, w / 2);
      magnet.y = resolve(magnetY, h, h + 400);

      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const p: Particle = {
          x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 0, orbit: 0,
          color: palette ? palette[i % palette.length] : null,
          highlight: i < highlightCount,
        };
        reset(p);
        // stagger the field so it doesn't pulse in unison; highlights fade in from zero
        if (!p.orbit) p.age = Math.floor(Math.random() * p.life * 0.5);
        particles.push(p);
      }
      paint(1);
    }

    function animate() {
      paint(trailOpacity);
      ctx.shadowBlur = canvasGlow;
      // highlights are first in the array; draw them last so they sit on top
      for (let i = particles.length - 1; i >= 0; i--) {
        update(particles[i]);
        draw(particles[i]);
      }
      hue += hueSpeed;
      animationId = requestAnimationFrame(animate);
    }

    function start() {
      cancelAnimationFrame(animationId);
      init();
      if (w === 0 || h === 0) return;
      if (reduceMotion) {
        // settle the field off-screen, then show it as a still constellation
        for (let step = 0; step < 240; step++) particles.forEach(update);
        ctx.shadowBlur = canvasGlow;
        for (let i = particles.length - 1; i >= 0; i--) draw(particles[i]);
        return;
      }
      animate();
    }

    const observer = new ResizeObserver(() => {
      const nextW = width ?? wrapper.clientWidth;
      const nextH = height ?? wrapper.clientHeight;
      if (nextW !== w || nextH !== h) start();
    });
    observer.observe(wrapper);
    start();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [
    particleCount,
    particleSpeed,
    particleLife,
    trailOpacity,
    hueSpeed,
    canvasGlow,
    magnetX,
    magnetY,
    width,
    height,
    colorKey,
    trailColor,
    particleSize,
    highlightCount,
    highlightColor,
  ]);

  return (
    <div
      ref={wrapperRef}
      role="img"
      aria-label={ariaLabel}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "100%",
        backgroundColor: `rgb(${trailColor})`,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default CelestialResonance;
