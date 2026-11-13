import { useEffect, useRef } from "react";

/**
 * Wireframe isometric PCB with chromatic-aberration edges and a HUD in the four corners.
 * Pure canvas 2D: no external scripts, no watermark. Pauses when off-screen / tab hidden.
 */

// Big dithered text behind the board (one entry per line) and the small line at the top centre.
const BG_TEXT = ["PRABH", "is-a.dev??"];
const BG_TAGLINE = "Welcome to the Hood";

// Size of the see-through hole the cursor cuts into the board (fraction of the shorter screen side)
const REVEAL = 0.22;

// ---------- tiny seeded PRNG so the board is identical on every load ----------
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- geometry helpers ----------
const rect = (cx, cz, w, d) => [
  [cx - w / 2, cz - d / 2],
  [cx + w / 2, cz - d / 2],
  [cx + w / 2, cz + d / 2],
  [cx - w / 2, cz + d / 2],
];
const circle = (cx, cz, r, n = 10) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
  });

// Extrude a 2D polygon (x,z) upward from y0 by h into top + side faces
function extrude(poly, y0, h) {
  const n = poly.length;
  const cx = poly.reduce((s, p) => s + p[0], 0) / n;
  const cz = poly.reduce((s, p) => s + p[1], 0) / n;
  const faces = [
    {
      p: poly.map(([x, z]) => [x, y0 + h, z]),
      n: [0, 1, 0],
      c: [cx, y0 + h, cz],
    },
  ];
  for (let i = 0; i < n; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % n];
    let nx = z2 - z1;
    let nz = -(x2 - x1);
    const l = Math.hypot(nx, nz) || 1;
    nx /= l;
    nz /= l;
    if (nx * ((x1 + x2) / 2 - cx) + nz * ((z1 + z2) / 2 - cz) < 0) {
      nx = -nx;
      nz = -nz;
    }
    faces.push({
      p: [
        [x1, y0, z1],
        [x2, y0, z2],
        [x2, y0 + h, z2],
        [x1, y0 + h, z1],
      ],
      n: [nx, 0, nz],
      c: [(x1 + x2) / 2, y0 + h / 2, (z1 + z2) / 2],
    });
  }
  return faces;
}

