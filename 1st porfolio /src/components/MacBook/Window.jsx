import { AnimatePresence, motion } from "framer-motion";
import Draggable from "react-draggable";
import { useRef, useState, useContext } from "react";
import { ScreenScale } from "./ScreenScale.js";
import GuardedScroll from "./GuardedScroll.jsx";

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif';

export default function Window({
  id,
  title,
  isOpen,
  isMinimized = false,
  isFocused,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  defaultPosition = { x: 0, y: 0 },
  width = 540,
  height = 380,
  children,
}) {
  const nodeRef = useRef(null);
  const scale = useContext(ScreenScale);
  const [pos, setPos] = useState(defaultPosition); // Window stays mounted, so position survives close/reopen
  const [isMax, setIsMax] = useState(false);
  const [hoverTraffic, setHoverTraffic] = useState(false);

  const light = (bg, border) => ({
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: isFocused || hoverTraffic ? bg : "#515154",
    boxShadow: `inset 0 0 0 0.5px ${isFocused || hoverTraffic ? border : "rgba(0,0,0,0.3)"}`,
  });
  const glyph =
    "flex items-center justify-center text-[8px] leading-none font-bold text-black/60";

  return (
    <AnimatePresence>
      {isOpen && (
        <Draggable
          key={id}
          nodeRef={nodeRef}
          handle=".win-titlebar"
          bounds="parent"
          disabled={isMax}
          scale={scale}
          position={isMax ? { x: 0, y: 0 } : pos}
          onStart={onFocus}
          onStop={(_, d) => !isMax && setPos({ x: d.x, y: d.y })}
        >
          {/* Draggable owns this node's transform; framer-motion animates the child, so they never fight */}
          <div
            ref={nodeRef}
            className="absolute top-0 left-0"
            onPointerDownCapture={onFocus}
            style={{
              zIndex,
              fontFamily: FONT,
              width: isMax ? "100%" : `min(${width}px, calc(100% - 1rem))`,
              height: isMax
                ? "calc(100% - 5.5rem)"
                : `min(${height}px, calc(100% - 1rem))`,
              pointerEvents: isMinimized ? "none" : "auto",
            }}
          >
            <motion.div
              className="h-full flex flex-col overflow-hidden"
              style={{
                transformOrigin: "bottom center",
                borderRadius: 12,
                background: "#1e1e20",
                boxShadow: isFocused
                  ? "0 0 0 0.5px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.14), 0 26px 60px rgba(0,0,0,0.55)"
                  : "0 0 0 0.5px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), 0 12px 30px rgba(0,0,0,0.35)",
              }}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={
                isMinimized
                  ? { opacity: 0, scale: 0.25, y: 300 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* Title bar */}
              <div
                className="win-titlebar relative h-[34px] shrink-0 flex items-center select-none cursor-default"
                style={{
                  background: isFocused
                    ? "linear-gradient(#3b3b3e, #2e2e31)"
                    : "#29292b",
                  borderBottom: "1px solid rgba(0,0,0,0.55)",
                }}
                onMouseEnter={() => setHoverTraffic(true)}
                onMouseLeave={() => setHoverTraffic(false)}
                onDoubleClick={() => setIsMax((m) => !m)}
              >
                <div className="flex items-center gap-2 pl-3.5 z-10">
                  <button
                    style={light("#ff5f57", "#e0443e")}
                    className={glyph}
                    aria-label={`Close ${title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMax(false);
                      onClose();
                    }}
                  >
                    {hoverTraffic && "✕"}
                  </button>
                  <button
                    style={light("#febc2e", "#dea123")}
                    className={glyph}
                    aria-label={`Minimize ${title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMinimize?.();
                    }}
                  >
                    {hoverTraffic && "−"}
                  </button>
                  <button
                    style={light("#28c840", "#1aab29")}
                    className={glyph}
                    aria-label={
                      isMax ? `Restore ${title}` : `Maximize ${title}`
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMax((m) => !m);
                    }}
                  >
                    {hoverTraffic && (isMax ? "−" : "+")}
                  </button>
                </div>

                <span
                  className="absolute inset-x-24 text-center truncate text-[13px] font-semibold"
                  style={{ color: isFocused ? "#e8e8ea" : "#8e8e93" }}
                >
                  {title}
                </span>
              </div>

              {/* Content scrolls inside the window */}
              <GuardedScroll className="win-content flex-1 min-h-0 bg-[#1e1e20]">
                {children}
              </GuardedScroll>
            </motion.div>
          </div>
        </Draggable>
      )}
    </AnimatePresence>
  );
}
