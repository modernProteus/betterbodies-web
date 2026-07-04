import React, { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import useScrollTracker, {
  MIN_SPEED,
  MAX_SPEED,
} from "@/hooks/useScrollTracker";

// A repeating strip of several flowing, EKG-style beats (not one lone peak
// drifting across an empty line). Each beat is built from smooth cubic
// curves only, so it reads as a soft wave rather than a jagged spike. Two
// full strips sit side by side and the whole thing drifts left by exactly
// one strip width, so the loop seams invisibly.
const UNIT_WIDTH = 400;
const HEIGHT = 90;
const BASELINE = HEIGHT / 2;
const BEAT_WIDTH = 110;
const BEAT_COUNT = 3;
const PEAK_Y = BASELINE - 33;
const TROUGH_Y = BASELINE + 33;
const BASE_DURATION = 22; // seconds, at resting (idle) scroll speed

// Beats compress closer together as scroll speed rises (a real monitor's
// rhythm visibly quickens, not just plays faster), clamped to a gentle
// range so it reads as "quicker," never glitchy.
const MIN_DENSITY_SCALE = 0.82;
const MAX_DENSITY_SCALE = 1;

function beatSegment(x) {
  return (
    `C${x + 12},${BASELINE} ${x + 16},${BASELINE - 1} ${x + 22},${BASELINE - 5} ` +
    `C${x + 32},${BASELINE - 13} ${x + 36},${PEAK_Y} ${x + 42},${PEAK_Y} ` +
    `C${x + 48},${PEAK_Y} ${x + 50},${BASELINE - 7} ${x + 56},${BASELINE + 5} ` +
    `C${x + 60},${BASELINE + 13} ${x + 64},${TROUGH_Y} ${x + 70},${TROUGH_Y} ` +
    `C${x + 74},${TROUGH_Y} ${x + 76},${BASELINE + 10} ${x + 82},${BASELINE + 5} ` +
    `C${x + 92},${BASELINE - 3} ${x + 100},${BASELINE} ${x + 110},${BASELINE}`
  );
}

function buildEcgPath() {
  const spacing = UNIT_WIDTH / BEAT_COUNT;
  const gap = spacing - BEAT_WIDTH;
  let d = `M0,${BASELINE}`;

  for (let i = 0; i < BEAT_COUNT; i += 1) {
    const beatStart = i * spacing + gap / 2;
    d += ` L${beatStart},${BASELINE} ${beatSegment(beatStart)}`;
  }

  d += ` L${UNIT_WIDTH},${BASELINE}`;
  return d;
}

const UNIT_PATH = buildEcgPath();

/**
 * Faint, glowing, flowing multi-beat EKG line behind the hero text. Both its
 * drift speed and its beat spacing react to scroll velocity, easing up when
 * scrolling is fast and settling back to a calm resting beat when idle
 * (clamped, never frantic). Self-contained: delete this file and its one
 * usage in HeroSection to remove the effect entirely.
 */
export default function HeartbeatLine({ className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  const densityRef = useRef(null);
  const svgRef = useRef(null);

  useScrollTracker(({ speed }) => {
    if (shouldReduceMotion) return;

    if (svgRef.current) {
      svgRef.current.style.animationDuration = `${BASE_DURATION / speed}s`;
    }

    if (densityRef.current) {
      const t = (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
      const scale =
        MAX_DENSITY_SCALE - t * (MAX_DENSITY_SCALE - MIN_DENSITY_SCALE);
      densityRef.current.style.transform = `scaleX(${scale})`;
    }
  });

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-[38%] h-20 overflow-hidden opacity-[0.14] md:h-28 ${className}`}
    >
      <div ref={densityRef} className="heartbeat-density h-full">
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
      </div>

      <style>{`
        .heartbeat-density {
          transform-origin: center;
          transition: transform 400ms ease-out;
        }

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
          .heartbeat-density {
            transition: none;
            transform: none !important;
          }

          .heartbeat-line-drift {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
