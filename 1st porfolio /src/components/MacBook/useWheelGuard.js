import { useEffect } from "react";

/**
 * Lenis hijacks the mouse wheel for the whole page. An element only needs to keep the wheel for
 * itself when it can actually scroll, so this toggles `data-lenis-prevent` based on overflow.
 * Windows whose content fits therefore never swallow the wheel, and the page keeps scrolling.
 */
export function useWheelGuard(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (el.scrollHeight > el.clientHeight + 1)
        el.setAttribute("data-lenis-prevent", "");
      else el.removeAttribute("data-lenis-prevent");
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [ref]);
}
