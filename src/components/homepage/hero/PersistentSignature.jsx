import React, { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import useScrollTracker from "@/hooks/useScrollTracker";

// Pixel range (in scrollY) over which the signature fades in as the hero
// scrolls out of view. Tuned to roughly match the hero's height; the exact
// number isn't critical since this is a slow, low-opacity fade.
const FADE_START = 480;
const FADE_END = 780;
const MAX_LINE_OPACITY = 0.16;
const MAX_MARK_OPACITY = 0.07;

const R = 20;
const CENTER = 50;
const ANGLES = [0, 60, 120, 180, 240, 300];

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
 * Once the hero's own heartbeat + geometry scroll out of view, this fixed,
 * whisper-quiet pair (a thin ambient pulse line, a corner geometry
 * watermark) takes over as a persistent signature for the rest of the page.
 * Same motif, demoted, not deleted. Self-contained: delete this file and its
 * one usage in Home to remove the effect entirely.
 */
export default function PersistentSignature() {
  const shouldReduceMotion = useReducedMotion();
  const lineRef = useRef(null);
  const markRef = useRef(null);
  const petals = petalCenters();

  useScrollTracker(() => {
    if (shouldReduceMotion) return;

    const y = window.scrollY;
    const t = Math.min(
      1,
      Math.max(0, (y - FADE_START) / (FADE_END - FADE_START))
    );

    if (lineRef.current) {
      lineRef.current.style.opacity = String(t * MAX_LINE_OPACITY);
    }
    if (markRef.current) {
      markRef.current.style.opacity = String(t * MAX_MARK_OPACITY);
    }
  });

  const restingLineOpacity = shouldReduceMotion ? MAX_LINE_OPACITY * 0.6 : 0;
  const restingMarkOpacity = shouldReduceMotion ? MAX_MARK_OPACITY * 0.6 : 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5]"
    >
      <div
        ref={lineRef}
        className="signature-line-drift absolute inset-x-0 top-16 h-px overflow-hidden text-primary transition-opacity duration-500"
        style={{ opacity: restingLineOpacity }}
      >
        <svg
          className="h-full"
          style={{ width: "200%" }}
          viewBox="0 0 800 4"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="2" x2="400" y2="2" stroke="currentColor" strokeWidth="1" />
          <line x1="400" y1="2" x2="800" y2="2" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div
        ref={markRef}
        className="absolute bottom-6 right-6 h-20 w-20 text-slate-500 transition-opacity duration-500"
        style={{ opacity: restingMarkOpacity }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
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
      </div>

      <style>{`
        .signature-line-drift {
          animation: signature-line-drift 22s linear infinite;
        }

        @keyframes signature-line-drift {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .signature-line-drift {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
