import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const canUseCursor = () =>
  typeof window !== "undefined" &&
  window.innerWidth >= 768 &&
  !window.matchMedia("(pointer: coarse)").matches;

export default function CustomCursor() {
  const cursorRef = useRef(null);
  // Lazy init so the element exists on first render and the ref is set when the effect runs
  const [enabled] = useState(canUseCursor);

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.15,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.15,
      ease: "power3.out",
    });

    let hasMoved = false;
    const onMouseMove = (e) => {
      if (!hasMoved) {
        hasMoved = true;
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.to(cursor, { opacity: 1, duration: 0.2 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const interactive =
      'a, button, .dock-item, .project-item, [role="button"], input, [data-cursor="hover"]';
    const onOver = (e) => {
      if (e.target.closest?.(interactive)) {
        cursor.classList.add("hovering");
        gsap.to(cursor, { scale: 2, duration: 0.2, overwrite: "auto" });
      }
    };
    const onOut = (e) => {
      if (e.target.closest?.(interactive)) {
        cursor.classList.remove("hovering");
        gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: "auto" });
      }
    };
    const onLeaveWindow = () => gsap.to(cursor, { opacity: 0, duration: 0.2 });
    const onEnterWindow = () =>
      hasMoved && gsap.to(cursor, { opacity: 1, duration: 0.2 });

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    document.documentElement.addEventListener("mouseenter", onEnterWindow);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.removeEventListener("mouseenter", onEnterWindow);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="custom-cursor opacity-0 pointer-events-none"
      style={{ willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