// Scene = plates; each plate has its own faces and a list of components sitting on it.
// Drawing is ordered plate-by-plate and object-by-object, which avoids the "big face covers
// neighbours" artefacts you get from sorting every single face on its own.
function buildScene() {
  const rand = mulberry32(23);
  const T = 0.35; // board thickness

  const defs = [
    { cx: 0, cz: 0, w: 12, d: 3.6 },
    { cx: -4.5, cz: 4.4, w: 3, d: 5.2 }, // branch toward the viewer (left)
    { cx: 4.5, cz: -4.4, w: 3, d: 5.2 }, // branch away from the viewer (right)
  ];

  return defs.map((pl) => {
    const faces = extrude(rect(pl.cx, pl.cz, pl.w, pl.d), 0, T);

    // copper traces
    for (let i = 0; i < 9; i++) {
      const horizontal = pl.w >= pl.d;
      const off = (rand() - 0.5) * (horizontal ? pl.d : pl.w) * 0.85;
      const lim = (horizontal ? pl.w : pl.d) * 0.47;
      const clamp = (v) => Math.max(-lim, Math.min(lim, v));
      const a = clamp((rand() - 0.5) * (horizontal ? pl.w : pl.d) * 0.9);
      const b = clamp(a + (0.8 + rand() * 2.4) * (rand() > 0.5 ? 1 : -1));
      const y = T + 0.002;
      const line = horizontal
        ? [
            [pl.cx + a, y, pl.cz + off],
            [pl.cx + b, y, pl.cz + off],
          ]
        : [
            [pl.cx + off, y, pl.cz + a],
            [pl.cx + off, y, pl.cz + b],
          ];
      faces.push({
        p: line,
        n: [0, 1, 0],
        c: line[0],
        line: true,
        trace: true,
      });
    }

    const items = [];
    const add = (cx, cz, f) => items.push({ c: [cx, T, cz], faces: f });

    const cell = 1.25;
    const nx = Math.floor(pl.w / cell);
    const nz = Math.floor(pl.d / cell);
    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        if (rand() < 0.15) continue;
        const cx =
          pl.cx - (nx * cell) / 2 + cell * (ix + 0.5) + (rand() - 0.5) * 0.1;
        const cz =
          pl.cz - (nz * cell) / 2 + cell * (iz + 0.5) + (rand() - 0.5) * 0.1;
        const r = rand();

        if (r < 0.42) {
          // hollow-top cube
          const s = 0.8 + rand() * 0.25;
          const h = 0.45 + rand() * 1.1;
          const f = extrude(rect(cx, cz, s, s), T, h);
          const inset = rect(cx, cz, s * 0.5, s * 0.5).map(([x, z]) => [
            x,
            T + h + 0.002,
            z,
          ]);
          f.push({
            p: inset,
            n: [0, 1, 0],
            c: [cx, T + h, cz],
            line: true,
            closed: true,
          });
          add(cx, cz, f);
        } else if (r < 0.6) {
          // flat chip with an inset die
          const s = 1.0 + rand() * 0.15;
          const f = extrude(rect(cx, cz, s, s), T, 0.2);
          const die = rect(cx, cz, s * 0.55, s * 0.55).map(([x, z]) => [
            x,
            T + 0.202,
            z,
          ]);
          f.push({
            p: die,
            n: [0, 1, 0],
            c: [cx, T + 0.2, cz],
            line: true,
            closed: true,
          });
          add(cx, cz, f);
        } else if (r < 0.72) {
          add(
            cx,
            cz,
            extrude(
              circle(cx, cz, 0.28 + rand() * 0.08),
              T,
              0.45 + rand() * 0.45,
            ),
          );
        } else if (r < 0.86) {
          const count = 3 + Math.floor(rand() * 3);
          for (let k = 0; k < count; k++) {
            const px = cx - 0.4 + k * 0.22;
            add(px, cz, extrude(rect(px, cz, 0.09, 0.09), T, 0.5));
          }
        } else {
          for (let k = 0; k < 6; k++) {
            const px = cx - 0.5 + k * 0.2;
            add(px, cz, extrude(rect(px, cz, 0.07, 0.9), T, 0.8));
          }
        }
      }
    }
    return { c: [pl.cx, T / 2, pl.cz], faces, items };
  });
}

