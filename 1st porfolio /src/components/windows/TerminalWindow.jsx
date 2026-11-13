import { useState, useRef, useEffect } from "react";
import { personalInfo, projects, skills } from "../../data/portfolio.js";
import GuardedScroll from "../MacBook/GuardedScroll.jsx";

const HELP = `Available commands:
  about       Display bio and background
  projects    List featured applications
  skills      Show technical skills & tools
  contact     Display contact information
  resume      Open resume PDF
  ls          List files
  cat <file>  Read a file (try: cat about.txt)
  neofetch    System info
  whoami      Print current user persona
  sudo hire   Request interview / collaboration
  clear       Clear terminal history
Tip: use ↑ / ↓ to browse previous commands.`;

const FILES = {
  "about.txt": () => personalInfo.bio,
  "status.txt": () => personalInfo.status,
  "contact.txt": () =>
    `Email: ${personalInfo.email}\nGitHub: ${personalInfo.socials.github}`,
};

export default function TerminalWindow({ onOpenWindow }) {
  const [history, setHistory] = useState(() => [
    {
      type: "system",
      text: `Last login: ${new Date().toLocaleString()} on ttys001`,
    },
    {
      type: "system",
      text: "Welcome to Prabh's space. Type 'help' to see available commands.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const past = useRef([]);
  const cursor = useRef(-1);

  // Scroll only the terminal output, never the page (scrollIntoView would move every ancestor)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    const out = [{ type: "user", text: `$ ${raw}` }];
    const say = (text, type = "output") => out.push({ type, text });

    if (cmd === "clear") {
      setHistory([]);
      return;
    }

    if (cmd.startsWith("cat ")) {
      const name = cmd.slice(4).trim();
      const file = FILES[name];
      if (file) say(file());
      else say(`cat: ${name}: No such file or directory`, "error");
    } else {
      switch (cmd) {
        case "":
          break;
        case "help":
          say(HELP);
          break;
        case "about":
          say(
            `${personalInfo.name} (${personalInfo.handle})\n${personalInfo.subtitle}\n${personalInfo.bio}`,
          );
          onOpenWindow?.("about");
          break;
        case "projects":
          say(
            projects
              .map(
                (p, i) =>
                  `[${i + 1}] ${p.title}\n    ${p.description}\n    Tags: ${p.tags.join(", ")}\n    Link: ${p.liveUrl || p.repoUrl}`,
              )
              .join("\n\n"),
          );
          onOpenWindow?.("projects");
          break;
        case "skills":
          say(
            Object.entries(skills)
              .map(([cat, list]) => `${cat.toUpperCase()}: ${list.join(", ")}`)
              .join("\n"),
          );
          onOpenWindow?.("skills");
          break;
        case "contact":
          say(
            `Email: ${personalInfo.email}\nGitHub: ${personalInfo.socials.github}\nLinkedIn: ${personalInfo.socials.linkedin}\nTwitter: ${personalInfo.socials.twitter}`,
          );
          onOpenWindow?.("contact");
          break;
        case "ls":
          say(Object.keys(FILES).join("    "));
          break;
        case "neofetch":
          say(
            `${personalInfo.handle}@macbook-pro\n---------------------\nOS:        portfolioOS 1.0\nHost:      Chandigarh, IN\nShell:     zsh\nStack:     React · FastAPI · PostgreSQL\nStatus:    ${personalInfo.status}`,
          );
          break;
        case "whoami":
          say("guest — developer passionate about clean code & UX");
          break;
        case "resume":
          window.open(personalInfo.resumeUrl, "_blank", "noopener,noreferrer");
          say("Opening resume in a new tab...");
          break;
        case "sudo hire":
          say(
            "Permission granted. Prabhjot is open to internships and full-time engineering roles. Opening contact window...",
          );
          onOpenWindow?.("contact");
          break;
        default:
          say(
            `zsh: command not found: ${raw}. Type 'help' for available commands.`,
            "error",
          );
      }
    }

    setHistory((h) => [...h, ...out]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      if (inputVal.trim()) {
        past.current.push(inputVal);
      }
      cursor.current = -1;
      run(inputVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!past.current.length) return;
      cursor.current =
        cursor.current === -1
          ? past.current.length - 1
          : Math.max(0, cursor.current - 1);
      setInputVal(past.current[cursor.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor.current === -1) return;
      cursor.current += 1;
      if (cursor.current >= past.current.length) {
        cursor.current = -1;
        setInputVal("");
      } else {
        setInputVal(past.current[cursor.current]);
      }
    }
  };

  return (
    <div
      className="font-mono text-[11px] leading-relaxed p-2 h-full flex flex-col select-text bg-[#0e0e11] text-emerald-400"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <GuardedScroll
        innerRef={scrollRef}
        className="flex-1 min-h-0 space-y-2 pr-1"
      >
        {history.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "user"
                ? "text-white font-semibold"
                : line.type === "error"
                  ? "text-rose-400 whitespace-pre-wrap"
                  : line.type === "system"
                    ? "text-gray-400 text-[10px]"
                    : "text-emerald-300/90 whitespace-pre-wrap"
            }
          >
            {line.text}
          </div>
        ))}
      </GuardedScroll>

      <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2 shrink-0">
        <span className="text-sky-400 font-bold select-none">prabh@007 %</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal input"
          className="flex-1 bg-transparent text-white outline-none border-none font-mono text-[11px]"
          placeholder="type 'help'..."
        />
      </div>
    </div>
  );
}
