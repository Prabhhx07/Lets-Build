import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

const NAME = "Prabhjot Singh";

export default function Preloader({ onComplete }) {
  const preloaderRef = useRef(null);
  const nameRef = useRef(null);
  const barFillRef = useRef(null);
  const counterRef = useRef(null);
  const [visible, setVisible] = useState(true);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const preloaderEl = preloaderRef.current;
    if (!preloaderEl) return;

    let finished = false;
    let exitTween = null;

    const finish = () => {
      if (finished) return;
      finished = true;
      exitTween = gsap.to(preloaderEl, {
        opacity: 0,
        yPercent: -100,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          setVisible(false);
          onCompleteRef.current?.();
        },
      });
    };

    const ctx = gsap.context(() => {
      const chars = nameRef.current?.querySelectorAll(".char") ?? [];
      const counter = { value: 0 };

      const tl = gsap.timeline({ onComplete: finish });

      if (chars.length) {
        tl.to(chars, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.02,
          ease: "power3.out",
        });
      }

      tl.to(
        barFillRef.current,
        { width: "100%", duration: 1.2, ease: "power2.inOut" },
        "+=0.1",
      );
      tl.to(
        counter,
        {
          value: 100,
          duration: 1.2,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterRef.current)
              counterRef.current.textContent = `${Math.round(counter.value)}%`;
          },
        },
        "<",
      );
    }, preloaderRef);

    // Fallback if the timeline is ever interrupted; cleared on unmount
    const fallback = setTimeout(finish, 3000);

    return () => {
      clearTimeout(fallback);
      exitTween?.kill();
      ctx.revert();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="preloader"
      ref={preloaderRef}
      role="status"
      aria-label="Loading"
    >
      <div className="preloader-name" ref={nameRef} aria-hidden="true">
        {NAME.split("").map((char, i) => (
          <span key={i} className="char">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
      <div className="preloader-bar-track">
        <div className="preloader-bar-fill" ref={barFillRef} />
      </div>
      <div className="preloader-counter" ref={counterRef}>
        0%
      </div>
    </div>
  );
}
