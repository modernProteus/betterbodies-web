import React, { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import useScrollTracker from "@/hooks/useScrollTracker";

// One flowing repeat unit of an ECG-style pulse, built from smooth cubic
// curves (no straight/angular segments) so the beat reads as a soft wave
// rather than a jagged line. Two units sit side by side and the whole strip
// drifts left by exactly one unit width, so the loop seams invisibly.
const UNIT_WIDTH = 400;
const HEIGHT = 90;
const BASE_DURATION = 22; // seconds, at resting (idle) scroll speed
const UNIT_PATH =
  "M0,45 C50,45 90,45 110,45 C122,45 126,44 132,40 C142,32 146,12 152,12 " +
  "C158,12 160,38 166,50 C170,58 174,78 180,78 C184,78 186,55 192,50 " +
  "C202,42 220,45 400,45";

/**
 * Faint, glowing, flowing ECG line behind the hero text. Its drift speed
 * eases up with scroll velocity and settles back to a calm resting beat when
 * idle (clamped, never frantic). Self-contained: delete this file and its
 * one usage in HeroSection to remove the effect entirely.
 */
export default function HeartbeatLine({ className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef(null);

  useScrollTracker(({ speed }) => {
    if (shouldReduceMotion || !svgRef.current) return;
    svgRef.current.style.animationDuration = `${BASE_DURATION / speed}s`;
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-[38%] h-20 overflow-hidden opacity-[0.14] md:h-28 ${className}`}
    >
      <svg
        ref={svgRef}
        className="heartbeat-line-drift h-full text-primary"
        style={{
          width: "200%",
          animationDuration: `${BASE_DURATION}s`,
          filter: "drop-shadow(0 0 4px currentColor)",
        }}
        viewBox={`0 0 ${UNIT_WIDTH * 2} ${HEIGHT}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path id="heartbeat-unit" d={UNIT_PATH} />
        </defs>
        <use
          href="#heartbeat-unit"
          x="0"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <use
          href="#heartbeat-unit"
          x={UNIT_WIDTH}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style>{`
        .heartbeat-line-drift {
          animation-name: heartbeat-line-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        @keyframes heartbeat-line-drift {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .heartbeat-line-drift {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
