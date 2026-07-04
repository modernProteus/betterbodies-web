import React from "react";

// A "seed of life" style ring: one center circle plus six surrounding circles,
// each centered on the middle circle's edge. Purely abstract overlapping-circle
// geometry, universal across many cultures and traditions, no specific emblem.
const R = 80;
const CENTER = 200;
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
 * Very faint, near-static geometric texture behind the hero. Self-contained:
 * delete this file and its one usage in HeroSection to remove the effect.
 */
export default function GeometryTexture({ className = "" }) {
  const petals = petalCenters();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -right-24 top-1/2 h-[140%] w-[140%] -translate-y-1/2 opacity-[0.05] md:-right-10 md:h-[120%] md:w-[65%] ${className}`}
    >
      <svg
        className="geometry-texture-drift h-full w-full text-white"
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
        .geometry-texture-drift {
          animation: geometry-texture-drift 240s linear infinite;
          transform-origin: center;
          will-change: transform;
        }

        @keyframes geometry-texture-drift {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .geometry-texture-drift {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
