import { useState, useMemo } from "react";
import { projects } from "../../data/portfolio.js";
import GuardedScroll from "../MacBook/GuardedScroll.jsx";

const CATEGORY = {
  "AI & RAG": {
    dot: "bg-indigo-400",
    tile: "linear-gradient(135deg, #6d5efc, #3a8bff)",
  },
  "Full-Stack SaaS": {
    dot: "bg-blue-400",
    tile: "linear-gradient(135deg, #2f7bff, #22c1c3)",
  },
  MLOps: {
    dot: "bg-emerald-400",
    tile: "linear-gradient(135deg, #1fbf75, #0f8f8f)",
  },
};
const FALLBACK = {
  dot: "bg-gray-400",
  tile: "linear-gradient(135deg, #5b5e66, #35373c)",
};

export default function ProjectsWindow() {
  // filter: 'all' | 'featured' | a category name
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category).filter(Boolean))],
    [],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter === "featured" && !p.featured) return false;
      if (filter !== "all" && filter !== "featured" && p.category !== filter)
        return false;
      if (!q) return true;
      return [p.title, p.description, p.category, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [filter, query]);

  const open = (url) =>
    url && window.open(url, "_blank", "noopener,noreferrer");

  const side = (key) =>
    `w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors cursor-pointer ${
      filter === key
        ? "bg-blue-600/80 text-white font-medium"
        : "text-gray-300 hover:bg-white/[0.06]"
    }`;

  const heading =
    filter === "all"
      ? "All projects"
      : filter === "featured"
        ? "Featured"
        : filter;

  return (
    <div className="flex h-full min-h-0 text-[13px] text-gray-200 select-none bg-[#1e1e20]">
      {/* Sidebar */}
      <div className="w-[170px] shrink-0 bg-[#18181a] border-r border-black/50 p-3 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Favorites
        </div>
        <div className="space-y-0.5">
          <button onClick={() => setFilter("all")} className={side("all")}>
            <span aria-hidden="true">📁</span>
            <span>All projects</span>
            <span className="ml-auto text-[11px] opacity-70">
              {projects.length}
            </span>
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={side("featured")}
          >
            <span aria-hidden="true">⭐</span>
            <span>Featured</span>
            <span className="ml-auto text-[11px] opacity-70">
              {projects.filter((p) => p.featured).length}
            </span>
          </button>
        </div>

        <div className="px-2 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Tags
        </div>
        <div className="space-y-0.5">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={side(c)}>
              <span
                className={`w-2 h-2 shrink-0 rounded-full ${(CATEGORY[c] ?? FALLBACK).dot}`}
              />
              <span className="truncate">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="h-11 shrink-0 px-4 flex items-center justify-between gap-3 border-b border-black/40 bg-white/[0.02]">
          <div className="flex items-center gap-2 min-w-0 text-[12px]">
            <span className="text-gray-500">Finder</span>
            <span className="text-gray-600">›</span>
            <span className="font-semibold text-white truncate">{heading}</span>
            <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] text-gray-300">
              {visible.length}
            </span>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search projects"
            spellCheck={false}
            className="h-7 w-44 rounded-md bg-white/10 px-2.5 text-[12px] text-white placeholder:text-gray-500 outline-none focus:bg-white/15 focus:ring-1 focus:ring-blue-500/60"
          />
        </div>

        <GuardedScroll className="flex-1 min-h-0 p-4">
          {visible.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[12.5px] text-gray-500">
              No projects match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {visible.map((p) => {
                const cat = CATEGORY[p.category] ?? FALLBACK;
                return (
                  <div
                    key={p.title}
                    data-cursor="hover"
                    className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-[22px] shadow-md"
                        style={{ background: cat.tile }}
                        aria-hidden="true"
                      >
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[13.5px] font-semibold text-white leading-snug">
                          {p.title}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10.5px]">
                          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-gray-300">
                            {p.category}
                          </span>
                          {p.featured && (
                            <span className="text-amber-300">★ Featured</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-[12px] leading-relaxed text-gray-400 line-clamp-4">
                      {p.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-gray-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-2">
                      {p.liveUrl && (
                        <button
                          onClick={() => open(p.liveUrl)}
                          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-[11.5px] font-semibold text-white transition-colors cursor-pointer"
                        >
                          Live demo ↗
                        </button>
                      )}
                      {p.repoUrl && (
                        <button
                          onClick={() => open(p.repoUrl)}
                          className="rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/10 px-3.5 py-1.5 text-[11.5px] font-medium text-gray-200 transition-colors cursor-pointer"
                        >
                          Code ↗
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GuardedScroll>
      </div>
    </div>
  );
}
