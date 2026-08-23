import React, { useState, useMemo } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { ProjectCard } from "../ProjectCard";
import {
  Search,
  Filter,
  Plus,
  FolderGit2,
  SlidersHorizontal,
  Star,
  Clock,
  Sparkles,
} from "lucide-react";

export const ProjectsTab: React.FC = () => {
  const { projects, isAdmin, setActiveTab } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"stars" | "newest" | "order" | "name">("order");

  // Extract all unique technologies from projects
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((p) => {
      p.technologies.forEach((t) => techSet.add(t));
      if (p.primaryLanguage) techSet.add(p.primaryLanguage);
    });
    return ["All", ...Array.from(techSet).sort()];
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = project.name.toLowerCase().includes(q);
          const matchesTitle = project.displayName.toLowerCase().includes(q);
          const matchesDesc = project.description.toLowerCase().includes(q);
          const matchesTech = project.technologies.some((t) => t.toLowerCase().includes(q));
          if (!matchesName && !matchesTitle && !matchesDesc && !matchesTech) return false;
        }

        // Tech filter
        if (selectedTech !== "All") {
          const hasTech =
            project.technologies.includes(selectedTech) ||
            project.primaryLanguage.toLowerCase() === selectedTech.toLowerCase();
          if (!hasTech) return false;
        }

        // Status filter
        if (selectedStatus !== "All") {
          if (project.status !== selectedStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return (a.order || 0) - (b.order || 0);
      });
  }, [projects, searchQuery, selectedTech, selectedStatus, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar: Search, Tech Filters, Sort */}
      <div className="space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find a repository or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#161b22] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors"
            />
          </div>

          {/* Controls: Type filter, Sort Dropdown & Admin New Repo */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Live">Live Projects</option>
              <option value="In Progress">In Progress</option>
              <option value="Beta">Beta</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff] cursor-pointer"
            >
              <option value="order">Featured Order</option>
              <option value="stars">Most Stars</option>
              <option value="newest">Latest Release</option>
              <option value="name">Repository Name</option>
            </select>

            {/* Admin Add Project Button */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors whitespace-nowrap shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Tech Stack Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-[#8b949e] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Tech:</span>
          </span>
          {allTechnologies.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedTech === tech
                  ? "bg-[#1f6feb] text-white font-semibold"
                  : "bg-[#161b22] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] hover:border-[#8b949e]"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Count Header */}
      <div className="flex items-center justify-between text-xs text-[#8b949e] border-b border-[#30363d] pb-2">
        <div>
          Showing <strong className="text-[#f0f6fc]">{filteredProjects.length}</strong> of{" "}
          <strong className="text-[#f0f6fc]">{projects.length}</strong> repositories
          {selectedTech !== "All" && <span> matching <strong>{selectedTech}</strong></span>}
        </div>
        {(searchQuery || selectedTech !== "All" || selectedStatus !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTech("All");
              setSelectedStatus("All");
            }}
            className="text-[#58a6ff] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="border border-[#30363d] rounded-lg p-12 text-center bg-[#161b22] space-y-3">
          <FolderGit2 className="w-10 h-10 mx-auto text-[#8b949e] opacity-40" />
          <h3 className="text-base font-semibold text-[#f0f6fc]">
            No repositories found
          </h3>
          <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
            No projects matched your active search filters. Try clearing filters or searching for another keyword.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTech("All");
              setSelectedStatus("All");
            }}
            className="px-4 py-1.5 text-xs font-semibold text-[#58a6ff] bg-[#21262d] border border-[#30363d] rounded hover:bg-[#30363d] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
