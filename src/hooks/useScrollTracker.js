import { useEffect, useRef } from "react";

const MIN_SPEED = 0.6;
const MAX_SPEED = 2.8;
const VELOCITY_TO_SPEED = 0.6;
const EASE_PER_EVENT = 0.25;
const IDLE_RESET_MS = 220;

/**
 * Shared, imperative scroll tracker. Calls `onUpdate({ progress, speed })` on
 * scroll, rAF-throttled to at most once per frame, and settles back to a
 * resting speed a moment after scrolling stops via a single debounce timer
 * (no continuous per-frame loop while idle).
 *
 * - progress: 0..1, how far down the whole page the user has scrolled.
 * - speed: a clamped multiplier, MIN_SPEED (resting) to MAX_SPEED (fast
 *   scroll), meant to drive animation-duration style calculations
 *   (duration = base / speed) so activity quickens the motion and idling
 *   settles it back down, without ever going frantic.
 *
 * Callers mutate their own DOM refs directly from the callback rather than
 * storing this in React state, so scrolling never triggers a re-render.
 */
export default function useScrollTracker(onUpdate) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    let ticking = false;
    let idleTimer = null;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let speed = MIN_SPEED;

    function computeProgress() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }

    function emit() {
      callbackRef.current?.({ progress: computeProgress(), speed });
    }

    function settleToRest() {
      speed = MIN_SPEED;
      emit();
    }

    function onFrame() {
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const dy = Math.abs(window.scrollY - lastY);
      const velocity = dy / dt;

      const target = Math.min(
        MAX_SPEED,
        Math.max(MIN_SPEED, MIN_SPEED + velocity * VELOCITY_TO_SPEED)
      );
      speed += (target - speed) * EASE_PER_EVENT;

      emit();

      lastY = window.scrollY;
      lastT = now;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onFrame);
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(settleToRest, IDLE_RESET_MS);
    }

    emit();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idleTimer);
    };
  }, []);
}
