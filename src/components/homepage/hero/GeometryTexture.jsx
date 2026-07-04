import React, { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import useScrollTracker from "@/hooks/useScrollTracker";

// A "seed of life" style ring: one center circle plus six surrounding circles,
// each centered on the middle circle's edge. Purely abstract overlapping-circle
// geometry, universal across many cultures and traditions, no specific emblem.
const R = 80;
const CENTER = 200;
const ANGLES = [0, 60, 120, 180, 240, 300];
const MAX_ROTATION = 360; // degrees across a full page scroll

function petalCenters() {
  return ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: CENTER + R * Math.cos(rad),
      y: CENTER + R * Math.sin(rad),
    };
  });
}

/**
 * Very faint geometric texture behind the hero. Its rotation tracks scroll
 * position directly (a full turn only over a long scroll), eased smoothly in
 * both directions via a CSS transition rather than a time-based loop.
 * Self-contained: delete this file and its one usage in HeroSection to
 * remove the effect.
 */
export default function GeometryTexture({ className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef(null);
  const petals = petalCenters();

  useScrollTracker(({ progress }) => {
    if (shouldReduceMotion || !svgRef.current) return;
    svgRef.current.style.transform = `rotate(${progress * MAX_ROTATION}deg)`;
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -right-24 top-1/2 h-[140%] w-[140%] -translate-y-1/2 opacity-[0.05] md:-right-10 md:h-[120%] md:w-[65%] ${className}`}
    >
      <svg
        ref={svgRef}
        className="geometry-texture-rotate h-full w-full text-white"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={R}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        {petals.map((point) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={R}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>

      <style>{`
        .geometry-texture-rotate {
          transform-origin: center;
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .geometry-texture-rotate {
            transition: none;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
