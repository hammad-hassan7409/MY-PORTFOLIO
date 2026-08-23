import React from "react";
import { Project } from "../types";
import { usePortfolio } from "../context/PortfolioContext";
import {
  Star,
  GitFork,
  ExternalLink,
  Github,
  Pin,
  PinOff,
  Eye,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, featured = false }) => {
  const { setSelectedProject, isAdmin, togglePinProject } = usePortfolio();

  return (
    <div
      id={`project-card-${project.id}`}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-lg border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/70 transition-all duration-200 hover:shadow-lg hover:shadow-[#58a6ff]/5 ${
        featured ? "bg-gradient-to-b from-[#161b22] to-[#0d1117]" : ""
      }`}
    >
      {/* Top Bar: Icon, Name, Pin / Badge */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedProject(project)}
              className="text-left font-semibold text-sm sm:text-base text-[#58a6ff] hover:underline flex items-center gap-1.5 group-hover:text-[#79b8ff] transition-colors cursor-pointer"
            >
              <span className="truncate">{project.name}</span>
            </button>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] font-mono bg-[#0d1117]">
              {project.status}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinProject(project.id);
                }}
                className={`p-1.5 rounded hover:bg-[#21262d] transition-colors ${
                  project.isPinned ? "text-amber-400" : "text-[#8b949e]"
                }`}
                title={project.isPinned ? "Unpin repository" : "Pin to overview"}
              >
                {project.isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-400/30" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={() => setSelectedProject(project)}
              className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d] transition-colors cursor-pointer"
              title="View full project details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Title */}
        <h3 className="text-xs font-semibold text-[#f0f6fc] mb-1.5">
          {project.displayName}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed mb-3">
          {project.description}
        </p>

        {/* Preview Thumbnail (If available and featured) */}
        {project.imageUrl && (
          <div
            onClick={() => setSelectedProject(project)}
            className="mb-3 rounded-md overflow-hidden border border-[#30363d] relative aspect-video bg-[#0d1117] cursor-pointer group-hover:border-[#58a6ff]/40 transition-colors"
          >
            <img
              src={project.imageUrl}
              alt={project.displayName}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
              <span className="text-[11px] text-[#f0f6fc] font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#58a6ff]" />
                <span>Click for architecture & screenshots</span>
              </span>
            </div>
          </div>
        )}

        {/* Tech Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[11px] px-2 py-0.5 rounded bg-[#21262d] text-[#c9d1d9] border border-[#30363d]/60 font-mono"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]/60">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Language Dot, Stars, Live and Source buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-[#30363d]/40 text-xs text-[#8b949e]">
        {/* Left: Language & Star count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: project.primaryLanguageColor || "#3178c6" }}
            />
            <span className="text-[#c9d1d9] font-medium">{project.primaryLanguage}</span>
          </div>

          <div className="flex items-center gap-1 hover:text-[#58a6ff]">
            <Star className="w-3.5 h-3.5 text-amber-400/80 fill-amber-400/20" />
            <span>{project.stars}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 hover:text-[#58a6ff]">
            <GitFork className="w-3.5 h-3.5" />
            <span>{project.forks}</span>
          </div>
        </div>

        {/* Right: Quick Action Links */}
        <div className="flex items-center gap-2">
          {project.liveUrl && (
            <a
              id={`live-demo-link-${project.id}`}
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors hover:text-[#58a6ff]"
              title="Open Live Demo"
            >
              <span>Live</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}

          {project.githubUrl && (
            <a
              id={`source-code-link-${project.id}`}
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors"
              title="View Source Code"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
