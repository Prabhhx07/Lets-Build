import { useState, useEffect, useRef, useContext } from "react";
import { ScreenScale } from "./ScreenScale.js";
import Window from "./Window.jsx";
import AboutWindow from "../windows/AboutWindow.jsx";
import ProjectsWindow from "../windows/ProjectsWindow.jsx";
import SkillsWindow from "../windows/SkillsWindow.jsx";
import ContactWindow from "../windows/ContactWindow.jsx";
import TerminalWindow from "../windows/TerminalWindow.jsx";
import PcbBackground from "../effects/PcbBackground.jsx";
import { personalInfo } from "../../data/portfolio.js";
import {
  FinderIcon,
  UserIcon,
  TerminalIcon,
  CodeIcon,
  MailIcon,
  MusicIcon,
  GitIcon,
  DocIcon,
  FolderIcon,
  PdfIcon,
  WifiIcon,
  BatteryIcon,
  SearchIcon,
  ControlIcon,
} from "./icons.jsx";

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, system-ui, sans-serif';

const APP_NAMES = {
  finder: "Finder",
  projects: "Finder",
  about: "About Me",
  terminal: "Terminal",
  skills: "Developer Tools",
  contact: "Mail",
};

const LAYOUT = {
  projects: { x: 60, y: 24, width: 820, height: 560 },
  about: { x: 110, y: 30, width: 700, height: 600 },
  terminal: { x: 160, y: 70, width: 700, height: 440 },
  skills: { x: 200, y: 52, width: 580, height: 480 },
  contact: { x: 240, y: 36, width: 620, height: 600 },
};

const WINDOW_MENU = [
  ["projects", "Projects"],
  ["about", "About"],
  ["skills", "Skills"],
  ["terminal", "Terminal"],
  ["contact", "Contact"],
];

// Isolated so the clock tick doesn't re-render the whole desktop
function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="whitespace-nowrap">
      {now.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
      {"\u2002"}
      {now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}
    </span>
  );
}

