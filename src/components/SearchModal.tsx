import React, { useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { Search, X, FolderGit2, Cpu, ExternalLink, ArrowRight, BookOpen } from "lucide-react";

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    projects,
    skills,
    setSelectedProject,
    setActiveTab,
  } = usePortfolio();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredProjects = cleanQuery
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.displayName.toLowerCase().includes(cleanQuery) ||
          p.description.toLowerCase().includes(cleanQuery) ||
          p.technologies.some((t) => t.toLowerCase().includes(cleanQuery))
      )
    : projects.slice(0, 4);

  const filteredSkills = cleanQuery
    ? skills.filter(
        (s) =>
          s.name.toLowerCase().includes(cleanQuery) ||
          s.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 border-b border-[#30363d] bg-[#0d1117]">
          <Search className="w-5 h-5 text-[#8b949e] shrink-0" />
          <input
            type="text"
            placeholder="Search projects, technologies (React, Django, Python, Supabase)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full px-3 py-4 bg-transparent text-[#f0f6fc] placeholder-[#8b949e] text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-[#8b949e] hover:text-[#f0f6fc]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Projects Results */}
          <div>
            <div className="text-[11px] font-semibold text-[#8b949e] uppercase px-3 py-1 flex items-center justify-between">
              <span>Repositories & Projects ({filteredProjects.length})</span>
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>

            {filteredProjects.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8b949e]">
                No repositories match "{query}".
              </div>
            ) : (
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#21262d] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.primaryLanguageColor || "#3178c6" }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#58a6ff] group-hover:underline">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[#8b949e] line-clamp-1">
                          {p.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0d1117] text-[#8b949e] font-mono border border-[#30363d]">
                        {p.primaryLanguage}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Matches */}
          {filteredSkills.length > 0 && (
            <div className="border-t border-[#30363d] pt-3">
              <div className="text-[11px] font-semibold text-[#8b949e] uppercase px-3 py-1 flex items-center justify-between">
                <span>Matching Skills ({filteredSkills.length})</span>
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-wrap gap-1.5 p-2">
                {filteredSkills.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveTab("skills");
                      setIsSearchOpen(false);
                    }}
                    className="px-2.5 py-1 text-xs rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-[#8b949e]">({s.category})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation jumps */}
          <div className="border-t border-[#30363d] pt-2 px-2 flex items-center justify-between text-[11px] text-[#8b949e]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab("overview");
                  setIsSearchOpen(false);
                }}
                className="hover:text-[#58a6ff]"
              >
                Overview
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setActiveTab("projects");
                  setIsSearchOpen(false);
                }}
                className="hover:text-[#58a6ff]"
              >
                All Projects
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setActiveTab("skills");
                  setIsSearchOpen(false);
                }}
                className="hover:text-[#58a6ff]"
              >
                Skills
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setActiveTab("contact");
                  setIsSearchOpen(false);
                }}
                className="hover:text-[#58a6ff]"
              >
                Contact
              </button>
            </div>
            <span>Press Esc to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
