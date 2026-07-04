import React from "react";

// One repeat unit of an ECG waveform. Two units are placed side by side and
// the whole strip drifts left by exactly one unit width, so the loop seams
// invisibly. Pure CSS animation, no per-frame JS.
const UNIT_WIDTH = 400;
const HEIGHT = 90;
const UNIT_PATH =
  "M0,45 L130,45 L150,45 L162,15 L176,75 L188,32 L200,45 L400,45";

/**
 * Faint drifting ECG line behind the hero text. Self-contained: delete this
 * file and remove its one usage in HeroSection to remove the effect entirely.
 */
export default function HeartbeatLine({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-[38%] h-20 overflow-hidden opacity-[0.1] md:h-28 ${className}`}
    >
      <svg
        className="heartbeat-line-drift h-full text-primary"
        style={{ width: "200%" }}
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
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <use
          href="#heartbeat-unit"
          x={UNIT_WIDTH}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style>{`
        .heartbeat-line-drift {
          animation: heartbeat-line-drift 22s linear infinite;
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
