import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function SplitText({
  text = "",
  className = "",
  delay = 0,
  duration = 0.6,
  stagger = 0.02,
  play = true, // lets the parent hold the animation until the preloader is gone
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll(".split-char");
    if (!chars.length) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      gsap.set(chars, { opacity: 1, y: 0 });
      return;
    }

    if (!play) {
      gsap.set(chars, { opacity: 0, y: 20 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration, stagger, delay, ease: "power3.out" },
      );
    }, el);

    return () => ctx.revert();
  }, [text, delay, duration, stagger, play]);

  const words = text.split(" ");

  return (
    <span
      ref={containerRef}
      className={`inline-block ${className}`}
      aria-label={text}
      role="text"
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          aria-hidden="true"
          className="inline-block whitespace-nowrap mr-[0.25em]"
        >
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className="split-char inline-block"
              style={{ willChange: "transform, opacity" }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