export default function MacScreen({ isMacOpen = false, compact = false }) {
  const scale = useContext(ScreenScale);
  const layout = (id) => {
    const l = LAYOUT[id];
    return {
      defaultPosition: compact ? { x: 8, y: 8 } : { x: l.x, y: l.y },
      width: l.width,
      height: l.height,
    };
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const dockRefs = useRef({});
  const [menu, setMenu] = useState(null); // 'window' | null

  const [openWindows, setOpenWindows] = useState({
    about: false,
    projects: true,
    terminal: false,
    skills: false,
    contact: false,
  });
  const [minimized, setMinimized] = useState({});
  const zRef = useRef(30);
  const [windowZ, setWindowZ] = useState({
    about: 10,
    projects: 20,
    terminal: 15,
    skills: 5,
    contact: 5,
  });
  const [activeApp, setActiveApp] = useState("projects");

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Audio playback was blocked:", err);
    }
  };

  const bringToFront = (id) => {
    const z = ++zRef.current;
    setActiveApp(id);
    setWindowZ((prev) => ({ ...prev, [id]: z }));
  };

  const openWindow = (id) => {
    bringToFront(id);
    setMinimized((m) => (m[id] ? { ...m, [id]: false } : m));
    setOpenWindows((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const closeWindow = (id) => {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
    setMinimized((m) => ({ ...m, [id]: false }));
    setActiveApp((a) => (a === id ? "finder" : a));
  };

  const minimizeWindow = (id) => {
    setMinimized((m) => ({ ...m, [id]: true }));
    setActiveApp((a) => (a === id ? "finder" : a));
  };

  // closed -> open, minimized -> restore, open -> close
  const toggleWindow = (id) => {
    if (openWindows[id] && !minimized[id]) closeWindow(id);
    else openWindow(id);
  };

  const dockItems = [
    {
      id: "projects",
      icon: <FinderIcon />,
      label: "Projects",
      action: () => toggleWindow("projects"),
    },
    {
      id: "about",
      icon: <UserIcon />,
      label: "About me",
      action: () => toggleWindow("about"),
    },
    {
      id: "terminal",
      icon: <TerminalIcon />,
      label: "Terminal",
      action: () => toggleWindow("terminal"),
    },
    {
      id: "skills",
      icon: <CodeIcon />,
      label: "Tech stack",
      action: () => toggleWindow("skills"),
    },
    {
      id: "contact",
      icon: <MailIcon />,
      label: "Get in touch",
      action: () => toggleWindow("contact"),
    },
    { id: "divider", type: "separator" },
    {
      id: "music",
      icon: <MusicIcon playing={isPlaying} />,
      label: isPlaying ? "Pause music" : "Play lo-fi track",
      action: toggleAudio,
    },
    {
      id: "github",
      icon: <GitIcon />,
      label: "GitHub profile",
      action: () =>
        window.open(
          personalInfo.socials.github,
          "_blank",
          "noopener,noreferrer",
        ),
    },
    {
      id: "resume",
      icon: <DocIcon />,
      label: "Download resume",
      action: () =>
        window.open(personalInfo.resumeUrl, "_blank", "noopener,noreferrer"),
    },
  ];

  // Continuous dock magnification (no re-render)
  const handleDockMove = (e) => {
    const x = e.clientX;
    Object.values(dockRefs.current).forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(x - (r.left + r.width / 2)) / scale;
      const s = 1 + 0.5 * Math.exp(-(d * d) / (2 * 44 * 44));
      el.style.transform = `translateY(${-(s - 1) * 26}px) scale(${s})`;
    });
  };
  const resetDock = () =>
    Object.values(dockRefs.current).forEach(
      (el) => el && (el.style.transform = ""),
    );

  const windowProps = (id) => ({
    id,
    isOpen: openWindows[id],
    isMinimized: !!minimized[id],
    isFocused: activeApp === id,
    zIndex: windowZ[id],
    onClose: () => closeWindow(id),
    onMinimize: () => minimizeWindow(id),
    onFocus: () => bringToFront(id),
  });

  const menuBtn =
    "px-2.5 h-[22px] rounded-[5px] hover:bg-white/15 transition-colors cursor-default";

  return (
    <div
      className={`mac-screen ${isMacOpen ? "active" : ""} flex flex-col h-full select-none relative overflow-hidden`}
      style={{ fontFamily: FONT, background: "#000" }}
    >
      <audio
        ref={audioRef}
        src="/music/flashing lights.mp3"
        loop
        preload="none"
      />
      {/* The PCB scene doubles as the desktop wallpaper (no HUD / text / mouse effects, paused until the screen is on) */}
      <PcbBackground
        hud={false}
        text={false}
        interactive={false}
        glitch={false}
        paused={!isMacOpen}
        className="opacity-70"
      />

      {/* ---------- Menu bar ---------- */}
      <div
        className="relative h-7 shrink-0 px-2 flex items-center justify-between text-[13px] text-white z-[60]"
        style={{
          background: "rgba(24,24,28,0.5)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        onMouseLeave={() => setMenu(null)}
      >
        <div className="flex items-center min-w-0">
          <span className={`${menuBtn} flex items-center`} aria-hidden="true">
            <span className="w-[15px] h-[15px] rounded-[4px] bg-white text-black text-[10px] font-extrabold flex items-center justify-center">
              P
            </span>
          </span>
          <span className="px-2.5 font-bold">
            {APP_NAMES[activeApp] ?? "Finder"}
          </span>
          {["File", "Edit", "View", "Go"].map((m) => (
            <span
              key={m}
              className={`${menuBtn} hidden sm:inline-flex items-center`}
            >
              {m}
            </span>
          ))}

          <div className="relative">
            <button
              className={`${menuBtn} ${menu === "window" ? "bg-white/20" : ""}`}
              onClick={() => setMenu(menu === "window" ? null : "window")}
            >
              Window
            </button>
            {menu === "window" && (
              <div
                className="absolute left-0 top-[26px] w-[200px] p-1 rounded-lg"
                style={{
                  background: "rgba(44,44,48,0.92)",
                  backdropFilter: "blur(24px)",
                  boxShadow:
                    "0 12px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.18)",
                }}
              >
                {WINDOW_MENU.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      openWindow(id);
                      setMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-[3px] rounded-[5px] text-left hover:bg-[#0a84ff] cursor-default"
                  >
                    <span>{label}</span>
                    <span className="text-[11px] opacity-60">
                      {openWindows[id] ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className={`${menuBtn} hidden sm:inline-flex items-center`}>
            Help
          </span>
        </div>

        <div className="flex items-center gap-3 pr-1.5 shrink-0">
          <button
            onClick={toggleAudio}
            className="flex items-center gap-1 hover:bg-white/15 rounded-[5px] px-1.5 h-[22px] cursor-default"
            aria-pressed={isPlaying}
            title={isPlaying ? "Pause music" : "Play lo-fi music"}
          >
            <span className="text-[12px]">{isPlaying ? "♫ Playing" : "♫"}</span>
          </button>
          <span className="hidden sm:flex items-center gap-1.5">
            <BatteryIcon />
          </span>
          <span className="hidden sm:inline-flex">
            <WifiIcon />
          </span>
          <span className="hidden sm:inline-flex">
            <SearchIcon />
          </span>
          <span className="hidden sm:inline-flex">
            <ControlIcon />
          </span>
          <Clock />
        </div>
      </div>

      {/* ---------- Desktop ---------- */}
      <div className="relative flex-1 overflow-hidden">
        {/* Desktop icons (right side, like real macOS) */}
        <div className="absolute top-3 right-4 flex flex-col items-center gap-5 z-0">
          <button
            onClick={() => openWindow("projects")}
            className="flex flex-col items-center gap-1 w-[92px] p-1.5 rounded-md cursor-default hover:bg-white/10"
          >
            <span className="w-[58px] h-[48px]">
              <FolderIcon />
            </span>
            <span
              className="text-[12px] text-white font-medium text-center leading-tight"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              Projects
            </span>
          </button>
          <a
            href={personalInfo.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 w-[92px] p-1.5 rounded-md cursor-default hover:bg-white/10"
          >
            <span className="w-[42px] h-[52px]">
              <PdfIcon />
            </span>
            <span
              className="text-[12px] text-white font-medium text-center leading-tight"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              Resume.pdf
            </span>
          </a>
        </div>

        <Window
          {...windowProps("projects")}
          title="Projects"
          {...layout("projects")}
        >
          <ProjectsWindow />
        </Window>
        <Window {...windowProps("about")} title="About Me" {...layout("about")}>
          <AboutWindow onOpenWindow={openWindow} />
        </Window>
        <Window
          {...windowProps("terminal")}
          title="zsh — 80×24"
          {...layout("terminal")}
        >
          <TerminalWindow onOpenWindow={openWindow} />
        </Window>
        <Window
          {...windowProps("skills")}
          title="Developer Tools & Stack"
          {...layout("skills")}
        >
          <SkillsWindow />
        </Window>
        <Window
          {...windowProps("contact")}
          title="New Message — Get in touch"
          {...layout("contact")}
        >
          <ContactWindow />
        </Window>

        {/* ---------- Dock ---------- */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-2 px-2.5 pt-2 pb-2 rounded-[24px] z-50"
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(28px) saturate(1.6)",
            WebkitBackdropFilter: "blur(28px) saturate(1.6)",
            boxShadow:
              "0 0 0 0.5px rgba(255,255,255,0.28), inset 0 1px 0 rgba(255,255,255,0.22), 0 18px 40px rgba(0,0,0,0.35)",
          }}
          onMouseMove={handleDockMove}
          onMouseLeave={resetDock}
        >
          {dockItems.map((item, index) => {
            if (item.type === "separator") {
              return (
                <div
                  key={index}
                  className="w-px h-[46px] bg-white/25 mx-0.5 self-center"
                />
              );
            }
            return (
              <div
                key={item.id}
                className="relative group flex flex-col items-center"
              >
                <div
                  className="absolute bottom-full mb-[68px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-3 py-1 rounded-md text-[12px] text-white whitespace-nowrap"
                  style={{
                    background: "rgba(40,40,44,0.92)",
                    boxShadow:
                      "0 4px 14px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.2)",
                  }}
                >
                  {item.label}
                </div>

                <button
                  ref={(el) => (dockRefs.current[item.id] = el)}
                  onClick={item.action}
                  className="w-[54px] h-[54px] cursor-default transition-transform duration-100 ease-out active:brightness-75"
                  style={{
                    transformOrigin: "bottom center",
                    filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
                  }}
                  aria-label={item.label}
                >
                  {item.icon}
                </button>

                <span
                  className={`w-1 h-1 rounded-full mt-1 bg-white/90 ${openWindows[item.id] ? "opacity-100" : "opacity-0"}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
