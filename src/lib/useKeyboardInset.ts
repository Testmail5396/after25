import { useEffect, useState } from "react";

/**
 * Tracks how much the on-screen keyboard has shrunk the visual viewport, so
 * fixed-position bars (bottom action dock, FAB) can lift above it instead of
 * being hidden underneath on mobile Safari/Chrome.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    function update() {
      const vp = window.visualViewport;
      if (!vp) return;
      const gap = window.innerHeight - vp.height - vp.offsetTop;
      setInset(gap > 40 ? gap : 0);
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
