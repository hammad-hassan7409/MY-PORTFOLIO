import React, { useState, useEffect } from "react";
import { Project } from "../types";
import { usePortfolio } from "../context/PortfolioContext";
import {
  X,
  ExternalLink,
  Github,
  Star,
  GitFork,
  CheckCircle2,
  Cpu,
  Layers,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Edit3,
} from "lucide-react";

export const ProjectModal: React.FC = () => {
  const { selectedProject, setSelectedProject, isAdmin, setActiveTab } = usePortfolio();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, setSelectedProject]);

  if (!selectedProject) return null;

  const images =
    selectedProject.gallery && selectedProject.gallery.length > 0
      ? selectedProject.gallery
      : [selectedProject.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        id="project-detail-modal"
        className="relative w-full max-w-4xl bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#0d1117]/80 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: selectedProject.primaryLanguageColor || "#3178c6" }}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8b949e] font-mono">hammadhassan /</span>
              <h2 className="text-base font-bold text-[#f0f6fc] tracking-tight">
                {selectedProject.name}
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#58a6ff] bg-[#21262d] font-mono">
              {selectedProject.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setActiveTab("admin");
                }}
                className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 px-2.5 py-1 bg-[#21262d] rounded border border-[#30363d]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
            )}
            <button
              id="close-project-modal-btn"
              onClick={() => setSelectedProject(null)}
              className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Main Title & Action CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc]">
                {selectedProject.displayName}
              </h1>
              <p className="text-xs sm:text-sm text-[#8b949e] mt-1 flex items-center gap-2">
                <span>Primary stack: <strong className="text-[#c9d1d9]">{selectedProject.primaryLanguage}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  {selectedProject.stars} stars
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  {selectedProject.forks} forks
                </span>
              </p>
            </div>

            {/* Quick Action Links */}
            <div className="flex items-center gap-2.5 shrink-0">
              {selectedProject.liveUrl && (
                <a
                  id="modal-live-demo-cta"
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Live Demo</span>
                </a>
              )}
              {selectedProject.githubUrl && (
                <a
                  id="modal-source-code-cta"
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>View Repository</span>
                </a>
              )}
            </div>
          </div>

          {/* Screenshot Gallery & Carousel */}
          <div className="space-y-2">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117]">
              <img
                src={images[activeImageIndex]}
                alt={`${selectedProject.displayName} Screenshot ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#0d1117]/80 text-[#f0f6fc] hover:bg-[#0d1117] border border-[#30363d] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#0d1117]/80 text-[#f0f6fc] hover:bg-[#0d1117] border border-[#30363d] transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-12 rounded overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? "border-[#58a6ff] scale-95" : "border-[#30363d] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Deep Overview & Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#58a6ff]" />
              <span>Project Overview & Architecture</span>
            </h3>
            <p className="text-sm text-[#c9d1d9] leading-relaxed">
              {selectedProject.longDescription || selectedProject.description}
            </p>
          </div>

          {/* Key Web Development Highlights */}
          {selectedProject.highlights && selectedProject.highlights.length > 0 && (
            <div className="space-y-3 border-t border-[#30363d]/60 pt-4">
              <h3 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Key Development Highlights</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedProject.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-[#21262d]/50 border border-[#30363d]/40 text-xs text-[#c9d1d9]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#39d353] shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture Stack Breakdown */}
          {selectedProject.architecture && selectedProject.architecture.length > 0 && (
            <div className="space-y-3 border-t border-[#30363d]/60 pt-4">
              <h3 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#8957e5]" />
                <span>System Design & Implementation</span>
              </h3>
              <ul className="space-y-2">
                {selectedProject.architecture.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-xs text-[#c9d1d9] bg-[#0d1117] px-3 py-2 rounded border border-[#30363d]/50 font-mono"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies Used Badges */}
          <div className="space-y-3 border-t border-[#30363d]/60 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
              Technologies & Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedProject.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs rounded-md bg-[#21262d] text-[#58a6ff] border border-[#30363d] font-mono font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#30363d] bg-[#0d1117]/80 shrink-0 text-xs text-[#8b949e]">
          <span>Updated {selectedProject.updatedAt}</span>
          <button
            onClick={() => setSelectedProject(null)}
            className="px-3 py-1.5 text-xs font-medium text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
