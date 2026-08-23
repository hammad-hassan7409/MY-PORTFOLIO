import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { ProjectCard } from "./ProjectCard";
import { Pin, FolderGit2, ArrowRight } from "lucide-react";

export const PinnedProjects: React.FC = () => {
  const { projects, setActiveTab } = usePortfolio();

  const pinned = projects.filter((p) => p.isPinned);
  const displayProjects = pinned.length > 0 ? pinned : projects.slice(0, 6);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          <h2 className="text-sm font-semibold text-[#f0f6fc]">
            Pinned Repositories & Key Works
          </h2>
        </div>
        <button
          onClick={() => setActiveTab("projects")}
          className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>View all ({projects.length})</span>
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