export default function PcbBackground({
  className = "",
  hud = true, // small tagline at the top centre
  text = true, // big dithered name
  interactive = true, // mouse parallax, hover reveal, swipe glitch
  glitch = true, // random glitch bursts
  paused = false,
}) {
  const pausedRef = useRef(paused);
  const ctrlRef = useRef(null);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const hudRef = useRef(null);
  const ditherRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const plates = buildScene();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // ---- ordered (Bayer) dither layer: a low-res glow field around the board, drawn as chunky pixels ----
    const dcanvas = ditherRef.current;
    const dctx = dcanvas?.getContext("2d");
    const PX = 3; // CSS pixels per dither pixel
    const bayer = new Float32Array(64);
    {
      let m = [[0]];
      for (let n = 1; n < 8; n *= 2) {
        const sz = m.length;
        const next = Array.from({ length: sz * 2 }, () =>
          Array.from({ length: sz * 2 }),
        );
        for (let y = 0; y < sz; y++)
          for (let x = 0; x < sz; x++) {
            const v = m[y][x] * 4;
            next[y][x] = v;
            next[y][x + sz] = v + 2;
            next[y + sz][x] = v + 3;
            next[y + sz][x + sz] = v + 1;
          }
        m = next;
      }
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) bayer[y * 8 + x] = (m[y][x] + 0.5) / 64;
    }
    let dW = 0;
    let dH = 0;
    let dImg = null;
    let dBuf = null;
    let dBase = null;
    let dCols = null;
    let dText = null; // text mask (0..1) at dither resolution
    let lastD = 0;

    const setupDither = () => {
      if (!dcanvas || !dctx) return;
      dW = Math.max(1, Math.ceil(cw / PX));
      dH = Math.max(1, Math.ceil(ch / PX));
      dcanvas.width = dW;
      dcanvas.height = dH;
      dImg = dctx.createImageData(dW, dH);
      dBuf = new Uint32Array(dImg.data.buffer);
      dBase = new Float32Array(dW * dH);
      dCols = new Uint32Array(dW);
      for (let y = 0; y < dH; y++) {
        for (let x = 0; x < dW; x++) {
          const nx = (x + 0.5) / dW;
          const ny = (y + 0.5) / dH;
          const r = Math.hypot((nx - 0.5) / 0.56, (ny - 0.5) / 0.42);
          dBase[y * dW + x] = Math.pow(Math.max(0, 1 - r), 1.4) * 0.95;
        }
      }
      // text mask: draw the lines on a tiny canvas, the antialiased edges become dithered edges
      const mc = document.createElement("canvas");
      mc.width = dW;
      mc.height = dH;
      const mx = mc.getContext("2d");
      if (mx && cfg.text) {
        mx.fillStyle = "#fff";
        mx.textAlign = "center";
        mx.textBaseline = "middle";
        const ys =
          BG_TEXT.length === 1
            ? [0.5]
            : BG_TEXT.map(
                (_, i) => 0.38 + (i * 0.3) / Math.max(1, BG_TEXT.length - 1),
              );
        BG_TEXT.forEach((line, i) => {
          const size = Math.min(dH * 0.34, (dW * 0.92) / (line.length * 0.62));
          mx.font = `800 ${size}px "JetBrains Mono", ui-monospace, monospace`;
          mx.fillText(line, dW / 2, dH * ys[i]);
        });
        const px = mx.getImageData(0, 0, dW, dH).data;
        dText = new Float32Array(dW * dH);
        for (let i = 0; i < dText.length; i++) dText[i] = px[i * 4 + 3] / 255;
      }

      // warm on the left, cool on the right (matches the edge fringe), packed as ABGR without alpha
      for (let x = 0; x < dW; x++) {
        const k = x / dW;
        const r = Math.round(255 + (110 - 255) * k);
        const g2 = Math.round(170 + 10 * k);
        const b = Math.round(120 + (255 - 120) * k);
        dCols[x] = (b << 16) | (g2 << 8) | r;
      }
    };

    const ditherFrame = (t, gi) => {
      if (!dctx || !dBuf) return;
      const tt = t * 0.00035;
      const bandY = Math.random() * dH;
      const bandH = 6 + Math.random() * 18;
      // hover spotlight: the cursor lights up the dither and sharpens the text under it
      const mx = ((mouse.x + 1) / 2) * dW;
      const my = ((mouse.y + 1) / 2) * dH;
      const rv = mouse.reveal;
      const sigma = Math.max(1, ((Math.min(cw, ch) * REVEAL) / PX) * 0.75 * rv);
      const reach = sigma * 3;
      const inv2s = 1 / (2 * sigma * sigma);
      for (let y = 0; y < dH; y++) {
        const cy = Math.cos((y / dH) * 5 - tt * 0.8);
        const inBand = gi > 0 && Math.abs(y - bandY) < bandH;
        const shift = inBand ? Math.round((Math.random() - 0.5) * 18 * gi) : 0;
        const row = (y & 7) * 8;
        for (let x = 0; x < dW; x++) {
          const i = y * dW + x;
          const plasma = 0.5 + 0.5 * Math.sin((x / dW) * 6 + tt) * cy;
          let v = dBase[i] * (0.6 + 0.4 * plasma);
          if (inBand) v += 0.35 * gi;
          let spot = 0;
          const ddx = x - mx;
          const ddy = y - my;
          if (rv > 0.02 && Math.abs(ddx) < reach && Math.abs(ddy) < reach) {
            spot = Math.exp(-(ddx * ddx + ddy * ddy) * inv2s);
            v += spot * 0.5;
          }
          let tv = 0;
          if (dText) {
            const tx = Math.min(dW - 1, Math.max(0, x + shift));
            tv = dText[y * dW + tx] * (0.38 + 0.8 * spot); // faint normally, solid under the cursor
          }
          const thr = bayer[row + (x & 7)];
          if (tv > thr) {
            dBuf[i] = ((90 + ((spot * 150) | 0)) << 24) | 0xbfb4aa; // grey glyph pixel (ABGR), brighter under the cursor
          } else if (v > thr) {
            const a = Math.min(255, (30 + v * 120) | 0);
            dBuf[i] = (a << 24) | dCols[x];
          } else {
            dBuf[i] = 0;
          }
        }
      }
      dctx.putImageData(dImg, 0, 0);
    };

    const tmp = document.createElement("canvas");
    const tctx = tmp.getContext("2d");
    const g = { end: 0, next: glitch ? performance.now() + 1500 : Infinity }; // glitch bursts
    let wasGlitching = false;

    let cw = 0;
    let ch = 0;
    let rafId = 0;
    let running = false;
    let last = 0;
    const cfg = { hud, text, interactive, glitch };
    const mouse = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      energy: 0,
      reveal: 0,
      active: false,
    };
    let lastTrigger = 0;

    const resize = () => {
      cw = wrap.clientWidth || window.innerWidth;
      ch = wrap.clientHeight || window.innerHeight;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      setupDither();
      if (!running) {
        draw(performance.now(), 0);
        ditherFrame(0, 0);
      }
    };

    const draw = (time, gi) => {
      const ab = 1.6 + gi * 5; // chromatic split widens during a glitch
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const yaw =
        0.62 + Math.sin((time / 14000) * Math.PI * 2) * 0.1 + mouse.x * 0.12;
      const pitch = 0.62 + mouse.y * 0.05;
      const cY = Math.cos(yaw),
        sY = Math.sin(yaw),
        cP = Math.cos(pitch),
        sP = Math.sin(pitch);
      const scale = Math.min(cw * 0.043, ch * 0.07);
      const ox = cw * 0.5;
      const oy = ch * 0.5;

      const rotate = (x, y, z) => {
        const rx = x * cY - z * sY;
        const rz = x * sY + z * cY;
        return [rx, y * cP - rz * sP, y * sP + rz * cP]; // [x, up, depth]
      };

      const drawFaces = (arr) => {
        const list = [];
        for (const f of arr) {
          const nrz = f.n[0] * sY + f.n[2] * cY;
          if (!f.line && f.n[1] * sP + nrz * cP <= 0) continue; // back-face cull
          const c = rotate(f.c[0], f.c[1], f.c[2]);
          const pts = f.p.map(([x, y, z]) => {
            const r = rotate(x, y, z);
            return [ox + r[0] * scale, oy - r[1] * scale];
          });
          list.push({
            pts,
            depth: c[2] + (f.line ? 0.0005 : 0),
            line: f.line,
            closed: f.closed,
            trace: f.trace,
          });
        }
        list.sort((a, b) => a.depth - b.depth);

        for (const it of list) {
          const path = new Path2D();
          it.pts.forEach(([x, y], i) =>
            i ? path.lineTo(x, y) : path.moveTo(x, y),
          );
          if (!it.line || it.closed) path.closePath();
          if (!it.line) {
            ctx.fillStyle = "#08080b";
            ctx.fill(path);
          }
          const a = Math.max(0.4, Math.min(1, 0.65 + it.depth * 0.04));
          const k = it.trace ? 0.6 : 1;
          // chromatic aberration: shifted orange + blue copies under the main white edge
          ctx.save();
          ctx.translate(-ab, 0);
          ctx.strokeStyle = `rgba(255,140,70,${0.85 * a * k})`;
          ctx.stroke(path);
          ctx.restore();
          ctx.save();
          ctx.translate(ab, 0);
          ctx.strokeStyle = `rgba(90,150,255,${0.85 * a * k})`;
          ctx.stroke(path);
          ctx.restore();
          ctx.strokeStyle = `rgba(232,237,248,${0.95 * a * k})`;
          ctx.stroke(path);
        }
      };

      ctx.lineJoin = "round";
      ctx.lineWidth = 1.3;
      const depthOf = (c) => rotate(c[0], c[1], c[2])[2];
      [...plates]
        .sort((a, b) => depthOf(a.c) - depthOf(b.c))
        .forEach((pl) => {
          drawFaces(pl.faces);
          [...pl.items]
            .sort((a, b) => depthOf(a.c) - depthOf(b.c))
            .forEach((item) => drawFaces(item.faces));
        });
    };

    // Cut a soft see-through hole in the board around the cursor, so the dithered text behind shows
    const reveal = () => {
      const rv = mouse.reveal;
      if (rv < 0.02) return;
      const R = Math.min(cw, ch) * REVEAL * rv * dpr;
      const x = ((mouse.x + 1) / 2) * canvas.width;
      const y = ((mouse.y + 1) / 2) * canvas.height;
      const gr = ctx.createRadialGradient(x, y, R * 0.35, x, y, R);
      gr.addColorStop(0, "rgba(0,0,0,1)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = gr;
      ctx.fillRect(x - R, y - R, R * 2, R * 2);
      ctx.restore();
    };

    // Horizontal slice tearing + coloured scan blocks, drawn on top of the finished frame
    const tear = (gi) => {
      const W = canvas.width;
      const H = canvas.height;
      tctx.clearRect(0, 0, W, H);
      tctx.drawImage(canvas, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const slices = 3 + Math.floor(Math.random() * 6 * gi);
      for (let i = 0; i < slices; i++) {
        const y = Math.random() * H;
        const h = (6 + Math.random() * 50) * dpr;
        const dx = (Math.random() - 0.5) * 90 * gi * dpr;
        ctx.clearRect(0, y, W, h);
        ctx.drawImage(tmp, 0, y, W, h, dx, y, W, h);
      }
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle =
          k % 2 ? "rgba(255,140,70,0.35)" : "rgba(90,150,255,0.35)";
        ctx.fillRect(
          Math.random() * W,
          Math.random() * H,
          (40 + Math.random() * 180) * dpr,
          (2 + Math.random() * 5) * dpr,
        );
      }
    };

    const loop = (t) => {
      if (!running) return;
      rafId = requestAnimationFrame(loop);
      if (t - last < 28) return; // ~35 fps is plenty for a background
      last = t;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      mouse.reveal += ((mouse.active ? 1 : 0) - mouse.reveal) * 0.12;
      // hovering fast (a quick swipe) triggers a short glitch of its own
      mouse.energy *= 0.92;
      if (mouse.energy > 1.2 && t >= g.end && t - lastTrigger > 500) {
        g.end = t + 90 + Math.random() * 140;
        lastTrigger = t;
        mouse.energy = 0;
      }
      // a glitch burst every few seconds, lasting a fraction of a second
      if (t >= g.next && t >= g.end) {
        g.end = t + 120 + Math.random() * 280;
        g.next = g.end + 1800 + Math.random() * 3500;
      }
      const gi = t < g.end ? 0.4 + Math.random() * 0.6 : 0;
      if (t - lastD > 75) {
        lastD = t;
        ditherFrame(t, gi);
      }
      draw(t, gi);
      reveal();
      if (gi > 0) {
        tear(gi);
        canvas.style.opacity = String(0.75 + Math.random() * 0.25);
        if (hudRef.current)
          hudRef.current.style.transform = `translate(${(Math.random() - 0.5) * 10 * gi}px, ${(Math.random() - 0.5) * 4 * gi}px)`;
        wasGlitching = true;
      } else if (wasGlitching) {
        canvas.style.opacity = "1";
        if (hudRef.current) hudRef.current.style.transform = "";
        wasGlitching = false;
      }
    };
    const start = () => {
      if (running || reduce || pausedRef.current) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const onMove = (e) => {
      mouse.active = true;
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      mouse.energy += Math.hypot(e.movementX || 0, e.movementY || 0) / 400;
    };

    resize();
    let fontsCancelled = false;
    document.fonts?.ready.then(() => {
      if (!fontsCancelled) resize();
    });
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const onLeave = () => (mouse.active = false);
    if (interactive) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
    }
    ctrlRef.current = { start, stop };
    const io = new IntersectionObserver(([e]) =>
      e.isIntersecting ? start() : stop(),
    );
    io.observe(wrap);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      fontsCancelled = true;
      stop();
      ctrlRef.current = null;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) ctrlRef.current?.stop();
    else ctrlRef.current?.start();
  }, [paused]);

  const hudText = {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: "clamp(10px, 0.85vw, 14px)",
    letterSpacing: "0.06em",
    lineHeight: 1.7,
    color: "rgba(214,218,230,0.6)",
    textShadow: "1px 0 rgba(255,130,60,0.55), -1px 0 rgba(80,140,255,0.55)",
  };

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={ditherRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated", opacity: 0.9 }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* faint CRT scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {hud && (
        <div ref={hudRef} className="absolute inset-0">
          {/* top centre */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: "calc(4vh + 1.1vw)", ...hudText }}
          >
            {BG_TAGLINE}
          </div>
        </div>
      )}
    </div>
  );
}
