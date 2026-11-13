import { skills } from "../../data/portfolio.js";

const CATEGORY_ICONS = {
  Frontend: "",
  Backend: "",
  "AI / ML": "",
  Tools: "",
};

export default function SkillsWindow() {
  return (
    <div className="p-4 space-y-4 text-xs font-sans text-gray-200 select-none bg-[#141416]/95">
      <div className="text-[11px] text-gray-400 leading-relaxed border-b border-white/5 pb-2">
        Core technical stack across full-stack web applications, distributed
        APIs, and scalable tooling.
      </div>

      <div className="space-y-3.5">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-[11.5px] flex items-center gap-1.5">
                <span aria-hidden="true">
                  {CATEGORY_ICONS[category] ?? "🔹"}
                </span>
                <span>{category}</span>
              </span>
              <span className="text-[9.5px] font-mono text-gray-400">
                {items.length} technologies
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {items.map((skill) => (
                <div
                  key={skill}
                  className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-blue-600/20 hover:border-blue-500/40 border border-white/5 text-gray-300 hover:text-white transition-colors text-[11px] font-mono cursor-default shadow-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/20 text-[10.5px] text-blue-300">
        <div className="font-semibold mb-0.5 flex items-center gap-1">
          <span aria-hidden="true">💡</span>
          <span>Engineering mindset</span>
        </div>
        <div>
          Focusing on typed contracts, sub-second API latencies, semantic vector
          search, and predictable UI states.
        </div>
      </div>
    </div>
  );
}
