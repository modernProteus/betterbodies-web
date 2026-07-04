import React, { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import useScrollTracker from "@/hooks/useScrollTracker";
import { cn } from "@/lib/utils";

/**
 * A dedicated, thin scroll-progress line pinned to the top of the viewport.
 * Fills left to right as the user reads down the page. A separate element
 * from the hero's heartbeat by design, so each stays simple to reason about.
 * Self-contained: delete this file and its one usage in Home to remove it.
 */
export default function ScrollProgressLine() {
  const shouldReduceMotion = useReducedMotion();
  const fillRef = useRef(null);

  useScrollTracker(({ progress }) => {
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${progress})`;
    }
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-slate-950/5"
    >
      <div
        ref={fillRef}
        className={cn(
          "h-full origin-left bg-primary",
          !shouldReduceMotion && "scroll-progress-glow"
        )}
        style={{ transform: "scaleX(0)" }}
      />

      <style>{`
        .scroll-progress-glow {
          transition: transform 100ms linear;
          animation: scroll-progress-pulse 2.4s ease-in-out infinite;
        }

        @keyframes scroll-progress-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.35); }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-progress-glow {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
