import { useEffect, useRef, useState } from "react";

/**
 * Fires exactly once, the first time the attached element enters the
 * viewport, then disconnects. Meant for a one-shot "notice me" nudge on a
 * small number of high-value elements, never a looping/repeating pulse.
 *
 * Usage: const { ref, pulsed } = useEnterPulse();
 *        <button ref={ref} className={cn(pulsed && "enter-pulse-once")}>
 */
export default function useEnterPulse() {
  const ref = useRef(null);
  const [pulsed, setPulsed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || pulsed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPulsed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [pulsed]);

  return { ref, pulsed };
}
