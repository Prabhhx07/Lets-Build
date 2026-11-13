// Small SVG icon set: macOS-style app icons (rounded squares) and menu-bar glyphs.
import { useRef } from "react";

let uid = 0;

function Squircle({ from, to, children }) {
  const id = useRef(`ic${++uid}`).current; // stable per instance
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${id})`} />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="13.5"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
      />
      {children}
    </svg>
  );
}

export const FinderIcon = () => (
  <Squircle from="#6fd2ff" to="#1479ff">
    <path
      d="M32 6h14a12 12 0 0 1 12 12v28a12 12 0 0 1-12 12H32z"
      fill="#eaf4ff"
    />
    <path
      d="M32 6H18A12 12 0 0 0 6 18v28a12 12 0 0 0 12 12h14z"
      fill="#3aa1ff"
    />
    <path d="M32 6v52" stroke="#0b4fb8" strokeWidth="2" />
    <rect x="17" y="22" width="3.5" height="9" rx="1.7" fill="#0b2a5c" />
    <rect x="43.5" y="22" width="3.5" height="9" rx="1.7" fill="#0b2a5c" />
    <path
      d="M16 42c5 6 27 6 32 0"
      stroke="#0b2a5c"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </Squircle>
);

export const UserIcon = () => (
  <Squircle from="#a7a9b0" to="#5d5f66">
    <circle cx="32" cy="24" r="9" fill="#fff" />
    <path d="M14 52c0-11 8-17 18-17s18 6 18 17z" fill="#fff" />
  </Squircle>
);

export const TerminalIcon = () => (
  <Squircle from="#3a3a3d" to="#0c0c0d">
    <path
      d="M16 24l10 8-10 8"
      stroke="#fff"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M32 42h16" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
  </Squircle>
);

export const CodeIcon = () => (
  <Squircle from="#7d7cff" to="#3a35c9">
    <path
      d="M24 20L12 32l12 12M40 20l12 12-12 12"
      stroke="#fff"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Squircle>
);

export const MailIcon = () => (
  <Squircle from="#5ec8ff" to="#1673ff">
    <rect x="11" y="18" width="42" height="28" rx="5" fill="#fff" />
    <path
      d="M12 21l20 15 20-15"
      stroke="#1673ff"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
  </Squircle>
);

export const MusicIcon = ({ playing = false }) => (
  <Squircle from="#ff6f8e" to="#f0254f">
    {playing ? (
      <>
        <rect x="21" y="18" width="7" height="28" rx="2" fill="#fff" />
        <rect x="36" y="18" width="7" height="28" rx="2" fill="#fff" />
      </>
    ) : (
      <path
        d="M26 20v22.5a6 6 0 1 1-4-5.6V16l22-5v26.5a6 6 0 1 1-4-5.6V17z"
        fill="#fff"
      />
    )}
  </Squircle>
);

export const GitIcon = () => (
  <Squircle from="#3b3f46" to="#16181c">
    <circle cx="22" cy="18" r="5" fill="none" stroke="#fff" strokeWidth="3.5" />
    <circle cx="22" cy="46" r="5" fill="none" stroke="#fff" strokeWidth="3.5" />
    <circle cx="44" cy="30" r="5" fill="none" stroke="#fff" strokeWidth="3.5" />
    <path
      d="M22 23v18M44 35c0 8-10 7-20 6"
      stroke="#fff"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
  </Squircle>
);

export const DocIcon = () => (
  <Squircle from="#fafafc" to="#c9c9d0">
    <path
      d="M18 10h20l10 10v34H18z"
      fill="#fff"
      stroke="#b5b5bd"
      strokeWidth="1.5"
    />
    <path d="M38 10v10h10" fill="#e6e6ec" stroke="#b5b5bd" strokeWidth="1.5" />
    <path
      d="M24 30h18M24 37h18M24 44h12"
      stroke="#4a8dff"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Squircle>
);

// Desktop folder (not a squircle)
export const FolderIcon = () => (
  <svg viewBox="0 0 80 64" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id="fold-b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4fb3ff" />
        <stop offset="1" stopColor="#1a7be6" />
      </linearGradient>
      <linearGradient id="fold-t" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fd0ff" />
        <stop offset="1" stopColor="#4aa8ff" />
      </linearGradient>
    </defs>
    <path
      d="M6 12a6 6 0 0 1 6-6h18l8 8h30a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z"
      fill="url(#fold-b)"
    />
    <path
      d="M6 24a6 6 0 0 1 6-6h56a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z"
      fill="url(#fold-t)"
    />
  </svg>
);

export const PdfIcon = () => (
  <svg viewBox="0 0 64 80" className="w-full h-full" aria-hidden="true">
    <path
      d="M8 4h34l16 16v52a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"
      fill="#fff"
      stroke="#c7c7cd"
    />
    <path d="M42 4v16h16" fill="#e7e7ec" stroke="#c7c7cd" />
    <rect x="4" y="40" width="40" height="18" rx="3" fill="#ff453a" />
    <text
      x="24"
      y="53.5"
      textAnchor="middle"
      fontSize="11"
      fontWeight="700"
      fill="#fff"
      fontFamily="Inter, sans-serif"
    >
      PDF
    </text>
  </svg>
);

/* ---- menu bar glyphs ---- */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const WifiIcon = () => (
  <svg viewBox="0 0 20 16" className="h-[13px]" aria-hidden="true">
    <path
      d="M2 6.2a11 11 0 0 1 16 0M5 9.3a6.7 6.7 0 0 1 10 0M8 12.3a2.5 2.5 0 0 1 4 0"
      {...stroke}
    />
    <circle cx="10" cy="14.2" r="1" fill="currentColor" />
  </svg>
);

export const BatteryIcon = () => (
  <svg viewBox="0 0 28 14" className="h-[12px]" aria-hidden="true">
    <rect
      x="1"
      y="1.5"
      width="22"
      height="11"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.55"
    />
    <rect x="3" y="3.5" width="18" height="7" rx="1.5" fill="currentColor" />
    <path
      d="M25 5v4"
      stroke="currentColor"
      strokeOpacity="0.55"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const SearchIcon = () => (
  <svg viewBox="0 0 16 16" className="h-[12px]" aria-hidden="true">
    <circle cx="6.8" cy="6.8" r="4.6" {...stroke} />
    <path d="M10.4 10.4L14 14" {...stroke} />
  </svg>
);

export const ControlIcon = () => (
  <svg viewBox="0 0 18 14" className="h-[12px]" aria-hidden="true">
    <rect
      x="1"
      y="1"
      width="16"
      height="4.5"
      rx="2.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="5" cy="3.25" r="1.5" fill="currentColor" />
    <rect
      x="1"
      y="8.5"
      width="16"
      height="4.5"
      rx="2.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="13" cy="10.75" r="1.5" fill="currentColor" />
  </svg>
);
