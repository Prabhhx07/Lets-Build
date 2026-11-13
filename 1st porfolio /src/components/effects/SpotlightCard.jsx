import { useRef } from "react";

// Writes the pointer position to CSS variables instead of React state,
// so hovering a card never triggers a re-render.
export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(139, 92, 246, 0.22)",
  ...props
}) {
  const divRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const setOpacity = (v) => divRef.current?.style.setProperty("--spot-o", v);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity("1")}
      onMouseLeave={() => setOpacity("0")}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#18181c] to-[#101013] transition-[transform,border-color] duration-300 shadow-xl ${className}`}
      style={{ "--spot-x": "50%", "--spot-y": "50%", "--spot-o": 0 }}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: "var(--spot-o)",
          background: `radial-gradient(500px circle at var(--spot-x) var(--spot-y), ${spotlightColor}, transparent 50%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
