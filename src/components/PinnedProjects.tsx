import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { ProjectCard } from "./ProjectCard";
import { Pin, FolderGit2, ArrowRight } from "lucide-react";

export const PinnedProjects: React.FC = () => {
  const { projects, setActiveTab } = usePortfolio();

  // Display every project on the overview as requested, ordered with pinned projects first
  const displayProjects = [...projects].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-[#58a6ff]" />
          <h2 className="text-sm font-semibold text-[#f0f6fc]">
            All Repositories & Key Works ({displayProjects.length})
          </h2>
        </div>
        <button
          onClick={() => setActiveTab("projects")}
          className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>Projects Explorer ({projects.length})</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {displayProjects.length === 0 ? (
        <div className="border border-[#30363d] rounded-lg p-8 text-center bg-[#161b22] text-[#8b949e]">
          <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No repositories pinned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayProjects.map((project) => (
            <ProjectCard key={project.id} project={project} featured={true} />
          ))}
        </div>
      )}
    </section>
  );
};
