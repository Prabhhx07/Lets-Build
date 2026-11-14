import { useRef, useState, useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MacScreen from "./MacScreen.jsx";
import PcbBackground from "../effects/PcbBackground.jsx";
import { ScreenScale } from "./ScreenScale.js";

gsap.registerPlugin(ScrollTrigger);

// The macOS UI is laid out on a fixed logical display and scaled to the glass, like a real Retina screen.
const BASE_W = 1280;
const BASE_H = 832;

const PAD = 0.009; // bezel thickness as a fraction of laptop width
const LID_OPEN = 12; // lid angle past vertical (degrees)
const TILT_CLOSED = -62; // camera looks down on the closed laptop
const SCROLL_LENGTH = "+=500%";

// ---------- helpers ----------
const rotX = (y, z, deg) => {
  const a = (deg * Math.PI) / 180;
  return [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
};

function getGeometry(vw, vh) {
  const W = Math.min(vw * 0.6, vh * 1.25);
  const dispW = W * (1 - 2 * PAD);
  const dispH = (dispW * BASE_H) / BASE_W;
  const D = dispH + 2 * W * PAD; // lid height == deck depth
  const tb = W * 0.012; // base thickness
  const tl = W * 0.007; // lid thickness
  const R = W * 0.012;
  const S = Math.min(vh / dispH, vw / dispW); // zoom so the display fills the viewport

  // On smaller screens a 1280px-wide desktop would shrink to unreadable text, so the logical
  // display gets smaller too (never below 860px wide), keeping the UI at a readable size.
  const lw = Math.round(Math.min(BASE_W, Math.max(860, (dispW * S) / 0.9)));
  const lh = Math.round((lw * BASE_H) / BASE_W);

  // Where the display centre ends up when the lid is open and the rig is tilted to face the camera.
  let [yl, zl] = rotX(-D / 2, 0, LID_OPEN); // lid swings about the hinge
  zl += -D / 2; // laptop group is shifted so the rig origin is the deck centre
  const [yf, zf] = rotX(yl, zl, -LID_OPEN); // rig tilt that cancels the lid angle
  return { W, dispW, dispH, D, tb, tl, R, S, yf, zf, lw, lh };
}

function useViewport() {
  const read = () => ({ vw: window.innerWidth, vh: window.innerHeight });
  const [vp, setVp] = useState(read);
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const next = read();
        // On touch devices, ignore small height-only changes (browser toolbars sliding in and out),
        // otherwise the scroll animation would rebuild while the user is scrolling.
        // On laptops/desktops every size change counts, or the final zoom would be computed for a stale height.
        const touch = window.matchMedia("(pointer: coarse)").matches;
        setVp((prev) =>
          touch && next.vw === prev.vw && Math.abs(next.vh - prev.vh) < 120
            ? prev
            : next,
        );
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return vp;
}

// ---------- materials ----------
const ALU =
  "linear-gradient(135deg, #2d2e32 0%, #1c1d20 34%, #28292d 56%, #131416 100%)"; // space black
const ALU_EDGE = "linear-gradient(180deg, #26272a, #0d0d0f)";
const BRUSH =
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px)";

function Laptop({ geo, bgRef, hintRef, moreRef, onScale, onLive }) {
  const { W, dispW, dispH, D, tb, tl, R, S, yf, zf, lw, lh } = geo;

  const zoomRef = useRef(null);
  const tiltRef = useRef(null);
  const spinRef = useRef(null);
  const lidRef = useRef(null);
  const shadowRef = useRef(null);
  const displayRef = useRef(null);

  const [screenOn, setScreenOn] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const zoom = zoomRef.current;
    const tilt = tiltRef.current;
    const spin = spinRef.current;
    const lid = lidRef.current;
    const shadow = shadowRef.current;
    const vh = window.innerHeight;
    if (!zoom || !tilt || !spin || !lid) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let isOn = false;
    let isInteractive = false;

    const measure = () => {
      const w = displayRef.current?.getBoundingClientRect().width;
      if (w) onScale(w / lw);
    };

    const ctx = gsap.context(() => {
      // ----- start pose: laptop is closed, high above the viewport, tilted to be seen from above -----
      gsap.set(zoom, {
        x: 0,
        y: -vh * 1.15,
        z: 0,
        scale: 0.85,
        transformOrigin: "0 0",
        visibility: "visible",
      });
      gsap.set(tilt, { rotateX: TILT_CLOSED });
      gsap.set(spin, { rotateY: -450 });
      gsap.set(lid, { rotateX: -90 });
      gsap.set(shadow, { opacity: 0 });

      const tl = gsap.timeline({
        paused: reduce,
        defaults: { ease: "none" },
        scrollTrigger: reduce
          ? undefined
          : {
              trigger: "#macbook-experience",
              start: "top top",
              end: SCROLL_LENGTH,
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const p = self.progress;
                const on = p > 0.62;
                if (on !== isOn) {
                  isOn = on;
                  setScreenOn(on);
                }
                const live = p > 0.985;
                if (live !== isInteractive) {
                  isInteractive = live;
                  if (live) measure();
                  setInteractive(live);
                  onLive?.(live);
                }
              },
            },
      });

      // Intro hint disappears as soon as scrolling starts
      tl.to(hintRef.current, { opacity: 0, duration: 0.4 }, 0);
      // "A LITTLE MORE" takes over once SCROLL is gone, and leaves when the lid is fully open
      tl.fromTo(
        moreRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        0.4,
      ).to(moreRef.current, { opacity: 0, duration: 0.5 }, 7.4);

      // PHASE 1 (1 -> 4): the closed MacBook drops in from above while spinning
      tl.to(zoom, { y: 0, scale: 1, duration: 3, ease: "power3.out" }, 1)
        .to(spin, { rotateY: 0, duration: 3, ease: "power2.out" }, 1)
        .to(shadow, { opacity: 0.85, duration: 1, ease: "power1.in" }, 3.2);

      // PHASE 2 (4.4 -> 7.4): the lid opens and the camera tilts up to face the screen
      tl.to(lid, { rotateX: LID_OPEN, duration: 3, ease: "power2.inOut" }, 4.4)
        .to(
          tilt,
          { rotateX: -LID_OPEN, duration: 3, ease: "power2.inOut" },
          4.4,
        )
        .to(zoom, { y: -yf, z: -zf, duration: 3, ease: "power2.inOut" }, 4.4);

      // PHASE 3 (7.6 -> 10): fly into the screen until the display fills the viewport
      tl.to(
        zoom,
        { scale: S, y: -S * yf, duration: 2.4, ease: "power2.inOut" },
        7.6,
      )
        .to(shadow, { opacity: 0, duration: 1, ease: "power1.out" }, 7.4)
        .to(
          bgRef.current,
          { opacity: 0, duration: 1.4, ease: "power1.out" },
          8.4,
        );

      if (reduce) {
        tl.progress(1);
        setScreenOn(true);
        setInteractive(true);
        measure();
      }
    });

    const onRefresh = () => isInteractive && measure();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ctx.revert();
      setScreenOn(false);
      setInteractive(false);
    };
  }, [geo, bgRef, hintRef, moreRef, onScale, onLive]);

  const gap = Math.max(1.5, W * 0.0022);
  const abs = { position: "absolute" };
  const preserve = { transformStyle: "preserve-3d" };
  const zero = {
    position: "absolute",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ...preserve,
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ perspective: 2200, perspectiveOrigin: "50% 50%" }}
    >
      {/* contact shadow */}
      <div
        ref={shadowRef}
        aria-hidden="true"
        style={{
          ...abs,
          left: "50%",
          top: "50%",
          width: W * 0.92,
          height: W * 0.14,
          marginLeft: -W * 0.46,
          marginTop: D * 0.3,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.8)",
          filter: "blur(26px)",
        }}
      />

      {/* zoom (translate/scale) > tilt (camera pitch) > spin (turntable) > laptop */}
      <div
        ref={zoomRef}
        style={{ ...zero, left: "50%", top: "50%", visibility: "hidden" }}
      >
        <div ref={tiltRef} style={zero}>
          <div ref={spinRef} style={zero}>
            <div style={{ ...zero, transform: `translateZ(${-D / 2}px)` }}>
              {/* ===== BASE (hinge at origin, deck extends toward the viewer) ===== */}
              {/* deck top: keyboard + trackpad */}
              <div
                style={{
                  ...abs,
                  left: -W / 2,
                  top: 0,
                  width: W,
                  height: D,
                  transformOrigin: "50% 0",
                  transform: "rotateX(90deg)",
                  background: `${BRUSH}, ${ALU}`,
                  borderRadius: `0 0 ${R}px ${R}px`,
                  boxShadow:
                    "inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    ...abs,
                    left: "4.5%",
                    top: "5%",
                    width: "91%",
                    height: "45%",
                    background: "#08080a",
                    borderRadius: W * 0.004,
                    padding: W * 0.004,
                    boxSizing: "border-box",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#17181b",
                      backgroundImage: `linear-gradient(90deg, #040405 ${gap}px, transparent ${gap}px), linear-gradient(180deg, #040405 ${gap}px, transparent ${gap}px)`,
                      backgroundSize: "calc(100% / 14) calc(100% / 6)",
                    }}
                  />
                </div>
                <div
                  style={{
                    ...abs,
                    left: "28%",
                    top: "60%",
                    width: "44%",
                    height: "35%",
                    borderRadius: W * 0.006,
                    background: "linear-gradient(180deg, #232427, #1a1b1e)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                />
              </div>
              {/* base sides */}
              <div
                style={{
                  ...abs,
                  left: -W / 2,
                  top: 0,
                  width: W,
                  height: tb,
                  transform: `translateZ(${D}px)`,
                  background: ALU_EDGE,
                  borderRadius: `0 0 ${R * 0.6}px ${R * 0.6}px`,
                }}
              />
              <div
                style={{
                  ...abs,
                  left: -W / 2,
                  top: 0,
                  width: W,
                  height: tb,
                  transform: "rotateY(180deg)",
                  background: ALU_EDGE,
                }}
              />
              <div
                style={{
                  ...abs,
                  left: -W / 2,
                  top: 0,
                  width: D,
                  height: tb,
                  transformOrigin: "0 0",
                  transform: "rotateY(-90deg)",
                  background: ALU_EDGE,
                }}
              />
              <div
                style={{
                  ...abs,
                  left: W / 2,
                  top: 0,
                  width: D,
                  height: tb,
                  transformOrigin: "0 0",
                  transform: "rotateY(-90deg)",
                  background: ALU_EDGE,
                }}
              />

              {/* ===== LID (pivots on its bottom edge = hinge) ===== */}
              <div
                ref={lidRef}
                style={{
                  ...abs,
                  left: -W / 2,
                  top: -D,
                  width: W,
                  height: D,
                  transformOrigin: "50% 100%",
                  ...preserve,
                }}
              >
                {/* front: black glass + display */}
                <div
                  style={{
                    ...abs,
                    inset: 0,
                    padding: W * PAD,
                    boxSizing: "border-box",
                    background: "linear-gradient(180deg, #0c0c0e, #050506)",
                    borderRadius: `${R}px ${R}px ${R * 0.3}px ${R * 0.3}px`,
                    boxShadow: "0 0 0 1px #2b2c30, inset 0 0 0 1px #121214",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div
                    ref={displayRef}
                    style={{
                      position: "relative",
                      width: dispW,
                      height: dispH,
                      overflow: "hidden",
                      background: "#000",
                      borderRadius: R * 0.45,
                    }}
                  >
                    <div
                      className={interactive ? "" : "mac-inert"}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: lw,
                        height: lh,
                        transformOrigin: "top left",
                        transform: `scale(${dispW / lw})`,
                        pointerEvents: interactive ? "auto" : "none",
                      }}
                    >
                      <MacScreen isMacOpen={screenOn} size={{ w: lw, h: lh }} />
                    </div>

                    {/* notch + camera */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 bg-black z-50 flex items-center justify-center"
                      style={{
                        width: "6.6%",
                        height: "3.4%",
                        borderRadius: `0 0 ${R * 0.45}px ${R * 0.45}px`,
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          width: "9%",
                          aspectRatio: "1",
                          borderRadius: "50%",
                          background:
                            "radial-gradient(circle at 35% 35%, #25283a, #0a0a0e 70%)",
                        }}
                      />
                    </div>

                    {/* glass reflection */}
                    <div
                      className="absolute inset-0 z-40"
                      style={{
                        pointerEvents: "none",
                        background:
                          "linear-gradient(118deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 28%, transparent 55%)",
                      }}
                    />
                  </div>
                </div>

                {/* back: plain brushed aluminium (visible when closed) */}
                <div
                  style={{
                    ...abs,
                    inset: 0,
                    transform: `translateZ(${-tl}px) rotateY(180deg)`,
                    backfaceVisibility: "hidden",
                    background: `${BRUSH}, ${ALU}`,
                    borderRadius: `${R}px ${R}px ${R * 0.3}px ${R * 0.3}px`,
                    boxShadow:
                      "inset 0 0 0 1px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                />

                {/* lid edges */}
                <div
                  style={{
                    ...abs,
                    left: 0,
                    top: 0,
                    width: tl,
                    height: D,
                    transformOrigin: "0 0",
                    transform: "rotateY(90deg)",
                    background: ALU_EDGE,
                  }}
                />
                <div
                  style={{
                    ...abs,
                    left: W,
                    top: 0,
                    width: tl,
                    height: D,
                    transformOrigin: "0 0",
                    transform: "rotateY(90deg)",
                    background: ALU_EDGE,
                  }}
                />
                <div
                  style={{
                    ...abs,
                    left: 0,
                    top: 0,
                    width: W,
                    height: tl,
                    transformOrigin: "50% 0",
                    transform: "rotateX(-90deg)",
                    background: ALU_EDGE,
                  }}
                />
                <div
                  style={{
                    ...abs,
                    left: 0,
                    top: D,
                    width: W,
                    height: tl,
                    transformOrigin: "50% 0",
                    transform: "rotateX(-90deg)",
                    background: ALU_EDGE,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MacBook() {
  const { vw, vh } = useViewport();
  // Phones (and landscape phones) get the plain full-screen desktop instead of the 3D laptop
  const isDesktop = vw >= 768 && vh >= 520;
  const geo = useMemo(() => getGeometry(vw, vh), [vw, vh]);

  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const hintRef = useRef(null);
  const moreRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [live, setLive] = useState(false);

  // Phones: no 3D, the macOS desktop fills the screen and the page doesn't scroll
  useEffect(() => {
    if (isDesktop) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [isDesktop]);

  return (
    <section
      id="macbook-experience"
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#050507]"
    >
      <div ref={bgRef} className="absolute inset-0">
        <PcbBackground paused={live} />
      </div>

      {isDesktop ? (
        <>
          <div
            ref={hintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.3em] text-white/60 pointer-events-none select-none"
            style={{ zIndex: 3 }}
          >
            SCROLL
          </div>

          <div
            ref={moreRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.3em] text-white/60 pointer-events-none select-none whitespace-nowrap"
            style={{ zIndex: 3, opacity: 0 }}
          >
            A LITTLE MORE
          </div>

          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            <ScreenScale.Provider value={scale}>
              <Laptop
                geo={geo}
                bgRef={bgRef}
                hintRef={hintRef}
                moreRef={moreRef}
                onScale={setScale}
                onLive={setLive}
              />
            </ScreenScale.Provider>
          </div>
        </>
      ) : (
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          <MacScreen isMacOpen compact />
        </div>
      )}
    </section>
  );
}
