import { useState, useRef, useEffect } from "react";
import { personalInfo } from "../../data/portfolio.js";

/* ---- small brand-style icons ---- */
const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="currentColor" />
    <text
      x="12"
      y="17.2"
      textAnchor="middle"
      fontSize="13"
      fontWeight="800"
      fill="#1e1e20"
      fontFamily="Inter, sans-serif"
    >
      in
    </text>
  </svg>
);
const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
);
const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const lastSegment = (url) => {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return "";
  }
};

const field =
  "w-full rounded-lg bg-white/[0.06] px-3 py-2 text-[13px] text-white placeholder:text-gray-500 outline-none border border-white/10 focus:border-blue-500/60 focus:bg-white/[0.09] transition-colors select-text";

export default function ContactWindow() {
  const { email, socials } = personalInfo;
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Hello Prabhjot");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | copied | failed
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const networks = [
    {
      key: "github",
      label: "GitHub",
      Icon: GitHubIcon,
      handle: `@${lastSegment(socials.github)}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      Icon: LinkedInIcon,
      handle: `in/${lastSegment(socials.linkedin)}`,
    },
    {
      key: "twitter",
      label: "X",
      Icon: XIcon,
      handle: `@${lastSegment(socials.twitter)}`,
    },
    {
      key: "instagram",
      label: "Instagram",
      Icon: InstagramIcon,
      handle: `@${lastSegment(socials.instagram)}`,
    },
  ];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("failed"); // clipboard can be blocked (insecure context / permissions)
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const canSend = message.trim().length > 0;
  const send = () => {
    if (!canSend) return;
    const body = `${message.trim()}${name.trim() ? `\n\n— ${name.trim()}` : ""}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="p-5 space-y-4 text-[13px] text-gray-200 select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-bold text-white">
            Let&apos;s work together
          </h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-gray-400 max-w-[360px]">
            Internships, collaborations or just a chat. I usually reply within a
            day.
          </p>
        </div>
        <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10.5px] text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Open to internships,new project ideas
        </div>
      </div>

      {/* Compose */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[11px] text-gray-500">To</span>
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2">
            <span className="truncate font-mono text-[12.5px] text-blue-300 select-text">
              {email}
            </span>
            <button
              onClick={copyEmail}
              className="shrink-0 rounded-md bg-white/10 hover:bg-white/15 px-2.5 py-0.5 text-[11px] text-white transition-colors cursor-pointer"
            >
              {status === "copied"
                ? "✓ Copied"
                : status === "failed"
                  ? "Copy failed"
                  : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="c-name"
            className="w-14 shrink-0 text-[11px] text-gray-500"
          >
            From
          </label>
          <input
            id="c-name"
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            autoComplete="off"
          />
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="c-subject"
            className="w-14 shrink-0 text-[11px] text-gray-500"
          >
            Subject
          </label>
          <input
            id="c-subject"
            className={field}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            autoComplete="off"
          />
        </div>

        <textarea
          className={`${field} min-h-[110px] resize-none leading-relaxed`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message…"
          aria-label="Message"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-gray-500">

          </span>
          <button
            onClick={send}
            disabled={!canSend}
            className="rounded-lg bg-blue-600 enabled:hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 text-[12px] font-semibold text-white transition-colors cursor-pointer"
          >
            Send ↗
          </button>
        </div>
      </div>

      {/* Networks */}
      <div>
        <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Find me online
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {networks.map(({ key, label, Icon, handle }) => (
            <a
              key={key}
              href={socials[key]}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
            >
              <span className="text-gray-200 group-hover:text-white">
                <Icon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium text-white">
                  {label}
                </span>
                <span className="block truncate font-mono text-[10.5px] text-gray-500">
                  {handle}
                </span>
              </span>
              <span
                className="text-gray-500 group-hover:text-gray-300"
                aria-hidden="true"
              >
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
