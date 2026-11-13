import {
  personalInfo,
  aboutSummary,
  strengths,
  lookingFor,
  interests,
  quickFacts,
} from "../../data/portfolio.js";

const card = "rounded-xl border border-white/10 bg-white/[0.03]";
const label =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500";

export default function AboutWindow({ onOpenWindow }) {
  return (
    <div className="p-5 space-y-4 text-[13px] text-gray-200 select-none">
      {/* Header */}
      <div className={`${card} p-4 flex items-center gap-4`}>
        <div className="relative shrink-0">
          <img
            src={personalInfo.avatar}
            alt={personalInfo.name}
            loading="lazy"
            decoding="async"
            className="w-[68px] h-[68px] rounded-full object-cover ring-2 ring-blue-500/70"
          />
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#1e1e20]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[17px] font-bold text-white truncate">
              {personalInfo.name}
            </h3>
            <span className="text-[11px] text-blue-400 font-mono">
              {personalInfo.handle}
            </span>
          </div>
          <p className="text-[12px] text-gray-300 mt-0.5">
            {personalInfo.subtitle}
          </p>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {personalInfo.status}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onOpenWindow?.("contact")}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-[11.5px] font-semibold text-white transition-colors cursor-pointer"
          >
            Let&apos;s talk
          </button>
          <a
            href={personalInfo.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white/10 hover:bg-white/15 px-3.5 py-1.5 text-center text-[11.5px] font-medium text-white transition-colors"
          >
            Resume ↗
          </a>
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-3 gap-2.5">
        {quickFacts.map((f) => (
          <div key={f.label} className={`${card} px-3 py-2.5`}>
            <div className={label}>{f.label}</div>
            <div className="mt-1 text-[12.5px] font-semibold text-white leading-snug">
              {f.value}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={`${card} p-4`}>
        <div className={label}>Summary</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-300">
          {aboutSummary}
        </p>
      </div>

      {/* What I bring */}
      <div>
        <div className={`${label} mb-2 px-1`}>What I bring</div>
        <div className="grid grid-cols-2 gap-2.5">
          {strengths.map((s, i) => (
            <div key={s.title} className={`${card} p-3.5`}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-blue-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="text-[12.5px] font-semibold text-white">
                  {s.title}
                </h4>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-gray-400">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Looking for */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.07] p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">
          What I&apos;m looking for
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-200">
          {lookingFor}
        </p>
      </div>

      {/* Outside the screen */}
      <div>
        <div className={`${label} mb-2 px-1`}>Outside the screen</div>
        <div className="flex flex-wrap gap-2">
          {interests.map((it) => (
            <span
              key={it.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-gray-200"
            >
              <span aria-hidden="true">{it.icon}</span>
              {it.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
