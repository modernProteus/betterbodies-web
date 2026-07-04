import React from "react";
import { Heart } from "lucide-react";

/**
 * A tiny heart mark tucked into the hero corner, blended into the background
 * until hovered. Purely decorative, mouse-only, and not part of the tab
 * order so it never interferes with real navigation or forms. Self-contained:
 * delete this file and its one usage in HeroSection to remove the effect.
 */
export default function EasterEgg({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`easter-egg-heart pointer-events-auto absolute bottom-3 right-3 z-10 opacity-[0.12] transition-all duration-500 hover:opacity-70 md:bottom-5 md:right-5 ${className}`}
    >
      <Heart className="h-3.5 w-3.5 text-primary" fill="currentColor" />

      <style>{`
        .easter-egg-heart svg {
          transition: transform 600ms ease;
        }

        .easter-egg-heart:hover svg {
          transform: scale(1.35);
          filter: drop-shadow(0 0 6px rgba(215, 25, 32, 0.55));
        }

        @media (prefers-reduced-motion: reduce) {
          .easter-egg-heart,
          .easter-egg-heart svg {
            transition: none;
          }

          .easter-egg-heart:hover svg {
            transform: none;
            filter: none;
          }
        }
      `}</style>
    </div>
  );
}
